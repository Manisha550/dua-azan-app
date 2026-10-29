import { PrayerTimes } from '../types';

export interface CityPreset {
  name: string;
  bnName: string;
  lat: number;
  lng: number;
  country: string;
}

export const CITY_PRESETS: CityPreset[] = [
  { name: 'Dhaka', bnName: 'ঢাকা', lat: 23.8103, lng: 90.4125, country: 'বাংলাদেশ' },
  { name: 'Chittagong', bnName: 'চট্টগ্রাম', lat: 22.3569, lng: 91.7832, country: 'বাংলাদেশ' },
  { name: 'Sylhet', bnName: 'সিলেট', lat: 24.8949, lng: 91.8687, country: 'বাংলাদেশ' },
  { name: 'Rajshahi', bnName: 'রাজশাহী', lat: 24.3636, lng: 88.6241, country: 'বাংলাদেশ' },
  { name: 'Khulna', bnName: 'খুলনা', lat: 22.8456, lng: 89.5403, country: 'বাংলাদেশ' },
  { name: 'Barisal', bnName: 'বরিশাল', lat: 22.7010, lng: 90.3535, country: 'বাংলাদেশ' },
  { name: 'Rangpur', bnName: 'রংপুর', lat: 25.7439, lng: 89.2752, country: 'বাংলাদেশ' },
  { name: 'Mymensingh', bnName: 'ময়মনসিংহ', lat: 24.7471, lng: 90.4203, country: 'বাংলাদেশ' },
  { name: 'Comilla', bnName: 'কুমিল্লা', lat: 23.4607, lng: 91.1809, country: 'বাংলাদেশ' },
  { name: 'Mecca', bnName: 'মক্কা মুকাররমা', lat: 21.3891, lng: 39.8579, country: 'সৌদি আরব' },
  { name: 'Medina', bnName: 'মদিনা মুনাওয়ারা', lat: 24.5247, lng: 39.5692, country: 'সৌদি আরব' },
  { name: 'London', bnName: 'লন্ডন', lat: 51.5074, lng: -0.1278, country: 'যুক্তরাজ্য' },
  { name: 'New York', bnName: 'নিউইয়র্ক', lat: 40.7128, lng: -74.0060, country: 'যুক্তরাষ্ট্র' },
  { name: 'Dubai', bnName: 'দুবাই', lat: 25.2048, lng: 55.2708, country: 'সংযুক্ত আরব আমিরাত' },
  { name: 'Kuala Lumpur', bnName: 'কুয়ালালামপুর', lat: 3.1390, lng: 101.6869, country: 'মালয়েশিয়া' }
];

export const METHOD_LABELS: Record<number, string> = {
  1: 'Karachi (Univ. of Islamic Sciences)',
  2: 'ISNA (North America)',
  3: 'Muslim World League (MWL)',
  4: 'Umm al-Qura University (Makkah)',
  5: 'Egyptian General Authority of Survey'
};

// Trigonometric helpers in degrees
const dtr = (d: number) => (d * Math.PI) / 180.0;
const rtd = (r: number) => (r * 180.0) / Math.PI;
const sinD = (d: number) => Math.sin(dtr(d));
const cosD = (d: number) => Math.cos(dtr(d));
const tanD = (d: number) => Math.tan(dtr(d));
const acosD = (x: number) => rtd(Math.acos(Math.max(-1, Math.min(1, x))));
const atan2D = (y: number, x: number) => rtd(Math.atan2(y, x));

