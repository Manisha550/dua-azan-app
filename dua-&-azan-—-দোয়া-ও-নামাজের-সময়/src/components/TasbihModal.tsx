import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { audioService } from '../services/audioService';

interface TasbihModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DhikrPreset {
  id: string;
  arabic: string;
  bengali: string;
  meaning: string;
  target: number;
}

const PRESETS: DhikrPreset[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللَّهِ',
    bengali: 'সুবহানাল্লাহ',
    meaning: 'আল্লাহ অতি পবিত্র ও নিষ্কলুষ',
    target: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    bengali: 'আলহামদুলিল্লাহ',
    meaning: 'সমস্ত প্রশংসা একমাত্র আল্লাহর',
    target: 33,
  },
  {
    id: 'allahuakbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    bengali: 'আল্লাহু আকবার',
    meaning: 'আল্লাহ সর্বশ্রেষ্ঠ',
    target: 34,
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    bengali: 'আস্তাগফিরুল্লাহ',
    meaning: 'আমি আল্লাহর নিকট ক্ষমা প্রার্থনা করছি',
    target: 100,
  },
  {
    id: 'tahlil',
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    bengali: 'লা ইলাহা ইল্লাল্লাহ',
    meaning: 'আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই',
    target: 100,
  },
  {
    id: 'durood',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    bengali: 'সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম',
    meaning: 'হে আল্লাহ, মুহাম্মাদের ওপর রহমত বর্ষণ করুন',
    target: 100,
  },
];

export const TasbihModal: React.FC<TasbihModalProps> = ({ isOpen, onClose }) => {
  const [selectedPreset, setSelectedPreset] = useState<DhikrPreset>(PRESETS[0]);
  const [count, setCount] = useState<number>(0);
  const [totalToday, setTotalToday] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('tasbih_total_today')) || 0;
    } catch {
      return 0;
    }
  });

  if (!isOpen) return null;

  const handleIncrement = () => {
    const nextCount = count + 1;
    setCount(nextCount);
    const nextTotal = totalToday + 1;
    setTotalToday(nextTotal);
    try {
      localStorage.setItem('tasbih_total_today', String(nextTotal));
    } catch {
      // ignore
    }

    // Haptic vibration
    audioService.vibrate([40]);

    // Soft click tone
    audioService.playAcousticTone(880, 0.08, 0.2);

    // Target reached celebratory chime
    if (nextCount === selectedPreset.target) {
      audioService.vibrate([100, 50, 100]);
      audioService.playAcousticTone(659.25, 0.8, 0.5);
    }
  };

  const handleReset = () => {
    setCount(0);
    audioService.vibrate([30]);
  };

  // Keyboard shortcut support for Windows / Desktop PC users
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleIncrement();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, count, totalToday, selectedPreset]);

  const progressPercent = Math.min(100, (count / selectedPreset.target) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-teal-500/30 rounded-3xl p-6 shadow-2xl relative flex flex-col text-slate-800 dark:text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">ডিজিটাল তাসবিহ</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                আজকের মোট জিকির: <span className="font-semibold text-teal-600 dark:text-teal-400">{totalToday}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="my-4">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
            জিকির নির্বাচন করুন:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPreset(p);
                  setCount(0);
                }}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer text-xs ${
                  selectedPreset.id === p.id
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="font-arabic text-sm text-teal-700 dark:text-teal-400">{p.arabic}</div>
                <div className="mt-0.5 font-medium">{p.bengali}</div>
                <div className="text-[10px] text-slate-400">টার্গেট: {p.target} বার</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Dhikr Display */}
        <div className="text-center py-3 px-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-500/20 mb-4">
          <p className="font-arabic text-3xl font-bold text-teal-800 dark:text-teal-300 mb-1" dir="rtl">
            {selectedPreset.arabic}
          </p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selectedPreset.bengali}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedPreset.meaning}</p>
        </div>

        {/* Big Tap Area / Circular Counter */}
        <div className="flex flex-col items-center justify-center my-4">
          <button
            onClick={handleIncrement}
            className="w-48 h-48 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 active:scale-95 text-white shadow-xl shadow-teal-700/30 flex flex-col items-center justify-center transition duration-150 cursor-pointer relative group select-none"
          >
            {/* Outer ring showing progress */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="#fde047"
                strokeWidth="4"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-200"
              />
            </svg>

            <span className="text-5xl font-extrabold tracking-tight font-mono">{count}</span>
            <span className="text-xs text-teal-100 uppercase tracking-widest mt-1">
              লক্ষ্য: {selectedPreset.target}
            </span>
            <span className="text-[11px] bg-black/20 px-2 py-0.5 rounded-full mt-2 font-medium">
              ট্যাপ করুন
            </span>
          </button>

          {count >= selectedPreset.target && (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              টার্গেট পূর্ণ হয়েছে! আলহামদুলিল্লাহ
            </div>
          )}

          <span className="hidden sm:inline-block text-[10px] text-slate-400 mt-2 font-mono">
            কীবোর্ড: [Space] বা [Enter] চেপে গণনা করুন | [Esc] বন্ধ
          </span>
        </div>

        {/* Counter controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            রিসেট (০)
          </button>

          <span className="text-xs text-slate-400">
            সম্পন্ন: {Math.floor(count / selectedPreset.target)} রাউন্ড
          </span>
        </div>
      </div>
    </div>
  );
};
