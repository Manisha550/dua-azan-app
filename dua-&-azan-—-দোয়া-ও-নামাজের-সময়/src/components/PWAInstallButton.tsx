import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If running inside standalone PWA mode, don't show install button
  if (isInstalled) {
    return null;
  }

  const isDesktop =
    typeof window !== 'undefined' && !/android|iphone|ipad|ipod/i.test(navigator.userAgent);

  // Chrome, Edge, Windows, Android flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-semibold shadow-md shadow-amber-500/20 transition cursor-pointer"
        title={isDesktop ? 'Windows পিসিতে ডেস্কটপ অ্যাপ হিসেবে ইনস্টল করুন' : 'মোবাইলের হোমস্ক্রিনে অ্যাপটি ইনস্টল করুন'}
      >
        <Download className="w-4 h-4" />
        <span>{isDesktop ? 'Windows এ ইনস্টল' : 'ইনস্টল করুন'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-800 hover:bg-teal-700 text-teal-100 text-xs sm:text-sm font-medium border border-teal-600/40 transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>iOS এ ইনস্টল</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-teal-500/30 p-6 shadow-2xl relative text-slate-800 dark:text-slate-100">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-teal-700 dark:text-teal-400">
                <Download className="w-5 h-5" />
                iPhone / iPad এ ইনস্টল করুন
              </h3>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-xs shrink-0 mt-0.5">
                    ১
                  </div>
                  <p>
                    সাফারি (Safari) ব্রাউজারের নিচের বারে থাকা <strong>শেয়ার (Share)</strong>{' '}
                    <Share2 className="w-4 h-4 inline text-teal-600" /> আইকনে চাপ দিন।
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-xs shrink-0 mt-0.5">
                    ২
                  </div>
                  <p>
                    একটু নিচে স্ক্রল করে <strong>Add to Home Screen</strong>{' '}
                    <PlusSquare className="w-4 h-4 inline text-teal-600" /> অপশনটি নির্বাচন করুন।
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-xs shrink-0 mt-0.5">
                    ৩
                  </div>
                  <p>
                    উপরে ডানপাশে <strong>Add</strong> বাটনে ক্লিক করলেই অ্যাপটি আপনার ফোনে ইনস্টল হয়ে যাবে।
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition"
              >
                বুঝতে পেরেছি
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
