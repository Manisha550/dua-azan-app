import React, { useState } from 'react';
import { ArrowRight, ChevronRight, Check } from 'lucide-react';

interface OnboardingScreensProps {
  onFinish: () => void;
}

interface StepData {
  title: string;
  arabicVerse: string;
  arabicRef: string;
  description: string;
  badge: string;
  illustration: React.ReactNode;
}

export const OnboardingScreens: React.FC<OnboardingScreensProps> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps: StepData[] = [
    {
      title: 'প্রতিদিনের দোয়া ও যিকির',
      arabicVerse: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
      arabicRef: 'সূরা আর-রাদ: ২৮',
      description:
        'কুরআন ও বিশুদ্ধ হাদিসের নির্ভরযোগ্য রেফারেন্স সম্বলিত সহীহ দোয়ার সুবিশাল ভাণ্ডার। প্রতিটি দোয়ার সাথে সঠিক উচ্চারণ, বাংলা অর্থ, আমলের প্রেক্ষাপট ও সংখ্যা উল্লেখ রয়েছে।',
      badge: 'সহীহ দোয়া সংগ্রহ',
      illustration: (
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center">
          {/* Outer glow circle */}
          <div className="absolute inset-0 rounded-full bg-teal-500/15 dark:bg-teal-500/10 blur-xl animate-pulse" />
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-gradient-to-br from-teal-700 to-teal-900 border border-teal-500/30 flex flex-col items-center justify-center shadow-xl p-4 text-center">
            <span className="text-5xl sm:text-6xl mb-2 drop-shadow-md">📖</span>
            <div className="w-12 h-1 bg-amber-400 rounded-full mb-2" />
            <span className="text-xs font-semibold text-amber-200">কুরআন ও হাদিস ভিত্তিক</span>
          </div>
          {/* Floating badge */}
          <div className="absolute -bottom-2 right-4 bg-amber-500 text-slate-950 font-bold text-xs py-1 px-3 rounded-full shadow-md flex items-center gap-1">
            <span>✓ শতভাগ যাচাইকৃত</span>
          </div>
        </div>
      ),
    },
    {
      title: 'নামাজের সময় ও আযানের স্মরণ',
      arabicVerse: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا',
      arabicRef: 'সূরা আন-নিসা: ১০৩',
      description:
        'আপনার অবস্থানের ওপর ভিত্তি করে পাঁচ ওয়াক্ত নামাজের নিখুঁত সময়সূচি, পরবর্তী ওয়াক্তের লাইভ কাউন্টডাউন, তাহাজ্জুদের বরকতময় মুহূর্তের অ্যালার্ম এবং রিয়েল-টাইম কিবলা কম্পাস।',
      badge: 'নামাজ ও কিবলা',
      illustration: (
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/15 dark:bg-amber-500/10 blur-xl animate-pulse" />
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-gradient-to-br from-teal-800 to-slate-900 border border-amber-500/30 flex flex-col items-center justify-center shadow-xl p-4 text-center">
            <span className="text-5xl sm:text-6xl mb-2 drop-shadow-md">🕌</span>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-mono font-bold">
              <span>⏰ ওয়াক্তের হিসাব</span>
              <span>•</span>
              <span>🧭 কিবলা</span>
            </div>
          </div>
          <div className="absolute -top-2 left-4 bg-teal-600 text-white font-bold text-xs py-1 px-3 rounded-full shadow-md">
            <span>🌙 তাহাজ্জুদ অ্যালার্ম</span>
          </div>
        </div>
      ),
    },
    {
      title: 'আপনার দৈনন্দিন ইবাদতের সঙ্গী',
      arabicVerse: 'وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ',
      arabicRef: 'সূরা গাফির: ৬০',
      description:
        'ডিজিটাল তাসবিহ কাউন্টার, ব্যক্তিগত অ্যালার্ম রিমাইন্ডার এবং ১০০% অফলাইন সাপোর্ট। ইন্টারনেট না থাকলেও সম্পূর্ণ নির্ভুল অ্যাস্ট্রোনমিক্যাল ইঞ্জিনে অ্যাপটি নিরবচ্ছিন্ন কাজ করে।',
      badge: 'ডিজিটাল ইবাদত',
      illustration: (
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-teal-500/15 dark:bg-teal-500/10 blur-xl animate-pulse" />
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-950 border border-emerald-500/30 flex flex-col items-center justify-center shadow-xl p-4 text-center">
            <span className="text-5xl sm:text-6xl mb-2 drop-shadow-md">📿</span>
            <div className="w-12 h-1 bg-amber-400 rounded-full mb-2" />
            <span className="text-xs font-semibold text-emerald-200">ডিজিটাল তাসবিহ ও অফলাইন PWA</span>
          </div>
          <div className="absolute -bottom-2 left-4 bg-indigo-600 text-white font-bold text-xs py-1 px-3 rounded-full shadow-md">
            <span>⚡ ১০০% অফলাইন বান্ধব</span>
          </div>
        </div>
      ),
    },
  ];

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onFinish();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between p-5 sm:p-8 max-w-lg mx-auto select-none animate-fadeIn">
      {/* Top Header: Skip Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🕌</span>
          <span className="font-bold text-teal-800 dark:text-teal-400 text-sm">Dua &amp; Azan</span>
        </div>

        <button
          onClick={onFinish}
          className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 py-1.5 px-3 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          স্কিপ করুন (Skip)
        </button>
      </div>

      {/* Center Content */}
      <div className="my-auto py-6 space-y-6 text-center">
        {/* Illustration */}
        <div className="mb-4">{step.illustration}</div>

        {/* Badge */}
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 mb-3">
            {step.badge}
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {step.title}
          </h2>
        </div>

        {/* Arabic Verse Quote */}
        <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-500/20 max-w-sm mx-auto space-y-1">
          <p className="font-arabic text-lg sm:text-xl font-bold text-teal-900 dark:text-teal-200" dir="rtl">
            {step.arabicVerse}
          </p>
          <p className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">{step.arabicRef}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
          {step.description}
        </p>
      </div>

      {/* Bottom Controls: Step Dots & Next/Get Started */}
      <div className="pb-4 space-y-6">
        {/* Step Indicator Dots */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentStep
                  ? 'w-8 bg-teal-600 dark:bg-teal-400'
                  : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
              }`}
              aria-label={`স্ক্রিন ${i + 1}`}
            />
          ))}
        </div>

        {/* Next / Get Started Action Button */}
        <div>
          <button
            onClick={handleNext}
            className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-base shadow-lg shadow-teal-700/25 active:scale-98 transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isLast ? 'শুরু করুন (Get Started)' : 'পরবর্তী (Next)'}</span>
            {isLast ? <Check className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
