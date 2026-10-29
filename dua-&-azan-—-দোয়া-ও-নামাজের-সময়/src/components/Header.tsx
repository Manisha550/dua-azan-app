import { Sparkles, Moon, Sun, Volume2, ShieldCheck, Compass, LogOut, User } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { audioService } from '../services/audioService';
import { UserSession } from '../types';

interface HeaderProps {
  activeTab: 'duas' | 'times' | 'settings' | 'audit';
  setActiveTab: (tab: 'duas' | 'times' | 'settings' | 'audit') => void;
  nextEventText: string;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  onOpenTasbih: () => void;
  currentUser: UserSession | null;
  onLogout: () => void;
  unverifiedAuditCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  nextEventText,
  theme,
  setTheme,
  onOpenTasbih,
  currentUser,
  onLogout,
  unverifiedAuditCount = 0,
}) => {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleTestAzan = () => {
    audioService.testAzan();
  };

  return (
    <header className="sticky top-0 z-40 bg-teal-800 dark:bg-slate-900 border-b border-teal-700/50 dark:border-slate-800 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 pt-3 pb-2 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xl shadow-md shadow-amber-500/20">
              🕌
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Dua &amp; Azan
                <span className="text-xs font-normal text-teal-200 dark:text-teal-400 bg-teal-900/60 dark:bg-teal-950 px-2 py-0.5 rounded-full border border-teal-600/40">
                  দোয়া ও আযান
                </span>
              </h1>
              <p className="text-xs text-teal-100/80 dark:text-slate-400 line-clamp-1">
                {nextEventText || 'আজকের নামাজের সময়সূচি ও সহীহ দোয়া'}
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2">
            <PWAInstallButton />

            {/* Tasbih Shortcut */}
            <button
              onClick={onOpenTasbih}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-teal-700/80 hover:bg-teal-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-teal-100 transition cursor-pointer"
              title="ডিজিটাল তাসবিহ খুলুন"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">তাসবিহ</span>
            </button>

            {/* Quick Test Azan */}
            <button
              onClick={handleTestAzan}
              className="p-2 rounded-full bg-teal-700/80 hover:bg-teal-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-100 transition cursor-pointer"
              title="টেস্ট আযান শুনুন"
              aria-label="টেস্ট আযান শুনুন"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-teal-700/80 hover:bg-teal-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-100 transition cursor-pointer"
              title="ডার্ক / লাইট থিম পরিবর্তন"
              aria-label="ডার্ক / লাইট থিম পরিবর্তন"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-teal-200" />
              )}
            </button>

            {/* User Session & Logout */}
            {currentUser && (
              <div className="flex items-center gap-1 pl-1 border-l border-teal-600/50 dark:border-slate-700">
                <div
                  className="hidden md:flex items-center gap-1.5 py-1 px-2 rounded-lg bg-teal-900/60 dark:bg-slate-800 text-[11px] font-medium text-teal-200"
                  title={currentUser.email}
                >
                  <User className="w-3 h-3 text-amber-300" />
                  <span className="max-w-[80px] truncate">{currentUser.name}</span>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 rounded-full bg-teal-700/80 hover:bg-rose-600 dark:bg-slate-800 dark:hover:bg-rose-600 text-teal-100 transition cursor-pointer"
                  title="লগআউট / অ্যাকাউন্ট পরিবর্তন"
                  aria-label="লগআউট"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 mt-3 pt-1 border-t border-teal-700/40 dark:border-slate-800/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('duas')}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'duas'
                ? 'bg-white text-teal-900 shadow-sm dark:bg-teal-600 dark:text-white'
                : 'text-teal-100 hover:bg-teal-700/60 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <span>📖</span>
            <span>দোয়া ভাণ্ডার</span>
            <kbd className="hidden lg:inline-block text-[9px] px-1 py-0.2 rounded font-mono bg-black/15 opacity-70">
              1
            </kbd>
          </button>

          <button
            onClick={() => setActiveTab('times')}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'times'
                ? 'bg-white text-teal-900 shadow-sm dark:bg-teal-600 dark:text-white'
                : 'text-teal-100 hover:bg-teal-700/60 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <span>🕌</span>
            <span>নামাজ ও অ্যালার্ম</span>
            <kbd className="hidden lg:inline-block text-[9px] px-1 py-0.2 rounded font-mono bg-black/15 opacity-70">
              2
            </kbd>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-white text-teal-900 shadow-sm dark:bg-teal-600 dark:text-white'
                : 'text-teal-100 hover:bg-teal-700/60 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <span>⚙️</span>
            <span>সেটিংস ও হিসাব</span>
            <kbd className="hidden lg:inline-block text-[9px] px-1 py-0.2 rounded font-mono bg-black/15 opacity-70">
              3
            </kbd>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-white text-teal-900 shadow-sm dark:bg-teal-600 dark:text-white'
                : 'text-teal-100 hover:bg-teal-700/60 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>যাচাইকরণ অডিট</span>
            {unverifiedAuditCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 font-mono">
                {unverifiedAuditCount}
              </span>
            )}
            <kbd className="hidden lg:inline-block text-[9px] px-1 py-0.2 rounded font-mono bg-black/15 opacity-70">
              4
            </kbd>
          </button>
        </nav>
      </div>
    </header>
  );
};
