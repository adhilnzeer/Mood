/**
 * Web Audio API utilities for microphone capture, PCM conversion,
 * audio playback queue, and real-time spectrum analysis.
 */

// Helper to convert Float32Array PCM from mic into 16-bit Linear PCM Base64
export function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const output = new DataView(new ArrayBuffer(input.length * 2));
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return output.buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export class AudioManager {
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private isListening = false;
  private currentlyPlayingSources: AudioBufferSourceNode[] = [];
  private audioQueue: ArrayBuffer[] = [];
  private isPlayingQueue = false;

  public onAudioChunk?: (pcmBase64: string) => void;
  public onVolumeUpdate?: (micVol: number, outVol: number) => void;

  constructor() {
    // Keep constructor light; initialize on user gesture
  }

  private initOutputContext() {
    if (!this.outputAudioCtx || this.outputAudioCtx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.outputAudioCtx = new AudioCtx({ sampleRate: 24000 });
      this.outputAnalyser = this.outputAudioCtx.createAnalyser();
      this.outputAnalyser.fftSize = 256;
      this.outputAnalyser.connect(this.outputAudioCtx.destination);
    }
    if (this.outputAudioCtx.state === 'suspended') {
      this.outputAudioCtx.resume();
    }
  }

  public async startMicrophone(): Promise<boolean> {
    try {
      this.initOutputContext();

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioCtx = new AudioCtx({ sampleRate: 16000 });
      if (this.inputAudioCtx.state === 'suspended') {
        await this.inputAudioCtx.resume();
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.micSource = this.inputAudioCtx.createMediaStreamSource(this.micStream);
      this.micAnalyser = this.inputAudioCtx.createAnalyser();
      this.micAnalyser.fftSize = 256;

      // 4096 buffer size gives ~250ms chunks at 16kHz
      this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);

      this.micSource.connect(this.micAnalyser);
      this.micAnalyser.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.inputAudioCtx.destination);

      this.scriptProcessor.onaudioprocess = (e) => {
        if (!this.isListening) return;

        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate Mic RMS volume
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const micVol = Math.min(1, rms * 4.5);

        // Calculate Output volume if playing
        let outVol = 0;
        if (this.outputAnalyser) {
          const dataArray = new Uint8Array(this.outputAnalyser.frequencyBinCount);
          this.outputAnalyser.getByteFrequencyData(dataArray);
          let outSum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            outSum += dataArray[i];
          }
          outVol = Math.min(1, outSum / (dataArray.length * 128));
        }

        if (this.onVolumeUpdate) {
          this.onVolumeUpdate(micVol, outVol);
        }

        // Only stream if audio chunk callback is attached
        if (this.onAudioChunk && micVol > 0.02) {
          const pcmBuffer = floatTo16BitPCM(inputData);
          const base64Audio = arrayBufferToBase64(pcmBuffer);
          this.onAudioChunk(base64Audio);
        }
      };

      this.isListening = true;
      return true;
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      return false;
    }
  }

  public stopMicrophone() {
    this.isListening = false;
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.inputAudioCtx && this.inputAudioCtx.state !== 'closed') {
      this.inputAudioCtx.close();
      this.inputAudioCtx = null;
    }
    if (this.onVolumeUpdate) {
      this.onVolumeUpdate(0, 0);
    }
  }

  public interrupt() {
    // Instantly abort playing audio sources
    this.currentlyPlayingSources.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // already stopped
      }
    });
    this.currentlyPlayingSources = [];
    this.audioQueue = [];
    this.isPlayingQueue = false;

    // Also cancel standard window synthesis if running
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public async playBase64Audio(base64Audio: string): Promise<void> {
    this.initOutputContext();
    if (!this.outputAudioCtx) return;

    try {
      const arrayBuffer = base64ToArrayBuffer(base64Audio);
      let audioBuffer: AudioBuffer;

      try {
        // First try native decode (handles WAV/MP3/AAC headers if returned by model)
        audioBuffer = await this.outputAudioCtx.decodeAudioData(arrayBuffer.slice(0));
      } catch (decodeErr) {
        // Raw linear 16-bit PCM at 24000Hz fallback
        const pcm16 = new Int16Array(arrayBuffer);
        const float32 = new Float32Array(pcm16.length);
        for (let i = 0; i < pcm16.length; i++) {
          float32[i] = pcm16[i] / 32768;
        }
        audioBuffer = this.outputAudioCtx.createBuffer(1, float32.length, 24000);
        audioBuffer.getChannelData(0).set(float32);
      }

      const source = this.outputAudioCtx.createBufferSource();
      source.buffer = audioBuffer;

      if (this.outputAnalyser) {
        source.connect(this.outputAnalyser);
      } else {
        source.connect(this.outputAudioCtx.destination);
      }

      this.currentlyPlayingSources.push(source);

      return new Promise<void>((resolve) => {
        source.onended = () => {
          this.currentlyPlayingSources = this.currentlyPlayingSources.filter((s) => s !== source);
          resolve();
        };
        source.start();
      });
    } catch (err) {
      console.warn('Error playing audio buffer:', err);
    }
  }

  public speakBrowserTTS(text: string, voiceName: string, langCode: string = 'en-US'): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = langCode.slice(0, 2);
      const localizedVoice = voices.find(v => v.lang.startsWith(langPrefix));
      
      if (localizedVoice) {
        utterance.voice = localizedVoice;
      } else if (voiceName === 'Aoede' || voiceName === 'Kore') {
        // Prefer female/expressive voice
        const femaleVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google UK English Female')));
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.pitch = 1.15;
        utterance.rate = 1.05;
      } else if (voiceName === 'Fenrir' || voiceName === 'Puck') {
        // Roast master voice - punchy, faster rate
        const maleVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('Alex') || v.name.includes('Google UK English Male')));
        if (maleVoice) utterance.voice = maleVoice;
        utterance.pitch = 0.95;
        utterance.rate = 1.15;
      } else {
        // Soothing, softer tone
        const calmVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Karen') || v.name.includes('Serena') || v.name.includes('Natural')));
        if (calmVoice) utterance.voice = calmVoice;
        utterance.pitch = 1.0;
        utterance.rate = 0.95;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }

  public getAnalyser(): AnalyserNode | null {
    return this.outputAnalyser || this.micAnalyser;
  }
}
