import { UserSession } from '../types';

const SESSION_STORAGE_KEY = 'dua_auth_session';
const ONBOARDING_STORAGE_KEY = 'dua_onboarding_completed';
const DEMO_USERS_STORAGE_KEY = 'dua_demo_users_db';

// Simple SHA-256 hash helper for demo credentials so plaintext passwords are never stored
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_salt_dua_azan');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface StoredDemoUser {
  uid: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

class AuthService {
  // Checks if Firebase is initialized/configured
  public isFirebaseConfigured(): boolean {
    // Check if Firebase app/config exists in the environment
    return false;
  }

  // Get current active session
  public getCurrentUser(): UserSession | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // Onboarding status
  public hasCompletedOnboarding(): boolean {
    try {
      return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  public setOnboardingCompleted(completed: boolean): void {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, completed ? 'true' : 'false');
    } catch {
      // ignore
    }
  }

  // Sign in as Guest (Instant testing mode)
  public loginAsGuest(): UserSession {
    const guestUser: UserSession = {
      uid: 'guest-' + Date.now().toString(36),
      name: 'অতিথি ব্যবহারকারী (Guest)',
      email: 'guest@duaazan.app',
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(guestUser));
    } catch {
      // ignore
    }
    return guestUser;
  }

  // Register in local development demo storage (hashed, non-plaintext)
  public async registerUser(name: string, email: string, password: string): Promise<UserSession> {
    const normalizedEmail = email.trim().toLowerCase();
    const storedUsers = this.getStoredDemoUsers();

    if (storedUsers.some((u) => u.email === normalizedEmail)) {
      throw new Error('এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে। অনুগ্রহ করে লগইন করুন।');
    }

    const passwordHash = await hashPassword(password);
    const uid = 'usr_' + Date.now().toString(36);
    const newUserRecord: StoredDemoUser = {
      uid,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    storedUsers.push(newUserRecord);
    this.saveStoredDemoUsers(storedUsers);

    const session: UserSession = {
      uid,
      name: newUserRecord.name,
      email: newUserRecord.email,
      isGuest: false,
      createdAt: newUserRecord.createdAt,
    };

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  // Login in local development demo storage
  public async loginUser(email: string, password: string): Promise<UserSession> {
    const normalizedEmail = email.trim().toLowerCase();
    const storedUsers = this.getStoredDemoUsers();
    const user = storedUsers.find((u) => u.email === normalizedEmail);

    if (!user) {
      throw new Error('কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি। অনুগ্রহ করে রেজিস্ট্রেশন করুন অথবা সঠিক ইমেইল দিন।');
    }

    const incomingHash = await hashPassword(password);
    if (incomingHash !== user.passwordHash) {
      throw new Error('ভুল পাসওয়ার্ড! অনুগ্রহ করে আবার চেষ্টা করুন।');
    }

    const session: UserSession = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      isGuest: false,
      createdAt: user.createdAt,
    };

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  // Logout
  public logout(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  // Password Reset simulation
  public async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const storedUsers = this.getStoredDemoUsers();
    const exists = storedUsers.some((u) => u.email === normalizedEmail);

    // Artificial brief delay for realistic network feel
    await new Promise((r) => setTimeout(r, 600));

    if (!exists) {
      // To prevent account enumeration, or to inform during development:
      return {
        success: true,
        message: `যদি '${normalizedEmail}' নিবন্ধিত থাকে, তবে একটি পাসওয়ার্ড রিসেট লিংক ইমেইলে প্রেরণ করা হয়েছে। (লোকাল ডেভেলপমেন্ট নোটিশ)`,
      };
    }

    return {
      success: true,
      message: `'${normalizedEmail}' ঠিকানায় পাসওয়ার্ড পুনরুদ্ধারের নির্দেশিকা পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স ও স্প্যাম ফোল্ডার পরীক্ষা করুন।`,
    };
  }

  private getStoredDemoUsers(): StoredDemoUser[] {
    try {
      const raw = localStorage.getItem(DEMO_USERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveStoredDemoUsers(users: StoredDemoUser[]): void {
    try {
      localStorage.setItem(DEMO_USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  }
}

export const authService = new AuthService();
