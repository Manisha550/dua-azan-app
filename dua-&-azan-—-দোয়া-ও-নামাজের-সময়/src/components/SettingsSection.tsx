import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Sliders,
  Volume2,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Check,
  Globe,
  Type,
  User,
  LogOut,
  HelpCircle,
  Shield,
  Monitor,
  Smartphone,
  Keyboard,
} from 'lucide-react';
import { UserSettings, Dua, UserSession } from '../types';
import { CITY_PRESETS, METHOD_LABELS } from '../services/prayerCalculation';
import { audioService } from '../services/audioService';

interface SettingsSectionProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  verifiedDuas: Dua[];
  onImportDuas: (duas: Dua[]) => void;
  currentUser?: UserSession | null;
  onLogout?: () => void;
  onReviewOnboarding?: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  settings,
  onUpdateSettings,
  verifiedDuas,
  onImportDuas,
  currentUser,
  onLogout,
  onReviewOnboarding,
}) => {
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Handle GPS location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage('আপনার ব্রাউজার ভৌগোলিক অবস্থান সমর্থন করে না।');
      return;
    }
    setGeoLoading(true);
    setGeoMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        onUpdateSettings({
          ...settings,
          lat,
          lng,
          cityName: 'আমার অবস্থান (GPS)',
        });
        setGeoMessage('অবস্থান সফলভাবে আপডেট করা হয়েছে!');
        setTimeout(() => setGeoMessage(null), 3500);
      },
      (err) => {
        setGeoLoading(false);
        setGeoMessage(`অবস্থান নির্ণয় ব্যর্থ: ${err.message}`);
        setTimeout(() => setGeoMessage(null), 4000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // City preset selection
  const handleSelectCity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = CITY_PRESETS.find((c) => c.name === e.target.value);
    if (selected) {
      onUpdateSettings({
        ...settings,
        lat: selected.lat,
        lng: selected.lng,
        cityName: `${selected.bnName} (${selected.country})`,
      });
    }
  };

  // Request notification permissions
  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        audioService.notify(
          'Dua & Azan নোটিফিকেশন সক্রিয়',
          'নামাজের ওয়াক্ত ও আযানের অ্যালার্ম যথাসময়ে জানানো হবে।'
        );
      }
    }
  };

  // Export verified duas to JSON
  const handleExportDuas = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(verifiedDuas, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'duas.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export settings / backup
  const handleExportBackup = () => {
    const fullBackup = {
      settings,
      customDuas: JSON.parse(localStorage.getItem('dua_extra_duas') || '[]'),
      favorites: JSON.parse(localStorage.getItem('dua_favorites') || '[]'),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'dua-azan-backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import custom duas file
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const list = Array.isArray(parsed) ? parsed : parsed.duas;
        if (Array.isArray(list)) {
          onImportDuas(list);
          setImportStatus(`${list.length}টি দোয়া সফলভাবে ইমপোর্ট হয়েছে!`);
          setTimeout(() => setImportStatus(null), 3500);
        } else {
          setImportStatus('ভুল ফরম্যাট: JSON ফাইলে দোয়ার অ্যারে থাকতে হবে।');
        }
      } catch {
        setImportStatus('JSON ফাইল পড়তে সমস্যা হয়েছে।');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Location Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          অবস্থান ও শহর নির্বাচন
        </h3>

        {/* City Preset */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            জনপ্রিয় শহর থেকে নির্বাচন করুন:
          </label>
          <select
            onChange={handleSelectCity}
            defaultValue=""
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="" disabled>
              -- শহর বেছে নিন --
            </option>
            {CITY_PRESETS.map((city) => (
              <option key={city.name} value={city.name}>
                {city.bnName} — {city.country} ({city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°)
              </option>
            ))}
          </select>
        </div>

        {/* Manual Latitude & Longitude */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              অক্ষাংশ (Latitude)
            </label>
            <input
              type="number"
              step="0.0001"
              value={settings.lat}
              onChange={(e) => onUpdateSettings({ ...settings, lat: parseFloat(e.target.value) || 0 })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              দ্রাঘিমাংশ (Longitude)
            </label>
            <input
              type="number"
              step="0.0001"
              value={settings.lng}
              onChange={(e) => onUpdateSettings({ ...settings, lng: parseFloat(e.target.value) || 0 })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-sm"
            />
          </div>
        </div>

        {/* Geolocation Button */}
        <div>
          <button
            onClick={handleGetLocation}
            disabled={geoLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-300/40 dark:border-teal-700/50 text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{geoLoading ? 'অবস্থান শনাক্ত করা হচ্ছে...' : 'আমার বর্তমান অবস্থান শনাক্ত করুন (GPS)'}</span>
          </button>

          {geoMessage && (
            <p className="mt-2 text-xs text-center font-medium text-teal-600 dark:text-teal-400 animate-fadeIn">
              {geoMessage}
            </p>
          )}
        </div>
      </div>

      {/* Prayer Calculation Method Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          হিসাব পদ্ধতি ও মাযহাব
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            হিসাব পদ্ধতি (Calculation Method)
          </label>
          <select
            value={settings.method}
            onChange={(e) => onUpdateSettings({ ...settings, method: Number(e.target.value) })}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-teal-500/20"
          >
            {Object.entries(METHOD_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-slate-400 mt-1 block">
            বাংলাদেশ, ভারত ও পাকিস্তানের জন্য Karachi (Univ. of Islamic Sciences) মানসম্মত।
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            আসর নামাজের মাযহাব (Juristic School)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onUpdateSettings({ ...settings, school: 1 })}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer text-xs ${
                settings.school === 1
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-bold shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              হানাফি (দ্বিগুণ ছায়া)
            </button>

            <button
              onClick={() => onUpdateSettings({ ...settings, school: 0 })}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer text-xs ${
                settings.school === 0
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-bold shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              শাফিঈ / অন্যান্য (একগুণ ছায়া)
            </button>
          </div>
        </div>
      </div>

      {/* Sound & Appearance */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          সাউন্ড, নোটিফিকেশন ও ফন্ট
        </h3>

        {/* Alert Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            আযান ও অ্যালার্মের সুর
          </label>
          <select
            value={settings.soundType}
            onChange={(e) =>
              onUpdateSettings({
                ...settings,
                soundType: e.target.value as 'azan' | 'melodic' | 'beep',
              })
            }
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
          >
            <option value="azan">আযান সুর (Bayati Adhan)</option>
            <option value="melodic">মৃদু বেল সুর (Melodic Chime)</option>
            <option value="beep">বিপ অ্যালার্ম (Beep Alert)</option>
          </select>
        </div>

        {/* Volume Slider */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            <span>সাউন্ড ভলিউম:</span>
            <span className="font-mono">{Math.round(settings.soundVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={settings.soundVolume}
            onChange={(e) =>
              onUpdateSettings({
                ...settings,
                soundVolume: parseFloat(e.target.value),
              })
            }
            className="w-full accent-teal-600 cursor-pointer"
          />
        </div>

        {/* Font Size Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            আরবি ও বাংলা লেখার সাইজ
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onUpdateSettings({ ...settings, fontSize: 'normal' })}
              className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-xs ${
                settings.fontSize === 'normal'
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-bold'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              স্বাভাবিক সাইজ
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, fontSize: 'large' })}
              className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-xs ${
                settings.fontSize === 'large'
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-bold'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              বড় সাইজ (সহজে পাঠযোগ্য)
            </button>
          </div>
        </div>

        {/* Test Azan & Enable Notifications */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleEnableNotifications}
            className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Bell className="w-4 h-4" />
            <span>🔔 ব্রাউজার নোটিফিকেশন অনুমোদন দিন</span>
          </button>

          <button
            onClick={() => audioService.playSound(settings.soundType, settings.soundVolume)}
            className="py-2.5 px-4 rounded-xl border border-teal-600 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Volume2 className="w-4 h-4" />
            <span>সাউন্ড টেস্ট করুন</span>
          </button>
        </div>
      </div>

      {/* Data Backup & Export Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          ডাটা ব্যাকআপ ও এক্সপোর্ট
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          যাচাইকৃত দোয়া এবং আপনার সংরক্ষিত কাস্টম দোয়া ও সেটিংস ব্যাকআপ ডাউনলোড বা এক্সপোর্ট করুন।
        </p>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            onClick={handleExportDuas}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>দোয়া এক্সপোর্ট (duas.json)</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>সম্পূর্ণ অ্যাপ ব্যাকআপ</span>
          </button>

          <label className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-indigo-500" />
            <span>কাস্টম দোয়া ইমপোর্ট (JSON)</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>
        </div>

        {importStatus && (
          <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold animate-fadeIn">
            {importStatus}
          </p>
        )}
      </div>

      {/* Account & Onboarding Management Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          ব্যবহারকারী অ্যাকাউন্ট ও অনবোর্ডিং
        </h3>

        {currentUser ? (
          <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {currentUser.name}
                </span>
                {currentUser.isGuest ? (
                  <span className="text-[10px] font-semibold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                    ডেমো / অতিথি মোড
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                    নিবন্ধিত ব্যবহারকারী
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{currentUser.email}</p>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="py-2 px-3.5 rounded-xl border border-rose-300 dark:border-rose-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>লগআউট / পরিবর্তন</span>
              </button>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500">কোনো সক্রিয় সেশন নেই।</p>
        )}

        <div className="pt-1">
          {onReviewOnboarding && (
            <button
              onClick={onReviewOnboarding}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>অনবোর্ডিং ভূমিকা ও নির্দেশিকা পুনরায় দেখুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Windows & Mobile Compatibility Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Monitor className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          Windows ও মোবাইল প্ল্যাটফর্ম সুবিধা (Dual Platform Support)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Windows Desktop Features */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm">
              <Monitor className="w-4 h-4" />
              <span>Windows PC ও ল্যাপটপ</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>
                  <strong>উইন্ডোজ অ্যাপ হিসেবে ইনস্টল:</strong> Edge বা Chrome ব্রাউজারের অ্যাড্রেস বারের
                  ইনস্টল বাটনে ক্লিক করে নেটিভ উইন্ডো আকারে ব্যবহার করুন।
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>
                  <strong>কীবোর্ড শর্টকাট:</strong> <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded text-[11px]">1-4</kbd> ট্যাব পরিবর্তন,{' '}
                  <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded text-[11px]">Space</kbd> তাসবিহ গণনা,{' '}
                  <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded text-[11px]">/</kbd> সার্চ ফোকাস,{' '}
                  <kbd className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded text-[11px]">T</kbd> তাসবিহ উইন্ডো।
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>
                  <strong>মাউস ও কীবোর্ড কম্পাস:</strong> ল্যাপটপ/পিসিতে হার্ডওয়্যার সেন্সর না থাকলেও
                  ইন্টারেক্টিভ স্লাইডারে কিবলা পরীক্ষা করা যায়।
                </span>
              </li>
            </ul>
          </div>

          {/* Mobile Phone Features */}
          <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/60 space-y-2.5">
            <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-sm">
              <Smartphone className="w-4 h-4 text-teal-600" />
              <span>স্মার্টফোন (Android ও iOS)</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>
                  <strong>ম্যাগনেটোমিটার কিবলা কম্পাস:</strong> মোবাইল ঘোরানোর সাথে সাথে রিয়েল-টাইমে পবিত্র কাবার
                  দিক নির্দেশ ও কম্পন (ভাইব্রেশন)।
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>
                  <strong>হ্যাপটিক ভাইব্রেশন:</strong> প্রতিটি জিকির কাউন্ট ও কিবলা লকে বাস্তবসম্মত স্পর্শানুভূতি।
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>
                  <strong>অফলাইন হোম স্ক্রিন PWA:</strong> ইন্টারনেট ছাড়াই মোবাইলের হোম স্ক্রিন থেকে ফুলস্ক্রিন
                  অ্যাপের মতো ব্যবহার।
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
