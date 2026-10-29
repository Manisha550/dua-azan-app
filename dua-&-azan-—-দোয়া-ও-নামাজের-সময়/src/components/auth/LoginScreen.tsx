import React, { useState } from 'react';
import { LogIn, ArrowLeft, Eye, EyeOff, AlertCircle, Mail, Lock, UserCheck } from 'lucide-react';
import { authService } from '../../services/authService';

interface LoginScreenProps {
  onSuccess: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
  onContinueAsGuest: () => void;
  onNavigateBack: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  onNavigateToSignUp,
  onNavigateToForgotPassword,
  onContinueAsGuest,
  onNavigateBack,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।');
      return;
    }

    if (!password) {
      setError('অনুগ্রহ করে আপনার পাসওয়ার্ড লিখুন।');
      return;
    }

    setLoading(true);
    try {
      await authService.loginUser(email, password);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'লগইনে সমস্যা হয়েছে।');
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
            অ্যাকাউন্টে লগইন করুন
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            আপনার নিবন্ধিত ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন।
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              পাসওয়ার্ড (Password)
            </label>
            <button
              type="button"
              onClick={onNavigateToForgotPassword}
              className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </button>
          </div>
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-sm sm:text-base shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer disabled:opacity-60"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}</span>
        </button>

        {/* Guest shortcut */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>অ্যাকাউন্ট ছাড়া সরাসরি অতিথি হিসেবে প্রবেশ করুন</span>
          </button>
        </div>
      </form>

      {/* Footer Link to Sign Up */}
      <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400">
        কোনো অ্যাকাউন্ট নেই?{' '}
        <button
          onClick={onNavigateToSignUp}
          className="font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer ml-1"
        >
          নতুন অ্যাকাউন্ট তৈরি করুন
        </button>
      </div>
    </div>
  );
};
