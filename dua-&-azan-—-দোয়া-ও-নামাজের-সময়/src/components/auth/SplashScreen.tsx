import React, { useEffect } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1600);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-teal-900 via-teal-800 to-slate-950 text-white p-6 cursor-pointer select-none overflow-hidden animate-fadeIn"
    >
      {/* Background Decorative Rings */}
      <div className="absolute w-96 h-96 rounded-full border border-teal-500/20 animate-ping opacity-25 pointer-events-none" />
      <div className="absolute w-80 h-80 rounded-full border border-amber-400/20 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Center Islamic Emblem */}
      <div className="relative mb-6">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 flex items-center justify-center shadow-2xl shadow-amber-500/30 border-2 border-amber-200/50 transform hover:scale-105 transition duration-300">
          <span className="text-5xl sm:text-6xl drop-shadow-md">🕌</span>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-teal-700 border-2 border-white flex items-center justify-center text-amber-300 shadow-md">
          <span className="text-lg">🌙</span>
        </div>
      </div>

      {/* App Branding */}
      <div className="text-center space-y-2 z-10 max-w-xs">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-teal-100 to-amber-200 bg-clip-text text-transparent">
          Dua &amp; Azan
        </h1>
        <p className="text-sm font-medium text-teal-200/90 font-bengali">
          প্রতিদিনের সহীহ দোয়া ও নামাজের সঠিক সময়
        </p>
      </div>

      {/* Arabic Ayah Calligraphy */}
      <div className="mt-8 text-center px-4 z-10" dir="rtl">
        <p className="font-arabic text-lg sm:text-xl text-amber-300/90 tracking-wide font-medium">
          أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
        </p>
        <p className="text-xs text-teal-300/80 mt-1 font-bengali">
          "জেনে রাখো, আল্লাহর স্মরণেই কেবল অন্তরসমূহ প্রশান্ত হয়।"
        </p>
      </div>

      {/* Bottom Loading Dots */}
      <div className="absolute bottom-10 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

      <div className="absolute bottom-4 text-[10px] text-teal-300/60 font-bengali">
        ট্যাপ করে এগিয়ে যান
      </div>
    </div>
  );
};
