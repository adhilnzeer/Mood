/**
 * Web Audio API Ambient Mood & Music Synthesizer Engine
 * Generates continuous procedural background music tailored to each mood:
 * - Love: Ethereal lush chords, warm analog filter sweep & gentle soothing pads
 * - Flirt: Smooth R&B neo-soul chords, bounce bassline & playful melodic plucks
 * - Fight: Dark phonk distorted 808 sub-bass pulse & high-energy trap elements
 * - Mood DJ: Chill Lo-Fi jazz keys, mellow vinyl textures & relaxing rhythm
 */

export type MusicMoodType = 'permanent_partner' | 'flirt_girl' | 'fight_roast' | 'music_mood' | 'custom_mood';

export interface MoodTrackInfo {
  id: MusicMoodType;
  title: string;
  genre: string;
  bpm: number;
  key: string;
  icon: string;
}

export const MOOD_TRACKS: Record<MusicMoodType, MoodTrackInfo> = {
  permanent_partner: {
    id: 'permanent_partner',
    title: 'Ethereal Sanctuary (Love & Calm)',
    genre: 'Ambient Neo-Classical / Dream Pop',
    bpm: 65,
    key: 'F Major 7th',
    icon: '💖',
  },
  flirt_girl: {
    id: 'flirt_girl',
    title: 'Midnight Butterflies (Flirt Groove)',
    genre: 'R&B / Bedroom Pop Bounce',
    bpm: 92,
    key: 'Ab Major / C Minor',
    icon: '💋',
  },
  fight_roast: {
    id: 'fight_roast',
    title: 'Drift Phonk / Rage Surge (Battle Mode)',
    genre: 'Aggressive Phonk & Dark Trap',
    bpm: 140,
    key: 'F# Minor',
    icon: '🔥',
  },
  music_mood: {
    id: 'music_mood',
    title: 'Late Night Coffee & Vinyl (Lo-Fi Chill)',
    genre: 'Lo-Fi Jazz Hip-Hop / 432Hz Chill',
    bpm: 76,
    key: 'Db Major 9th',
    icon: '🎧',
  },
  custom_mood: {
    id: 'custom_mood',
    title: 'Personalized Sonic Wave (Custom)',
    genre: 'Generative Ambient & Chords',
    bpm: 82,
    key: 'A Major 7th',
    icon: '✨',
  },
};