// Julian Day
function getJulianDate(date: Date): number {
  const y = date.getFullYear();
  let m = date.getMonth() + 1;
  const d = date.getDate();
  let yAdj = y;
  if (m <= 2) {
    yAdj -= 1;
    m += 12;
  }
  const a = Math.floor(yAdj / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (yAdj + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}

// Calculate Sun position (declination & equation of time)
function sunPosition(jd: number): { declination: number; eqTime: number } {
  const d = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const l = (q + 1.915 * sinD(g) + 0.020 * sinD(2 * g)) % 360;
  const e = 23.439 - 0.00000036 * d;
  const ra = atan2D(cosD(e) * sinD(l), cosD(l)) / 15.0;
  const decl = rtd(Math.asin(sinD(e) * sinD(l)));
  const eqt = q / 15.0 - (ra < 0 ? ra + 24 : ra);
  return { declination: decl, eqTime: eqt };
}

// Offline Astronomical Prayer Time Calculator (Ensures 100% offline functionality)
export function computePrayerTimesOffline(
  date: Date,
  lat: number,
  lng: number,
  methodId: number = 1,
  school: number = 1
): PrayerTimes {
  const jd = getJulianDate(date);
  const { declination, eqTime } = sunPosition(jd);

  // Timezone offset in hours
  const tz = -date.getTimezoneOffset() / 60;
  // Solar noon in hours
  const noon = 12 + tz - lng / 15.0 - eqTime;

  // Angles based on method
  let fajrAngle = 18;
  let ishaAngle = 18;
  if (methodId === 2) {
    fajrAngle = 15;
    ishaAngle = 15;
  } else if (methodId === 3) {
    fajrAngle = 18;
    ishaAngle = 17;
  } else if (methodId === 4) {
    fajrAngle = 18.5;
    ishaAngle = 17; // or 90 mins after maghrib
  } else if (methodId === 5) {
    fajrAngle = 19.5;
    ishaAngle = 17.5;
  }

  // Sunrise/Sunset angle (-0.833° for refraction)
  const sunriseSunAngle = -0.833;
  const cosSunriseH = (sinD(sunriseSunAngle) - sinD(lat) * sinD(declination)) / (cosD(lat) * cosD(declination));
  const sunriseH = acosD(cosSunriseH) / 15.0;

  const sunriseHours = noon - sunriseH;
  const sunsetHours = noon + sunriseH;

  // Fajr
  const cosFajrH = (sinD(-fajrAngle) - sinD(lat) * sinD(declination)) / (cosD(lat) * cosD(declination));
  const fajrHours = noon - acosD(cosFajrH) / 15.0;

  // Isha
  let ishaHours: number;
  if (methodId === 4) {
    // Umm al-Qura: 90 mins after sunset
    ishaHours = sunsetHours + 1.5;
  } else {
    const cosIshaH = (sinD(-ishaAngle) - sinD(lat) * sinD(declination)) / (cosD(lat) * cosD(declination));
    ishaHours = noon + acosD(cosIshaH) / 15.0;
  }

  // Asr
  // Shadow factor: 1 for Shafi'i, 2 for Hanafi
  const shadowFactor = school === 1 ? 2 : 1;
  const asrAngle = rtd(Math.atan(1.0 / (shadowFactor + tanD(Math.abs(lat - declination)))));
  const cosAsrH = (sinD(asrAngle) - sinD(lat) * sinD(declination)) / (cosD(lat) * cosD(declination));
  const asrHours = noon + acosD(cosAsrH) / 15.0;

  const formatHours = (h: number): string => {
    let normalized = h % 24;
    if (normalized < 0) normalized += 24;
    const hours = Math.floor(normalized);
    const minutes = Math.floor((normalized - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return {
    fajr: formatHours(fajrHours),
    sunrise: formatHours(sunriseHours),
    dhuhr: formatHours(noon + 0.05), // slightly after true zenith
    asr: formatHours(asrHours),
    maghrib: formatHours(sunsetHours + 0.03), // +2 min safety
    isha: formatHours(ishaHours)
  };
}

// Online fetch from Aladhan API with offline fallback
export async function getPrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  method: number = 1,
  school: number = 1
): Promise<PrayerTimes> {
  const pad = (n: number) => String(n).padStart(2, '0');
  const dd = `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
  const qs = `latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`;
  const cacheKey = `times_${dd}_${lat.toFixed(3)}_${lng.toFixed(3)}_${method}_${school}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.fajr && parsed.maghrib) return parsed;
    }
  } catch {
    // ignore
  }

  try {
    const url = `https://api.aladhan.com/v1/timings/${dd}?${qs}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (response.ok) {
      const json = await response.json();
      const t = json.data?.timings;
      if (t) {
        const out: PrayerTimes = {
          fajr: String(t.Fajr || '').slice(0, 5),
          sunrise: String(t.Sunrise || '').slice(0, 5),
          dhuhr: String(t.Dhuhr || '').slice(0, 5),
          asr: String(t.Asr || '').slice(0, 5),
          maghrib: String(t.Maghrib || '').slice(0, 5),
          isha: String(t.Isha || '').slice(0, 5)
        };
        if (/^\d{2}:\d{2}$/.test(out.fajr) && /^\d{2}:\d{2}$/.test(out.maghrib)) {
          localStorage.setItem(cacheKey, JSON.stringify(out));
          return out;
        }
      }
    }
  } catch (err) {
    console.warn('Online prayer timings fetch failed; using offline algorithm', err);
  }

  // Fallback to high-precision offline calculation
  const computed = computePrayerTimesOffline(date, lat, lng, method, school);
  localStorage.setItem(cacheKey, JSON.stringify(computed));
  return computed;
}

// Tahajjud calculation:
// Night duration is calculated from yesterday's Maghrib to today's Fajr
// The last third begins at: Fajr - (Night duration / 3)
export function calculateTahajjudTime(
  baseDate: Date,
  yesterdayMaghribStr: string,
  todayFajrStr: string
): Date {
  const [yMh, yMm] = yesterdayMaghribStr.split(':').map(Number);
  const [tFh, tFm] = todayFajrStr.split(':').map(Number);

  const yesterdayMaghrib = new Date(baseDate);
  yesterdayMaghrib.setDate(yesterdayMaghrib.getDate() - 1);
  yesterdayMaghrib.setHours(yMh, yMm, 0, 0);

  const todayFajr = new Date(baseDate);
  todayFajr.setHours(tFh, tFm, 0, 0);

  const nightDurationMs = todayFajr.getTime() - yesterdayMaghrib.getTime();
  const lastThirdStartMs = todayFajr.getTime() - nightDurationMs / 3;

  return new Date(lastThirdStartMs);
}

// Calculate Qibla bearing from user coordinates towards Kaaba (21.422487, 39.826206)
export function calculateQiblaBearing(lat: number, lng: number): number {
  const kaabaLat = 21.422487;
  const kaabaLng = 39.826206;

  const φ1 = dtr(lat);
  const φ2 = dtr(kaabaLat);
  const Δλ = dtr(kaabaLng - lng);

  const y = Math.sin(Δλ);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
  let bearing = rtd(Math.atan2(y, x));
  bearing = (bearing + 360) % 360;

  return Math.round(bearing * 10) / 10;
}
