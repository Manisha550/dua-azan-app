import React, { useState } from 'react';
import { UserPlus, ArrowLeft, Eye, EyeOff, CheckCircle2, AlertCircle, Info, Lock, Mail, User } from 'lucide-react';
import { authService } from '../../services/authService';

interface SignUpScreenProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
  onNavigateBack: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onSuccess,
  onNavigateToLogin,
  onNavigateBack,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!name.trim()) {
      setError('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা প্রদান করুন।');
      return;
    }

    if (password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (password !== confirmPassword) {
      setError('নিশ্চিতকরণ পাসওয়ার্ড মূল পাসওয়ার্ডের সাথে মেলেনি।');
      return;
    }

    setLoading(true);
    try {
      await authService.registerUser(name, email, password);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'রেজিস্ট্রেশনে ত্রুটি ঘটেছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between p-6 sm:p-8 max-w-md mx-auto select-none animate-fadeIn">
      {/* Top Header */}
      <div>
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300 py-1 px-2 -ml-2 rounded-lg transition cursor-pointer mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ফিরে যান</span>
        </button>

        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            নতুন অ্যাকাউন্ট তৈরি করুন
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            আপনার দোয়া ও ব্যক্তিগত আমলের রেকর্ড নিরাপদে সংরক্ষিত রাখতে নিবন্ধন করুন।
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="my-auto py-6 space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            পুরো নাম (Full Name)
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: আব্দুল্লাহ মাহমুদ"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            ইমেইল ঠিকানা (Email Address)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            পাসওয়ার্ড (Password - কমপক্ষে ৬ অক্ষর)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
          </div>
        </div>

        {/* Informational notice */}
        <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/60 text-[11px] text-teal-800 dark:text-teal-300 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-teal-600" />
          <p className="leading-relaxed">
            পাসওয়ার্ড ক্লায়েন্ট ব্রাউজারে SHA-256 হ্যাশ এনক্রিপশন দ্বারা সুরক্ষিত রাখা হয়। কোনো প্লেইনটেক্সট সংরক্ষিত হয় না।
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-sm sm:text-base shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer disabled:opacity-60"
        >
          <UserPlus className="w-4 h-4" />
          <span>{loading ? 'প্রক্রিয়াধীন...' : 'নিবন্ধন সম্পন্ন করুন'}</span>
        </button>
      </form>

      {/* Footer Link to Login */}
      <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400">
        ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
        <button
          onClick={onNavigateToLogin}
          className="font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer ml-1"
        >
          লগইন করুন
        </button>
      </div>
    </div>
  );
};
