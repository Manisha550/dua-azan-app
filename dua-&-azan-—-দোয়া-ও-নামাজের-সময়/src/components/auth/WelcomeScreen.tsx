import React from 'react';
import { UserPlus, LogIn, UserCheck, Shield, Sparkles, Info } from 'lucide-react';
import { authService } from '../../services/authService';

interface WelcomeScreenProps {
  onNavigateToSignUp: () => void;
  onNavigateToLogin: () => void;
  onContinueAsGuest: () => void;
  onReviewOnboarding: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNavigateToSignUp,
  onNavigateToLogin,
  onContinueAsGuest,
  onReviewOnboarding,
}) => {
  const isFirebase = authService.isFirebaseConfigured();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between p-6 sm:p-8 max-w-md mx-auto select-none animate-fadeIn">
      {/* Top Branding */}
      <div className="pt-4 text-center space-y-3">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 flex items-center justify-center shadow-xl shadow-amber-500/20 border-2 border-amber-200/60 mb-2">
          <span className="text-4xl">🕌</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Dua &amp; Azan-এ স্বাগতম
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
          আপনার আত্মিক প্রশান্তি ও নিয়মিত আমলের জন্য সহীহ দোয়া এবং নামাজের সঠিক সময়সূচির ডিজিটাল মাধ্যম।
        </p>
      </div>

      {/* Center Islamic Quote */}
      <div className="my-6 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-500/30 text-center space-y-1">
        <p className="font-arabic text-base sm:text-lg font-bold text-teal-900 dark:text-teal-200" dir="rtl">
          رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ
        </p>
        <p className="text-[11px] text-teal-700 dark:text-teal-400">
          "হে আমাদের রব, আমাদের থেকে কবুল করুন; নিশ্চয় আপনি সর্বশ্রোতা, সর্বজ্ঞ।"
        </p>
      </div>

      {/* Action Buttons Section */}
      <div className="space-y-3.5 pb-2">
        {/* Sign Up Button */}
        <button
          onClick={onNavigateToSignUp}
          className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-sm sm:text-base shadow-md shadow-teal-700/20 flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer"
        >
          <UserPlus className="w-5 h-5" />
          <span>নতুন অ্যাকাউন্ট তৈরি করুন</span>
        </button>

        {/* Login Button */}
        <button
          onClick={onNavigateToLogin}
          className="w-full py-3.5 px-6 rounded-2xl border-2 border-teal-600 dark:border-teal-500 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer"
        >
          <LogIn className="w-5 h-5" />
          <span>লগইন করুন</span>
        </button>

        {/* Guest Mode Divider */}
        <div className="relative py-2 flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-slate-50 dark:bg-slate-950 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
            অথবা
          </span>
        </div>

        {/* Guest / Demo Testing Button */}
        <button
          onClick={onContinueAsGuest}
          className="w-full py-3 px-5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-400/40 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>অতিথি / ডেমো হিসেবে প্রবেশ করুন (Guest Mode)</span>
        </button>

        {/* Backend Transparency Notice */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {isFirebase ? (
              <span>ফায়ারবেস ক্লাউড অথেন্টিকেশন সক্রিয় রয়েছে।</span>
            ) : (
              <span>
                <strong>ডেভেলপমেন্ট মোড:</strong> বর্তমানে অ্যাপটিতে কোনো এক্সটার্নাল ফায়ারবেস ব্যাকএন্ড কনফিগার করা নেই। সম্পূর্ণ ফিচার নিরাপদে টেস্ট করতে 'অতিথি মোড' ব্যবহার করুন অথবা লোকাল সেশন রেজিস্ট্রেশন করুন।
              </span>
            )}
          </p>
        </div>

        {/* Replay Onboarding link */}
        <div className="text-center pt-1">
          <button
            onClick={onReviewOnboarding}
            className="text-xs text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition cursor-pointer underline"
          >
            ভূমিকা ও নির্দেশিকা পুনরায় দেখুন
          </button>
        </div>
      </div>
    </div>
  );
};
