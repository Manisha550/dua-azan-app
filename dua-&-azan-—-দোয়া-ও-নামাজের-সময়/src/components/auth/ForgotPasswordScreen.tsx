import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { authService } from '../../services/authService';

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
  onNavigateBack: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onNavigateToLogin,
  onNavigateBack,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.requestPasswordReset(email);
      setSuccessMessage(res.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'অনুরোধটি সম্পন্ন করা যায়নি।');
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
          <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold mb-3">
            <KeyRound className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            পাসওয়ার্ড পুনরুদ্ধার
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইল লিখুন। আমরা পাসওয়ার্ড রিসেট করার লিংক পাঠাব।
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="my-auto py-6">
        {successMessage ? (
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-center space-y-3 animate-fadeIn">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-base">
              অনুরোধ গৃহীত হয়েছে!
            </h3>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              {successMessage}
            </p>
            <button
              onClick={onNavigateToLogin}
              className="mt-3 w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              লগইন পেজে ফিরে যান
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ইমেইল ঠিকানা (Registered Email)
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-sm sm:text-base shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer disabled:opacity-60"
            >
              <Mail className="w-4 h-4" />
              <span>{loading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Footer Link to Login */}
      <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400">
        পাসওয়ার্ড মনে পড়েছে?{' '}
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
