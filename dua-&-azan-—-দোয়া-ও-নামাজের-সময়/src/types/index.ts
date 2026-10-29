export type DuaSource = {
  type: 'quran' | 'hadith' | 'other';
  ref: string;
  ayahs?: string[];
};

export type UserSession = {
  uid: string;
  name: string;
  email: string;
  isGuest: boolean;
  createdAt: string;
};

export type AppScreen =
  | 'splash'
  | 'onboarding'
  | 'welcome'
  | 'login'
  | 'signup'
  | 'forgot_password'
  | 'main';

export type Dua = {
  id: string;
  category: string;
  status: 'verified' | 'needs_verification';
  arabic: string;
  bengali: string;
  source: DuaSource;
  context: string;
  repetition: string;
  auditNotes?: string[];
  isCustom?: boolean;
  submittedBy?: string;
  verifiedBy?: string;
  verifiedAt?: string;
};

export type PrayerTimes = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  [key: string]: string;
};

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type PrayerEvent = {
  id: string;
  kind: 'azan' | 'tahajjud' | 'alarm';
  key?: string;
  label: string;
  at: Date;
  on: boolean;
  code?: number;
};

export type CustomAlarm = {
  id: string;
  time: string; // "HH:MM"
  label: string;
  on: boolean;
  days: number[]; // 0 = Sunday, 1 = Monday, etc. Empty = every day
};

export type UserSettings = {
  lat: number;
  lng: number;
  cityName: string;
  method: number; // 1: Karachi, 2: ISNA, 3: MWL, 4: Umm al-Qura, 5: Egyptian
  school: number; // 1: Hanafi, 0: Shafi'i/Standard
  azan: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    [key: string]: boolean;
  };
  tahajjud: {
    enabled: boolean;
    mode: 'lastThird' | 'custom';
    custom: string;
  };
  alarms: CustomAlarm[];
  soundType: 'azan' | 'melodic' | 'beep';
  soundVolume: number;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'normal' | 'large';
};
