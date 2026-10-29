class AudioService {
  private ctx: AudioContext | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isSynthesizing = false;
  private synthTimers: number[] = [];

  private getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public stop() {
    // Clear synth timers
    this.synthTimers.forEach((t) => clearTimeout(t));
    this.synthTimers = [];
    this.isSynthesizing = false;

    // Stop audio element
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }
  }

  // Melodic Adhan Motif Synthesizer via Web Audio API (Maqam Bayati / Hijaz resonance)
  public playSynthesizedAdhan(volume: number = 0.8) {
    this.stop();
    this.isSynthesizing = true;
    const ctx = this.getAudioContext();

    // Notes sequence (Hz): Allahu Akbar melodic motif
    // D4 (293.66), F4 (349.23), G4 (392.00), A4 (440.00), G4 (392.00), F4 (349.23), E4 (329.63), D4 (293.66)
    const melody = [
      { freq: 293.66, dur: 0.9, delay: 0 },
      { freq: 349.23, dur: 0.8, delay: 0.9 },
      { freq: 392.00, dur: 1.4, delay: 1.7 },
      { freq: 440.00, dur: 1.6, delay: 3.2 },
      { freq: 392.00, dur: 0.9, delay: 5.0 },
      { freq: 349.23, dur: 0.9, delay: 6.0 },
      { freq: 329.63, dur: 0.9, delay: 7.0 },
      { freq: 293.66, dur: 2.2, delay: 8.0 }
    ];

    melody.forEach((note) => {
      const timer = window.setTimeout(() => {
        if (!this.isSynthesizing) return;
        this.playAcousticTone(note.freq, note.dur, volume);
      }, note.delay * 1000);
      this.synthTimers.push(timer);
    });
  }

  // Warm acoustic bell/chime tone
  public playAcousticTone(freq: number, duration: number, volume: number = 0.8) {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Master gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(volume * 0.35, now + 0.12);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      masterGain.connect(ctx.destination);

      // Fundamental oscillator (Warm triangle)
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);
      osc1.connect(masterGain);

      // Warm octave overtone (Sine)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now);
      const overtoneGain = ctx.createGain();
      overtoneGain.gain.setValueAtTime(0.3, now);
      osc2.connect(overtoneGain);
      overtoneGain.connect(masterGain);

      // Sub harmonic for warmth
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 0.5, now);
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.2, now);
      osc3.connect(subGain);
      subGain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      osc1.stop(now + duration);
      osc2.stop(now + duration);
      osc3.stop(now + duration);
    } catch (err) {
      console.warn('Audio synthesis note failed', err);
    }
  }

  // Simple alarm beep pattern
  public playBeep(volume: number = 0.8) {
    this.stop();
    this.isSynthesizing = true;
    let count = 0;

    const beepInterval = window.setInterval(() => {
      if (!this.isSynthesizing || count++ >= 8) {
        clearInterval(beepInterval);
        this.isSynthesizing = false;
        return;
      }
      try {
        const ctx = this.getAudioContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } catch {
        // ignore
      }
    }, 500);

    this.synthTimers.push(beepInterval);
  }

  // Main play method that respects user preference and falls back smoothly
  public playSound(type: 'azan' | 'melodic' | 'beep', volume: number = 0.8) {
    this.stop();

    if (type === 'azan') {
      // First try real audio file if present, fallback to synthesized Bayati Adhan
      const audio = new Audio('/audio/azan.mp3');
      audio.volume = Math.max(0, Math.min(1, volume));
      this.currentAudioElement = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback to beautiful harmonic synth
          this.playSynthesizedAdhan(volume);
        });
      }
      audio.addEventListener('error', () => {
        this.playSynthesizedAdhan(volume);
      });
    } else if (type === 'melodic') {
      this.playAcousticTone(528, 2.5, volume);
      setTimeout(() => this.playAcousticTone(660, 3.0, volume), 400);
      setTimeout(() => this.playAcousticTone(792, 3.5, volume), 800);
    } else {
      this.playBeep(volume);
    }
  }

  public testAzan(volume: number = 0.8) {
    this.playSynthesizedAdhan(volume);
  }

  // Web Notification helper
  public async notify(title: string, body: string, tag: string = 'azan-alert') {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) {
            await reg.showNotification(title, {
              body,
              icon: '/icon.svg',
              badge: '/icon.svg',
              tag,
              requireInteraction: true,
            });
            return;
          }
        }
        new Notification(title, {
          body,
          icon: '/icon.svg',
          tag,
          requireInteraction: true,
        });
      } catch (err) {
        console.warn('Notification display failed', err);
      }
    }
  }

  // Vibrate mobile device
  public vibrate(pattern: number[] = [500, 200, 500]) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore
      }
    }
  }
}

export const audioService = new AudioService();
