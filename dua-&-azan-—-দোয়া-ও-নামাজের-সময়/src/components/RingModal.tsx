import React from 'react';
import { Bell, Volume2, Moon, Clock, X } from 'lucide-react';
import { PrayerEvent } from '../types';

interface RingModalProps {
  event: PrayerEvent | null;
  onDismiss: () => void;
  onSnooze: () => void;
}

export const RingModal: React.FC<RingModalProps> = ({ event, onDismiss, onSnooze }) => {
  if (!event) return null;

  const isAzan = event.kind === 'azan';
  const isTahajjud = event.kind === 'tahajjud';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-teal-50 dark:bg-teal-950/60 border-2 border-teal-500/40 flex items-center justify-center mb-5 relative">
          <div className="absolute inset-0 rounded-full border border-teal-500 animate-ping opacity-30" />
          {isTahajjud ? (
            <Moon className="w-10 h-10 text-amber-500 animate-pulse" />
          ) : isAzan ? (
            <Volume2 className="w-10 h-10 text-teal-600 dark:text-teal-400 animate-bounce" />
          ) : (
            <Bell className="w-10 h-10 text-teal-600 dark:text-teal-400 animate-pulse" />
          )}
        </div>

        {/* Title & Badge */}
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 rounded-full mb-3">
          {isAzan ? '🕌 নামাজের আযান' : isTahajjud ? '🌙 তাহাজ্জুদ সময়' : '⏰ অ্যালার্ম'}
        </span>

        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {event.label}
        </h2>

        <p className="text-lg text-teal-600 dark:text-teal-400 font-semibold mb-6 flex items-center justify-center gap-2">
          <Clock className="w-5 h-5" />
          {event.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>

        {/* Sound visualizer wave bars */}
        <div className="flex items-center justify-center gap-1.5 mb-8 h-8">
          {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50].map((h, i) => (
            <div
              key={i}
              className="w-1.5 bg-gradient-to-t from-teal-600 to-amber-400 rounded-full animate-pulse"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 120}ms`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!isAzan && (
            <button
              onClick={onSnooze}
              className="flex-1 py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium transition cursor-pointer flex items-center justify-center gap-2"
            >
              ৫ মিনিট স্নুজ
            </button>
          )}

          <button
            onClick={onDismiss}
            className="flex-1 py-3 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition cursor-pointer shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
