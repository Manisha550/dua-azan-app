import React, { useState } from 'react';
import {
  Clock,
  Bell,
  BellOff,
  Moon,
  Compass,
  Calendar,
  MapPin,
  Trash2,
  Plus,
  Info,
  Sun,
  Sunset,
  Sunrise,
} from 'lucide-react';
import { PrayerTimes, UserSettings, CustomAlarm, PrayerKey } from '../types';
import { calculateQiblaBearing } from '../services/prayerCalculation';
import { QiblaCompass } from './QiblaCompass';

interface PrayerTimesSectionProps {
  times: PrayerTimes | null;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  nextPrayer: { key: string; label: string; time: string; diffMs: number } | null;
  tahajjudTime: Date | null;
}

const PRAYER_METADATA: Array<{
  key: PrayerKey;
  en: string;
  bn: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'fajr', en: 'Fajr', bn: 'ফজর', icon: Sunrise },
  { key: 'dhuhr', en: 'Dhuhr', bn: 'যোহর', icon: Sun },
  { key: 'asr', en: 'Asr', bn: 'আসর', icon: Sun },
  { key: 'maghrib', en: 'Maghrib', bn: 'মাগরিব', icon: Sunset },
  { key: 'isha', en: 'Isha', bn: 'এশা', icon: Moon },
];

