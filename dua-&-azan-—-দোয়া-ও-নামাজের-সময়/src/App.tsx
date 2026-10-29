import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { DuaSection } from './components/DuaSection';
import { PrayerTimesSection } from './components/PrayerTimesSection';
import { SettingsSection } from './components/SettingsSection';
import { AuditSection } from './components/AuditSection';
import { RingModal } from './components/RingModal';
import { TasbihModal } from './components/TasbihModal';
import { SplashScreen } from './components/auth/SplashScreen';
import { OnboardingScreens } from './components/auth/OnboardingScreens';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { SignUpScreen } from './components/auth/SignUpScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { ForgotPasswordScreen } from './components/auth/ForgotPasswordScreen';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Dua, UserSettings, PrayerTimes, PrayerEvent, PrayerKey, AppScreen, UserSession } from './types';
import {
  getAllDuasWithAudit,
  saveStoredCustomDuas,
  loadStoredCustomDuas,
  verifyAndApproveDua,
  autoVerifyEligibleDuas,
} from './data/duas';
import {
  getPrayerTimes,
  calculateTahajjudTime,
} from './services/prayerCalculation';
import { audioService } from './services/audioService';
import { authService } from './services/authService';
import { WifiOff } from 'lucide-react';

const DEFAULT_SETTINGS: UserSettings = {
  lat: 23.8103, // Dhaka coordinates by default
  lng: 90.4125,
  cityName: 'ঢাকা (বাংলাদেশ)',
  method: 1, // Karachi (Univ. of Islamic Sciences)
  school: 1, // Hanafi
  azan: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  tahajjud: {
    enabled: true,
    mode: 'lastThird',
    custom: '03:45',
  },
  alarms: [],
  soundType: 'azan',
  soundVolume: 0.85,
  theme: 'light',
  fontSize: 'normal',
};

const PRAYERS_LIST: Array<{ key: PrayerKey; label: string }> = [
  { key: 'fajr', label: 'ফজর' },
  { key: 'dhuhr', label: 'যোহর' },
  { key: 'asr', label: 'আসর' },
  { key: 'maghrib', label: 'মাগরিব' },
  { key: 'isha', label: 'এশা' },
];