export class MusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentMood: MusicMoodType = 'music_mood';
  private masterGain: GainNode | null = null;
  private timerId: any = null;
  private volume = 0.45; // 0 to 1
  private currentStep = 0;
  private activeNodes: (AudioNode | AudioScheduledSourceNode)[] = [];

  public onPlayStateChange?: (playing: boolean, mood: MusicMoodType) => void;

  private initContext() {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentMood(): MusicMoodType {
    return this.currentMood;
  }

  public setMood(mood: MusicMoodType) {
    this.currentMood = mood;
    if (this.isPlaying) {
      // Re-trigger with new mood
      this.stop();
      this.play(mood);
    }
  }

  public play(mood?: MusicMoodType) {
    if (mood) this.currentMood = mood;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = true;
    this.currentStep = 0;

    if (this.onPlayStateChange) {
      this.onPlayStateChange(true, this.currentMood);
    }

    const track = MOOD_TRACKS[this.currentMood];
    const stepTimeMs = (60 / track.bpm / 2) * 1000; // 8th note intervals

    // Schedule audio pulse sequence
    this.timerId = setInterval(() => {
      this.renderAudioStep();
      this.currentStep++;
    }, stepTimeMs);
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.onPlayStateChange) {
      this.onPlayStateChange(false, this.currentMood);
    }
  }

  public togglePlay(mood?: MusicMoodType): boolean {
    if (this.isPlaying) {
      if (mood && mood !== this.currentMood) {
        this.setMood(mood);
        return true;
      }
      this.stop();
      return false;
    } else {
      this.play(mood || this.currentMood);
      return true;
    }
  }

  private renderAudioStep() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    const step = this.currentStep % 16;

    switch (this.currentMood) {
      case 'permanent_partner':
        this.renderLoveSoundscape(now, step);
        break;
      case 'flirt_girl':
        this.renderFlirtGroove(now, step);
        break;
      case 'fight_roast':
        this.renderRagePhonk(now, step);
        break;
      case 'custom_mood':
        this.renderCustomAtmosphere(now, step);
        break;
      case 'music_mood':
      default:
        this.renderLofiChill(now, step);
        break;
    }
  }

  // --- CUSTOM ATMOSPHERE / LEARNED PATTERN ---
  private renderCustomAtmosphere(now: number, step: number) {
    if (!this.ctx || !this.masterGain) return;

    // Dreamy resonant chords every 8 steps
    if (step % 8 === 0) {
      const chords = [
        [220.0, 277.18, 329.63, 415.3], // A maj7
        [174.61, 220.0, 261.63, 329.63], // F maj7
        [246.94, 293.66, 369.99, 440.0], // B min7
        [196.0, 246.94, 293.66, 392.0], // G maj7
      ];
      const chordIdx = Math.floor(step / 8) % chords.length;
      const notes = chords[chordIdx];

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600 + Math.sin(now * 0.5) * 200, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + 4.0);
      });
    }

    // Melodic arpeggio on odd steps
    if (step % 2 === 1) {
      const notes = [440.0, 554.37, 659.25, 830.61];
      const note = notes[step % notes.length];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  }

  public setLearnedPattern(genrePattern: string, moodKey?: MusicMoodType) {
    const targetMood = moodKey || this.currentMood;
    const lower = genrePattern.toLowerCase();

    // Map keywords to mood engine tempos and soundscapes
    if (lower.includes('phonk') || lower.includes('drill') || lower.includes('metal') || lower.includes('rage') || lower.includes('bass')) {
      this.currentMood = 'fight_roast';
      MOOD_TRACKS.custom_mood.bpm = 142;
      MOOD_TRACKS.custom_mood.genre = `Learned: Heavy Phonk & Bass (${genrePattern})`;
    } else if (lower.includes('rnb') || lower.includes('flirt') || lower.includes('bounce') || lower.includes('pop') || lower.includes('dance')) {
      this.currentMood = 'flirt_girl';
      MOOD_TRACKS.custom_mood.bpm = 96;
      MOOD_TRACKS.custom_mood.genre = `Learned: R&B / Neo-Soul Groove (${genrePattern})`;
    } else if (lower.includes('lofi') || lower.includes('lo-fi') || lower.includes('study') || lower.includes('coffee') || lower.includes('jazz')) {
      this.currentMood = 'music_mood';
      MOOD_TRACKS.custom_mood.bpm = 78;
      MOOD_TRACKS.custom_mood.genre = `Learned: Lo-Fi Chill & Keys (${genrePattern})`;
    } else {
      this.currentMood = 'permanent_partner';
      MOOD_TRACKS.custom_mood.bpm = 65;
      MOOD_TRACKS.custom_mood.genre = `Learned: Ambient Healing & Rain (${genrePattern})`;
    }

    if (!this.isPlaying) {
      this.play(this.currentMood);
    } else {
      this.setMood(this.currentMood);
    }
  }

  // --- 1. LOVE SOUNDSCAPE (Dreamy ambient pad & gentle chime) ---
  private renderLoveSoundscape(now: number, step: number) {
    if (!this.ctx || !this.masterGain) return;

    // Trigger lush chord every 8 steps
    if (step % 8 === 0) {
      const chords = [
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [164.81, 196.0, 246.94, 293.66], // Em7
        [146.83, 174.61, 220.0, 261.63], // Dm7
        [130.81, 164.81, 196.0, 246.94], // Cmaj7
      ];
      const chordIndex = Math.floor(step / 8) % chords.length;
      const notes = chords[chordIndex];

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450 + Math.sin(now) * 150, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + 4.6);
      });
    }

    // Soft chime melody
    if (step === 2 || step === 6 || step === 11 || step === 14) {
      const chimeFreqs = [523.25, 659.25, 783.99, 880.0, 987.77];
      const freq = chimeFreqs[(step * 3) % chimeFreqs.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.85);
    }
  }

  // --- 2. FLIRT GROOVE (R&B bedroom pop bounce) ---
  private renderFlirtGroove(now: number, step: number) {
    if (!this.ctx || !this.masterGain) return;

    // Rhythmic bass pulse
    if (step % 4 === 0 || step === 6 || step === 14) {
      const bassNotes = [110.0, 110.0, 130.81, 146.83];
      const freq = bassNotes[Math.floor(step / 4) % bassNotes.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.32);
    }

    // Snappy R&B rimshot click on beats 4 & 12
    if (step === 4 || step === 12) {
      this.triggerSnappyNoise(now, 0.05, 1200);
    }

    // Playful electric key pluck
    if (step === 2 || step === 7 || step === 10) {
      const chord = [349.23, 440.0, 523.25];
      chord.forEach((f) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 0.42);
      });
    }
  }

  // --- 3. RAGE PHONK / BATTLE (Distorted 808 & aggressive cowbell synth) ---
  private renderRagePhonk(now: number, step: number) {
    if (!this.ctx || !this.masterGain) return;

    // Heavy 808 Sub-Bass Kick
    if (step === 0 || step === 6 || step === 8 || step === 14) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.46);
    }

    // Trap Hi-hat on every step
    this.triggerSnappyNoise(now, step % 2 === 0 ? 0.03 : 0.015, 6000);

    // Phonk Cowbell / Synth Hook
    if (step % 2 === 0) {
      const cowbellNotes = [587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25];
      const freq = cowbellNotes[(step / 2) % cowbellNotes.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  }

  // --- 4. LO-FI CHILL (Jazz Rhodes keys & cozy vinyl vibe) ---
  private renderLofiChill(now: number, step: number) {
    if (!this.ctx || !this.masterGain) return;

    // Rhodes Jazz 7th chords every 4 beats (8 steps)
    if (step % 8 === 0) {
      const lofiChords = [
        [277.18, 349.23, 415.3, 523.25], // Dbmaj7
        [246.94, 311.13, 369.99, 466.16], // Bbm7
        [220.0, 261.63, 329.63, 392.0], // Am7
        [207.65, 261.63, 311.13, 392.0], // Ab7
      ];
      const chord = lofiChords[Math.floor(step / 8) % lofiChords.length];

      chord.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        // Add subtle detune for authentic lo-fi cassette tape feel
        osc.frequency.setValueAtTime(f + (idx % 2 === 0 ? 0.7 : -0.7), now);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 2.5);
      });
    }

    // Soft mellow lo-fi kick on step 0 and 10
    if (step === 0 || step === 10) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.36);
    }

    // Muted snare on step 4 and 12
    if (step === 4 || step === 12) {
      this.triggerSnappyNoise(now, 0.04, 1800);
    }
  }

  private triggerSnappyNoise(now: number, level: number, filterFreq: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.06);
  }
}

export const musicEngine = new MusicEngine();
