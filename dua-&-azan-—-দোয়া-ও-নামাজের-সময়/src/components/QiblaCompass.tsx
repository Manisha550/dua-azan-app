import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Compass,
  Navigation,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Sliders,
  HelpCircle,
  Volume2,
  Sparkles,
  Info,
} from 'lucide-react';
import { audioService } from '../services/audioService';

interface QiblaCompassProps {
  lat: number;
  lng: number;
  cityName: string;
  qiblaBearing: number;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({
  lat,
  lng,
  cityName,
  qiblaBearing,
}) => {
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [sensorState, setSensorState] = useState<'idle' | 'unsupported' | 'denied' | 'active'>('idle');
  const [isPermissionRequired, setIsPermissionRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualHeading, setManualHeading] = useState<number>(0);
  const [isManualMode, setIsManualMode] = useState(false);

  // Vibration throttle tracker to avoid spamming vibrations while aligned
  const lastVibratedRef = useRef<number>(0);
  const lastAlignedRef = useRef<boolean>(false);

  // Check if iOS permissions are required
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      setIsPermissionRequired(true);
    }
  }, []);

  // Process orientation event
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading: number | null = null;

    // iOS WebKit Compass Heading (returns true degrees clockwise from magnetic/true North)
    const webkitEvent = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
    if (typeof webkitEvent.webkitCompassHeading === 'number') {
      heading = webkitEvent.webkitCompassHeading;
    } else if (typeof event.alpha === 'number') {
      // Android / Chrome deviceorientation / deviceorientationabsolute
      // In standard deviceorientation, alpha rotates counter-clockwise; clockwise heading = 360 - alpha
      heading = (360 - event.alpha) % 360;
    }

    if (heading !== null && !isNaN(heading)) {
      setDeviceHeading(Math.round(heading));
      setSensorState('active');
      setErrorMessage(null);
    }
  }, []);

  // Start listening to the magnetometer / orientation sensor
  const startCompass = useCallback(async () => {
    setErrorMessage(null);

    // iOS 13+ permission request
    const DeviceOrientation = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DeviceOrientation.requestPermission === 'function') {
      try {
        const response = await DeviceOrientation.requestPermission();
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setSensorState('active');
        } else {
          setSensorState('denied');
          setErrorMessage('কম্পাস সেন্সর ব্যবহারের অনুমতি দেওয়া হয়নি।');
        }
      } catch (err) {
        setSensorState('denied');
        setErrorMessage('সেন্সরের অনুমতি নিতে সমস্যা হয়েছে।');
      }
      return;
    }

    // Android / Modern standard browsers:
    // First try 'deviceorientationabsolute' for absolute magnetic North
    const win = window as unknown as Record<string, unknown>;
    if ('ondeviceorientationabsolute' in win) {
      window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
      setSensorState('active');
    } else if (typeof window.DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', handleOrientation as EventListener, true);
      setSensorState('active');
    } else {
      setSensorState('unsupported');
      setErrorMessage('আপনার ব্রাউজার বা ডিভাইসে ম্যাগনেটোমিটার সেন্সর খুঁজে পাওয়া যায়নি।');
    }

    // Timeout check: if no event received after 2 seconds (e.g. desktop with no hardware sensor)
    setTimeout(() => {
      setDeviceHeading((curr) => {
        if (curr === null) {
          setSensorState('unsupported');
          setIsManualMode(true);
        }
        return curr;
      });
    }, 2000);
  }, [handleOrientation]);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener(
        'deviceorientationabsolute',
        handleOrientation as EventListener,
        true
      );
    };
  }, [handleOrientation]);

  // Current effective heading (sensor or manual)
  const currentHeading = isManualMode ? manualHeading : (deviceHeading ?? 0);

  // Compute angle difference between device heading and Kaaba bearing
  // diff: shortest angular distance (-180 to +180)
  const rawDiff = (qiblaBearing - currentHeading + 360) % 360;
  const normalizedDiff = rawDiff > 180 ? rawDiff - 360 : rawDiff;
  const isAligned = Math.abs(normalizedDiff) <= 4;

  // Haptic and audio feedback on alignment
  useEffect(() => {
    if (isAligned && !lastAlignedRef.current) {
      const now = Date.now();
      if (now - lastVibratedRef.current > 2000) {
        audioService.vibrate([70, 40, 70]);
        audioService.playAcousticTone(880, 0.35, 0.25);
        lastVibratedRef.current = now;
      }
    }
    lastAlignedRef.current = isAligned;
  }, [isAligned]);

  // Compass rotation angles:
  // Dial rotates opposite to heading so North stays pointing North
  const dialRotation = -currentHeading;
  // Needle points directly to the Kaaba
  const needleRotation = qiblaBearing - currentHeading;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-base">
            <Compass className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>লাইভ কিবলা কম্পাস (Qibla Compass Sensor)</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            মোবাইলের ম্যাগনেটোমিটার সেন্সর দ্বারা পবিত্র কাবার সরাসরি দিক নির্দেশক।
          </p>
        </div>

        {/* Sensor Status / Activation */}
        <div className="flex items-center gap-2">
          {sensorState !== 'active' ? (
            <button
              onClick={startCompass}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{isPermissionRequired ? 'সেন্সর চালু করুন' : 'কম্পাস চালু করুন'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>সেন্সর সক্রিয়</span>
            </div>
          )}

          <button
            onClick={() => setIsManualMode(!isManualMode)}
            className={`p-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
              isManualMode
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="ম্যানুয়াল টেস্ট মোড"
            aria-label="ম্যানুয়াল টেস্ট মোড"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Aligned Banner */}
      {isAligned ? (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-400 dark:border-emerald-700 flex items-center justify-center gap-2.5 text-emerald-800 dark:text-emerald-200 text-sm font-bold animate-bounce shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>মাশাআল্লাহ! আপনি কিবলার সঠিক অভিমুখে আছেন।</span>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <span className="font-medium">
            পবিত্র কাবার অভিমুখে পৌঁছাতে:{' '}
            <strong className="text-teal-700 dark:text-teal-400">
              {Math.abs(Math.round(normalizedDiff))}°{' '}
              {normalizedDiff > 0 ? 'ডানে (ঘড়ির দিকে)' : 'বামে (বিপরীতে)'} ঘোরান
            </strong>
          </span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {Math.abs(Math.round(normalizedDiff))}°
          </span>
        </div>
      )}

      {/* Compass Dial Graphic */}
      <div className="relative flex flex-col items-center justify-center py-4">
        <div
          className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 transition-all duration-300 flex items-center justify-center select-none shadow-xl ${
            isAligned
              ? 'border-emerald-500 shadow-emerald-500/25 bg-emerald-950/10'
              : 'border-teal-600/30 dark:border-teal-500/20 bg-slate-50 dark:bg-slate-950/80'
          }`}
        >
          {/* Outer Compass Rose Dial (Rotates with Device Orientation) */}
          <div
            className="absolute inset-0 w-full h-full rounded-full transition-transform duration-200 ease-out"
            style={{ transform: `rotate(${dialRotation}deg)` }}
          >
            {/* Degree Tick marks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute inset-x-0 top-0 flex justify-center origin-center h-full pointer-events-none"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div
                  className={`w-0.5 ${
                    deg % 90 === 0 ? 'h-3.5 bg-slate-400 dark:bg-slate-500' : 'h-2 bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              </div>
            ))}

            {/* Cardinal Letters (North, East, South, West) */}
            <div className="absolute top-3 inset-x-0 text-center font-bold text-red-500 text-sm tracking-wider">
              N <span className="text-[10px] block -mt-1 font-normal text-slate-400">উত্তর</span>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-600 dark:text-slate-300 text-xs">
              E
            </div>
            <div className="absolute bottom-3 inset-x-0 text-center font-bold text-slate-600 dark:text-slate-300 text-xs">
              S <span className="text-[10px] block -mt-1 font-normal text-slate-400">দক্ষিণ</span>
            </div>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-600 dark:text-slate-300 text-xs">
              W
            </div>

            {/* Kaaba Beacon Marker on the rotating dial */}
            <div
              className="absolute inset-x-0 top-0 flex flex-col items-center origin-center h-full pointer-events-none"
              style={{ transform: `rotate(${qiblaBearing}deg)` }}
            >
              <div className="mt-1 p-1 bg-amber-400 text-slate-950 rounded-full shadow-md animate-pulse">
                <span className="text-xs font-black">🕋</span>
              </div>
            </div>
          </div>

          {/* Center Qibla Needle Pointing to Kaaba */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out pointer-events-none"
            style={{ transform: `rotate(${needleRotation}deg)` }}
          >
            {/* North/Qibla Pointer Tip */}
            <div className="flex flex-col items-center h-full justify-between py-5">
              {/* Pointing Head */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-0 h-0 border-x-8 border-x-transparent border-b-16 transition-colors ${
                    isAligned ? 'border-b-emerald-500 drop-shadow-md' : 'border-b-amber-500'
                  }`}
                />
                <div
                  className={`w-1.5 h-16 rounded-b-md ${
                    isAligned ? 'bg-emerald-500' : 'bg-gradient-to-b from-amber-500 to-teal-600'
                  }`}
                />
              </div>

              {/* Counterweight */}
              <div className="w-1.5 h-10 bg-slate-300 dark:bg-slate-700 rounded-t-md" />
            </div>
          </div>

          {/* Central Hub */}
          <div
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-md z-10 transition-colors ${
              isAligned
                ? 'bg-emerald-600 border-white text-white'
                : 'bg-teal-700 dark:bg-slate-800 border-amber-400 text-amber-300'
            }`}
          >
            <span className="text-sm font-black">🕋</span>
          </div>

          {/* Device Top Center Heading Guide Marker */}
          <div className="absolute -top-3 w-4 h-4 bg-teal-600 rotate-45 rounded-xs shadow-xs" />
        </div>
      </div>

      {/* Manual Testing Slider (for desktop testing or devices without magnetometer) */}
      {isManualMode && (
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-200">
            <span>ম্যানুয়াল ডিভাইস রোটেশন টেস্ট (স্লাইডার):</span>
            <span className="font-mono text-sm">{manualHeading}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="359"
            value={manualHeading}
            onChange={(e) => setManualHeading(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setManualHeading(Math.round(qiblaBearing))}
              className="py-1 px-2.5 rounded-lg bg-teal-700 text-white text-[10px] font-bold shadow-xs hover:bg-teal-800 transition cursor-pointer"
            >
              🕋 কিবলা লক ({Math.round(qiblaBearing)}°)
            </button>
            <button
              type="button"
              onClick={() => setManualHeading(0)}
              className="py-1 px-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition cursor-pointer"
            >
              উত্তর (0°)
            </button>
            <button
              type="button"
              onClick={() => setManualHeading(90)}
              className="py-1 px-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition cursor-pointer"
            >
              পূর্ব (90°)
            </button>
            <button
              type="button"
              onClick={() => setManualHeading(180)}
              className="py-1 px-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition cursor-pointer"
            >
              দক্ষিণ (180°)
            </button>
            <button
              type="button"
              onClick={() => setManualHeading(270)}
              className="py-1 px-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition cursor-pointer"
            >
              পশ্চিম (270°)
            </button>
          </div>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
            Windows পিসিতে বা সেন্সরহীন ডিভাইসে টেস্ট করতে স্লাইডার ব্যবহার করুন অথবা 'কিবলা লক' বাটনে চাপ দিন।
          </p>
        </div>
      )}

      {/* Statistics & Coordinates Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">ডিভাইসের দিক</span>
          <span className="font-mono text-base font-bold text-slate-800 dark:text-slate-200">
            {Math.round(currentHeading)}°
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/60">
          <span className="text-[11px] text-teal-700 dark:text-teal-400 block mb-0.5 font-medium">
            কিবলার কোণ
          </span>
          <span className="font-mono text-base font-bold text-teal-800 dark:text-teal-200">
            {qiblaBearing}°
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">পার্থক্য</span>
          <span
            className={`font-mono text-base font-bold ${
              isAligned ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {Math.abs(Math.round(normalizedDiff))}°
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">বর্তমান শহর</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate block">
            {cityName}
          </span>
        </div>
      </div>

      {/* Sensor Calibration & Accuracy Help Note */}
      <div className="flex items-start gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>নির্ভুলতার নির্দেশিকা:</strong> কম্পাস সেন্সরের নির্ভুল ফলাফলের জন্য মোবাইল ফোনটি সমতল
          (Flat) স্থানে রাখুন এবং কোনো চুম্বক বা ধাতব বস্তু থেকে দূরে রাখুন। সেন্সর ক্যালিব্রেট করতে ফোনটি
          হাতে নিয়ে বাতাসে কয়েকবার ইংরেজি <strong>'8'</strong> আকারে ধীরে ধীরে ঘোরান।
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