export default function App() {
  const isOnline = useOnlineStatus();

  // App Navigation Flow State: 'splash' -> 'onboarding' -> 'welcome' -> ('login' | 'signup') -> 'main'
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => authService.getCurrentUser());

  // Main Tab State
  const [activeTab, setActiveTab] = useState<'duas' | 'times' | 'settings' | 'audit'>('duas');

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('dua_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // User Settings State
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('dua_azan_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          azan: { ...DEFAULT_SETTINGS.azan, ...(parsed.azan || {}) },
          tahajjud: { ...DEFAULT_SETTINGS.tahajjud, ...(parsed.tahajjud || {}) },
          alarms: Array.isArray(parsed.alarms) ? parsed.alarms : [],
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Duas & Favorites State
  const [allDuas, setAllDuas] = useState<Dua[]>(() => getAllDuasWithAudit());
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dua_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Prayer Timings State
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [tahajjudTime, setTahajjudTime] = useState<Date | null>(null);

  // Events & Scheduling State
  const [scheduledEvents, setScheduledEvents] = useState<PrayerEvent[]>([]);
  const [activeRingingEvent, setActiveRingingEvent] = useState<PrayerEvent | null>(null);
  const [nextEventText, setNextEventText] = useState<string>('নামাজের সময় লোড হচ্ছে...');
  const [isTasbihOpen, setIsTasbihOpen] = useState(false);

  // Apply Dark mode class to <html> / <body>
  useEffect(() => {
    try {
      localStorage.setItem('dua_theme', theme);
    } catch {
      // ignore
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle Splash Screen completion
  const handleSplashFinish = () => {
    const hasSeenOnboarding = authService.hasCompletedOnboarding();
    const activeSession = authService.getCurrentUser();

    if (!hasSeenOnboarding) {
      setCurrentScreen('onboarding');
    } else if (!activeSession) {
      setCurrentScreen('welcome');
    } else {
      setCurrentScreen('main');
    }
  };

  // Handle Onboarding completion
  const handleOnboardingFinish = () => {
    authService.setOnboardingCompleted(true);
    const activeSession = authService.getCurrentUser();
    if (activeSession) {
      setCurrentScreen('main');
    } else {
      setCurrentScreen('welcome');
    }
  };

  // Handle Guest Mode continue
  const handleContinueAsGuest = () => {
    const guestSession = authService.loginAsGuest();
    setCurrentUser(guestSession);
    setCurrentScreen('main');
  };

  // Handle Logout
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentScreen('welcome');
  };

  // Persist settings
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('dua_azan_settings', JSON.stringify(newSettings));
    } catch {
      // ignore
    }
  };

  // Toggle favorite dua
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('dua_favorites', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Add Custom Dua
  const handleAddCustomDua = (newDua: Dua) => {
    const existingCustom = loadStoredCustomDuas();
    const updatedCustom = [newDua, ...existingCustom];
    saveStoredCustomDuas(updatedCustom);
    setAllDuas(getAllDuasWithAudit());
  };

  // Delete Dua
  const handleDeleteDua = (id: string) => {
    const existingCustom = loadStoredCustomDuas();
    const filtered = existingCustom.filter((d) => d.id !== id);
    saveStoredCustomDuas(filtered);
    setAllDuas(getAllDuasWithAudit());
  };

  // Update Dua
  const handleUpdateDua = (updated: Dua) => {
    const existingCustom = loadStoredCustomDuas();
    const updatedList = existingCustom.map((d) => (d.id === updated.id ? updated : d));
    saveStoredCustomDuas(updatedList);
    setAllDuas(getAllDuasWithAudit());
  };

  // Verify & Approve Dua
  const handleVerifyDua = (id: string, verifierName?: string) => {
    const verifier = verifierName || (currentUser ? currentUser.name : 'যাচাইকারী');
    const updated = verifyAndApproveDua(id, verifier);
    setAllDuas(updated);
  };

  // Auto-scan and verify eligible Duas
  const handleAutoVerify = (verifierName?: string) => {
    const verifier = verifierName || (currentUser ? currentUser.name : 'অটো ভেরিফায়ার');
    const result = autoVerifyEligibleDuas(verifier);
    setAllDuas(result.updated);
  };

  // Import Duas JSON
  const handleImportDuas = (imported: Dua[]) => {
    const existingCustom = loadStoredCustomDuas();
    const combined = [...imported, ...existingCustom];
    saveStoredCustomDuas(combined);
    setAllDuas(getAllDuasWithAudit());
  };

  // Fetch / Compute Prayer Times & Generate Events
  const refreshPrayerTimes = useCallback(async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      const [yesterdayTimes, todayTimes] = await Promise.all([
        getPrayerTimes(yesterday, settings.lat, settings.lng, settings.method, settings.school),
        getPrayerTimes(today, settings.lat, settings.lng, settings.method, settings.school),
      ]);

      setPrayerTimes(todayTimes);

      // Compute Tahajjud Time
      let tjDate: Date;
      if (settings.tahajjud.mode === 'custom' && settings.tahajjud.custom) {
        const [hh, mm] = settings.tahajjud.custom.split(':').map(Number);
        tjDate = new Date(today);
        tjDate.setHours(hh || 3, mm || 30, 0, 0);
      } else {
        tjDate = calculateTahajjudTime(today, yesterdayTimes.maghrib, todayTimes.fajr);
      }
      setTahajjudTime(tjDate);

      // Build daily events
      const pad = (n: number) => String(n).padStart(2, '0');
      const ymd = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
      const evs: PrayerEvent[] = [];

      // Azan events
      PRAYERS_LIST.forEach((p, idx) => {
        const timeStr = todayTimes[p.key];
        if (timeStr && /^\d{2}:\d{2}$/.test(timeStr)) {
          const [h, m] = timeStr.split(':').map(Number);
          const at = new Date(today);
          at.setHours(h, m, 0, 0);
          evs.push({
            id: `${ymd}-${p.key}`,
            kind: 'azan',
            key: p.key,
            label: `${p.label} আযান`,
            at,
            on: !!settings.azan[p.key],
            code: idx,
          });
        }
      });

      // Tahajjud event
      evs.push({
        id: `${ymd}-tahajjud`,
        kind: 'tahajjud',
        label: 'তাহাজ্জুদের সময়',
        at: tjDate,
        on: settings.tahajjud.enabled,
        code: 5,
      });

      // Custom alarms
      const dayOfWeek = today.getDay();
      settings.alarms.forEach((a, idx) => {
        if (!a.days.length || a.days.includes(dayOfWeek)) {
          const [h, m] = a.time.split(':').map(Number);
          const at = new Date(today);
          at.setHours(h, m, 0, 0);
          evs.push({
            id: `${ymd}-alarm-${a.id}`,
            kind: 'alarm',
            label: a.label || 'অ্যালার্ম',
            at,
            on: a.on,
            code: 10 + idx,
          });
        }
      });

      evs.sort((a, b) => a.at.getTime() - b.at.getTime());
      setScheduledEvents(evs);
    } catch (err) {
      console.warn('Failed to refresh prayer times', err);
    }
  }, [settings.lat, settings.lng, settings.method, settings.school, settings.azan, settings.tahajjud, settings.alarms]);

  useEffect(() => {
    refreshPrayerTimes();
  }, [refreshPrayerTimes]);

  // Next upcoming prayer calculation
  const nextPrayerInfo = useMemo(() => {
    if (!prayerTimes) return null;
    const now = new Date();

    for (const p of PRAYERS_LIST) {
      const timeStr = prayerTimes[p.key];
      if (!timeStr) continue;
      const [h, m] = timeStr.split(':').map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(h, m, 0, 0);
      const diffMs = prayerDate.getTime() - now.getTime();

      if (diffMs > 0) {
        return {
          key: p.key,
          label: p.label,
          time: timeStr,
          diffMs,
        };
      }
    }

    // If all prayers today passed, return tomorrow's Fajr
    return {
      key: 'fajr',
      label: 'ফজর (আগামীকাল)',
      time: prayerTimes.fajr,
      diffMs: 0,
    };
  }, [prayerTimes]);

  // Main Background Tick (1 second interval for scheduler and live countdowns)
  useEffect(() => {
    const firedIds = new Set<string>();
    try {
      const saved = localStorage.getItem('dua_fired_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) parsed.forEach((id: string) => firedIds.add(id));
      }
    } catch {
      // ignore
    }

    const interval = window.setInterval(() => {
      const now = new Date();

      // Check events triggering
      for (const ev of scheduledEvents) {
        if (!ev.on || firedIds.has(ev.id)) continue;
        const diffMs = now.getTime() - ev.at.getTime();

        // If time matches within 60 seconds
        if (diffMs >= 0 && diffMs < 60000) {
          firedIds.add(ev.id);
          try {
            localStorage.setItem('dua_fired_events', JSON.stringify([...firedIds].slice(-100)));
          } catch {
            // ignore
          }

          // Trigger Sound & Ring Modal
          audioService.playSound(settings.soundType, settings.soundVolume);
          audioService.notify(ev.label, ev.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), ev.id);
          audioService.vibrate([500, 200, 500]);
          setActiveRingingEvent(ev);
        }
      }

      // Update countdown text
      const upcoming = scheduledEvents.find((e) => e.on && e.at.getTime() > now.getTime());
      if (upcoming) {
        const msRemaining = upcoming.at.getTime() - now.getTime();
        const hrs = Math.floor(msRemaining / 3600000);
        const mins = Math.floor((msRemaining % 3600000) / 60000);
        setNextEventText(
          `পরবর্তী: ${upcoming.label} — ${upcoming.at.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })} (${hrs > 0 ? `${hrs}ঘ ` : ''}${mins}মি বাকি)`
        );
      } else {
        setNextEventText('আজকের আর কোনো ওয়াক্ত বা অ্যালার্ম বাকি নেই');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [scheduledEvents, settings.soundType, settings.soundVolume]);

  // Register Service Worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service Worker registered successfully'))
        .catch((err) => console.warn('SW registration skipped', err));
    }
  }, []);

  // Windows & Desktop Keyboard Navigation (1-4 tabs, T for Tasbih, Esc to close)
  useEffect(() => {
    if (currentScreen !== 'main') return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      if (e.key === '1') {
        setActiveTab('duas');
      } else if (e.key === '2') {
        setActiveTab('times');
      } else if (e.key === '3') {
        setActiveTab('settings');
      } else if (e.key === '4') {
        setActiveTab('audit');
      } else if (e.key === 't' || e.key === 'T') {
        setIsTasbihOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setActiveRingingEvent(null);
        setIsTasbihOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentScreen]);

  // Dismiss Ring Modal
  const handleDismissRing = () => {
    audioService.stop();
    setActiveRingingEvent(null);
  };

  // Snooze Ring Modal for 5 minutes
  const handleSnoozeRing = () => {
    audioService.stop();
    if (activeRingingEvent) {
      const snoozedEvent: PrayerEvent = {
        ...activeRingingEvent,
        id: `${activeRingingEvent.id}-snooze-${Date.now()}`,
        at: new Date(Date.now() + 5 * 60000),
        on: true,
      };
      setScheduledEvents((prev) => [...prev, snoozedEvent]);
    }
    setActiveRingingEvent(null);
  };

  // Verified duas list
  const verifiedDuas = useMemo(() => {
    return allDuas.filter((d) => d.status === 'verified');
  }, [allDuas]);

  // Count of duas awaiting audit / verification
  const unverifiedCount = useMemo(() => {
    return allDuas.filter((d) => d.status !== 'verified').length;
  }, [allDuas]);

  // -------------------------------------------------------------
  // SCREEN ROUTING: Splash -> Onboarding -> Welcome -> Login/Signup -> Main
  // -------------------------------------------------------------

  // 1. Splash Screen
  if (currentScreen === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // 2. Onboarding Screens
  if (currentScreen === 'onboarding') {
    return <OnboardingScreens onFinish={handleOnboardingFinish} />;
  }

  // 3. Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <WelcomeScreen
        onNavigateToSignUp={() => setCurrentScreen('signup')}
        onNavigateToLogin={() => setCurrentScreen('login')}
        onContinueAsGuest={handleContinueAsGuest}
        onReviewOnboarding={() => setCurrentScreen('onboarding')}
      />
    );
  }

  // 4. Sign Up Screen
  if (currentScreen === 'signup') {
    return (
      <SignUpScreen
        onSuccess={() => {
          setCurrentUser(authService.getCurrentUser());
          setCurrentScreen('main');
        }}
        onNavigateToLogin={() => setCurrentScreen('login')}
        onNavigateBack={() => setCurrentScreen('welcome')}
      />
    );
  }

  // 5. Login Screen
  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onSuccess={() => {
          setCurrentUser(authService.getCurrentUser());
          setCurrentScreen('main');
        }}
        onNavigateToSignUp={() => setCurrentScreen('signup')}
        onNavigateToForgotPassword={() => setCurrentScreen('forgot_password')}
        onContinueAsGuest={handleContinueAsGuest}
        onNavigateBack={() => setCurrentScreen('welcome')}
      />
    );
  }

  // 6. Forgot Password Screen
  if (currentScreen === 'forgot_password') {
    return (
      <ForgotPasswordScreen
        onNavigateToLogin={() => setCurrentScreen('login')}
        onNavigateBack={() => setCurrentScreen('login')}
      />
    );
  }

  // 7. Main Protected Application Screen
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col antialiased">
      {/* Offline Status Toast */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-1.5 text-xs font-semibold text-center flex items-center justify-center gap-2 sticky top-0 z-50 shadow-xs">
          <WifiOff className="w-3.5 h-3.5" />
          <span>অফলাইন মোড — সংরক্ষিত তথ্য ও নির্ভুল অ্যালগরিদম ব্যবহৃত হচ্ছে।</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        nextEventText={nextEventText}
        theme={theme}
        setTheme={setTheme}
        onOpenTasbih={() => setIsTasbihOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        unverifiedAuditCount={unverifiedCount}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8">
        {activeTab === 'duas' && (
          <DuaSection
            duas={verifiedDuas}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddCustomDua={handleAddCustomDua}
            fontSize={settings.fontSize}
            currentUser={currentUser}
            unverifiedCount={unverifiedCount}
            onNavigateToAudit={() => setActiveTab('audit')}
          />
        )}

        {activeTab === 'times' && (
          <PrayerTimesSection
            times={prayerTimes}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            nextPrayer={nextPrayerInfo}
            tahajjudTime={tahajjudTime}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsSection
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            verifiedDuas={verifiedDuas}
            onImportDuas={handleImportDuas}
            currentUser={currentUser}
            onLogout={handleLogout}
            onReviewOnboarding={() => setCurrentScreen('onboarding')}
          />
        )}

        {activeTab === 'audit' && (
          <AuditSection
            allDuas={allDuas}
            onUpdateDua={handleUpdateDua}
            onDeleteDua={handleDeleteDua}
            onVerifyDua={handleVerifyDua}
            onAutoVerify={handleAutoVerify}
            currentUser={currentUser}
            onOpenAddModal={() => setActiveTab('duas')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-teal-800 dark:text-teal-400">
            🕌 Dua &amp; Azan — সহীহ দোয়া ও নামাজের সময়সূচি
          </p>
          <p className="text-[11px] text-slate-400">
            সমস্ত দোয়া কুরআন ও বিশুদ্ধ হাদিস অনুসারে পরীক্ষিত। অফলাইন ও পিডব্লিউএ বান্ধব।
          </p>
        </div>
      </footer>

      {/* Ring Modal when Azan or Alarm fires */}
      <RingModal
        event={activeRingingEvent}
        onDismiss={handleDismissRing}
        onSnooze={handleSnoozeRing}
      />

      {/* Digital Tasbih Modal */}
      <TasbihModal isOpen={isTasbihOpen} onClose={() => setIsTasbihOpen(false)} />
    </div>
  );
}