export const PrayerTimesSection: React.FC<PrayerTimesSectionProps> = ({
  times,
  settings,
  onUpdateSettings,
  nextPrayer,
  tahajjudTime,
}) => {
  const [alarmTime, setAlarmTime] = useState('');
  const [alarmLabel, setAlarmLabel] = useState('');

  // Toggle Azan for a specific prayer
  const handleToggleAzan = (key: string) => {
    onUpdateSettings({
      ...settings,
      azan: {
        ...settings.azan,
        [key]: !settings.azan[key],
      },
    });
  };

  // Add custom alarm
  const handleAddAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alarmTime) return;

    const newAlarm: CustomAlarm = {
      id: Date.now().toString(36),
      time: alarmTime,
      label: alarmLabel.trim() || 'দৈনিক অ্যালার্ম',
      on: true,
      days: [],
    };

    onUpdateSettings({
      ...settings,
      alarms: [...settings.alarms, newAlarm],
    });

    setAlarmTime('');
    setAlarmLabel('');
  };

  // Toggle existing custom alarm
  const handleToggleAlarm = (id: string) => {
    onUpdateSettings({
      ...settings,
      alarms: settings.alarms.map((a) => (a.id === id ? { ...a, on: !a.on } : a)),
    });
  };

  // Delete custom alarm
  const handleDeleteAlarm = (id: string) => {
    onUpdateSettings({
      ...settings,
      alarms: settings.alarms.filter((a) => a.id !== id),
    });
  };

  // Qibla bearing calculation
  const qiblaBearing = calculateQiblaBearing(settings.lat, settings.lng);

  // Time formatting helper
  const formatCountdown = (diffMs: number) => {
    if (diffMs <= 0) return 'সময় চলমান';
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours > 0 ? `${hours} ঘণ্টা ` : ''}${minutes} মিনিট বাকি`;
  };

  // Current Gregorian & Bengali formatted date
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('bn-BD', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Date & Location Header Card */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-950 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-teal-200 text-xs font-medium mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateFormatted}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <span>নামাজের সময়সূচি</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-700/80 border border-teal-500/40 text-teal-100 font-normal">
                {settings.school === 1 ? 'হানাফি' : 'শাফিঈ'}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-teal-900/80 border border-teal-700/60 rounded-2xl px-3.5 py-2">
            <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-white block">{settings.cityName}</span>
              <span className="text-teal-200 text-[11px]">
                {settings.lat.toFixed(2)}° N, {settings.lng.toFixed(2)}° E
              </span>
            </div>
          </div>
        </div>

        {/* Next Prayer Countdown Hero */}
        {nextPrayer && (
          <div className="mt-5 pt-4 border-t border-teal-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-teal-900/40 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-amber-200 font-semibold uppercase tracking-wider block">
                  পরবর্তী ওয়াক্ত
                </span>
                <span className="text-lg sm:text-xl font-bold">{nextPrayer.label}</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">
                {nextPrayer.time}
              </div>
              <span className="text-xs text-teal-100/90 font-medium bg-teal-800/80 px-2 py-0.5 rounded-md inline-block mt-0.5">
                {formatCountdown(nextPrayer.diffMs)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5 Daily Prayers List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
          <span>পাঁচ ওয়াক্তের সময়</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            আযান নোটিফিকেশন টগল করুন
          </span>
        </h3>

        {!times ? (
          <div className="text-center py-8 text-slate-400 text-sm">নামাজের সময় লোড হচ্ছে...</div>
        ) : (
          <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800">
            {PRAYER_METADATA.map((p) => {
              const timeVal = times[p.key] || '--:--';
              const isEnabled = !!settings.azan[p.key];
              const isNext = nextPrayer?.key === p.key;
              const IconComp = p.icon;

              return (
                <div
                  key={p.key}
                  className={`py-3.5 px-3 rounded-2xl flex items-center justify-between gap-3 transition ${
                    isNext
                      ? 'bg-teal-50/80 dark:bg-teal-950/40 border border-teal-500/30 font-semibold'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isNext
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                          {p.bn}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                          ({p.en})
                        </span>
                      </div>
                      {isNext && (
                        <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                          পরবর্তী ওয়াক্ত
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {timeVal}
                    </span>

                    <button
                      onClick={() => handleToggleAzan(p.key)}
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        isEnabled
                          ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                      title={isEnabled ? 'আযান চালু আছে' : 'আযান বন্ধ আছে'}
                      aria-label={`${p.bn} আযান টগল`}
                    >
                      {isEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Sunrise / Ishraq indicator */}
            <div className="py-2 px-3 text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sunrise className="w-3.5 h-3.5 text-amber-500" /> সূর্যোদয় (Sunrise / ইশরাক)
              </span>
              <span className="font-mono font-medium">{times.sunrise || '--:--'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tahajjud Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">তাহাজ্জুদ নামাজ</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                রাতের শেষ তৃতীয়াংশের বরকতময় মুহূর্ত
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.tahajjud.enabled}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  tahajjud: { ...settings.tahajjud, enabled: e.target.checked },
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>

        {/* Calculation Mode Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
            <input
              type="radio"
              name="tahajjudMode"
              value="lastThird"
              checked={settings.tahajjud.mode === 'lastThird'}
              onChange={() =>
                onUpdateSettings({
                  ...settings,
                  tahajjud: { ...settings.tahajjud, mode: 'lastThird' },
                })
              }
              className="text-teal-600 focus:ring-teal-500"
            />
            <div className="text-xs">
              <span className="font-semibold block text-slate-800 dark:text-slate-200">
                রাতের শেষ তৃতীয়াংশ (অটো হিসাব)
              </span>
              <span className="text-slate-400">মাগরিব ও ফজরের মধ্যবর্তী নির্ভুল সময়</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
            <input
              type="radio"
              name="tahajjudMode"
              value="custom"
              checked={settings.tahajjud.mode === 'custom'}
              onChange={() =>
                onUpdateSettings({
                  ...settings,
                  tahajjud: { ...settings.tahajjud, mode: 'custom' },
                })
              }
              className="text-teal-600 focus:ring-teal-500"
            />
            <div className="text-xs">
              <span className="font-semibold block text-slate-800 dark:text-slate-200">
                নিজের নির্দিষ্ট সময়
              </span>
              <span className="text-slate-400">পছন্দমতো অ্যালার্ম নির্ধারণ করুন</span>
            </div>
          </label>
        </div>

        {settings.tahajjud.mode === 'custom' && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              অ্যালার্মের সময়:
            </span>
            <input
              type="time"
              value={settings.tahajjud.custom}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  tahajjud: { ...settings.tahajjud, custom: e.target.value },
                })
              }
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-sm"
            />
          </div>
        )}

        {/* Calculated Time Banner */}
        {tahajjudTime && settings.tahajjud.mode === 'lastThird' && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
              আজ রাতে শেষ তৃতীয়াংশ শুরু:
            </span>
            <span className="font-mono text-base font-bold text-indigo-700 dark:text-indigo-300">
              {tahajjudTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {/* Quran & Hadith citations regarding Tahajjud */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 space-y-2">
          <p className="font-arabic text-lg text-right text-teal-900 dark:text-teal-200" dir="rtl">
            وَمِنَ اللَّيْلِ فَتَهَجَّدْ بِهِ نَافِلَةً لَّكَ عَسَىٰ أَن يَبْعَثَكَ رَبُّكَ مَقَامًا مَّحْمُودًا
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            "আর রাতের কিছু অংশে তাহাজ্জুদ আদায় করুন; এটি আপনার জন্য অতিরিক্ত (নফল)। আশা করা যায়, আপনার
            রব আপনাকে প্রশংসিত স্থানে (মাকামে মাহমুদ) পৌঁছাবেন।"
          </p>
          <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">📖 সূরা বনি ইসরাঈল ১৭:৭৯</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <strong>হাদিসের বাণী:</strong> রাতের শেষ তৃতীয়াংশ অবশিষ্ট থাকতে আল্লাহ তাআলা নিকটবর্তী আসমানে
            অবতরণ করেন এবং ঘোষণা দেন—কে আমাকে ডাকবে আমি তার ডাকে সাড়া দেব? কে আমার কাছে চাইবে আমি তাকে দান
            করব? কে আমার কাছে ক্ষমা চাইবে আমি তাকে ক্ষমা করব?
          </p>
          <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
            📖 সহীহ আল-বুখারী ১১৪৫, সহীহ মুসলিম ৭৫৮
          </p>
        </div>
      </div>

      {/* Qibla Compass using Magnetometer API */}
      <QiblaCompass
        lat={settings.lat}
        lng={settings.lng}
        cityName={settings.cityName}
        qiblaBearing={qiblaBearing}
      />

      {/* Custom Alarms Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          কাস্টম অ্যালার্ম ও রিমাইন্ডার
        </h3>

        {/* Add Alarm Form */}
        <form onSubmit={handleAddAlarm} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="time"
            required
            value={alarmTime}
            onChange={(e) => setAlarmTime(e.target.value)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono"
          />
          <input
            type="text"
            placeholder="অ্যালার্মের নাম (যেমন: ফজর পূর্বে, কোরআন তিলাওয়াত)"
            value={alarmLabel}
            onChange={(e) => setAlarmLabel(e.target.value)}
            className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
          />
          <button
            type="submit"
            className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>যোগ করুন</span>
          </button>
        </form>

        {/* Existing Alarms List */}
        <div className="space-y-2 pt-2">
          {settings.alarms.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-3">কোনো কাস্টম অ্যালার্ম সেট করা নেই</p>
          ) : (
            settings.alarms.map((alarm) => (
              <div
                key={alarm.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                    {alarm.time}
                  </span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {alarm.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={alarm.on}
                    onChange={() => handleToggleAlarm(alarm.id)}
                    className="w-4 h-4 text-teal-600 rounded-sm cursor-pointer"
                  />
                  <button
                    onClick={() => handleDeleteAlarm(alarm.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
