import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Volume2, VolumeX, Square, Radio, Activity, Zap, Sliders, Music, Play, Pause, Globe } from 'lucide-react';
import { GeminiLiveOrb } from './GeminiLiveOrb';
import { PersonaConfig, VoiceStreamState, ConnectionState } from '../types';
import { musicEngine, MusicMoodType, MOOD_TRACKS } from '../utils/musicEngine';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../utils/languages';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaConfig;
  voiceState: VoiceStreamState;
  isMicActive: boolean;
  onToggleMic: () => void;
  onInterrupt: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  micVolume: number;
  outputVolume: number;
  latencyMs: number;
  connectionState: ConnectionState;
  intensity: number;
  onIntensityChange: (val: number) => void;
  selectedLanguage?: string;
  onChangeLanguage?: (langCode: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  persona,
  voiceState,
  isMicActive,
  onToggleMic,
  onInterrupt,
  isMuted,
  onToggleMute,
  micVolume,
  outputVolume,
  latencyMs,
  connectionState,
  intensity,
  onIntensityChange,
  selectedLanguage = 'en',
  onChangeLanguage,
}) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(musicEngine.getIsPlaying());

  useEffect(() => {
    const handleMusic = (playing: boolean) => {
      setIsMusicPlaying(playing);
    };
    musicEngine.onPlayStateChange = handleMusic;
  }, []);

  if (!isOpen) return null;

  const currentTrack = MOOD_TRACKS[persona.id as MusicMoodType] || MOOD_TRACKS.music_mood;
  const currentLang = getLanguageByCode(selectedLanguage);

  const handleToggleMusic = () => {
    const playing = musicEngine.togglePlay(persona.id as MusicMoodType);
    setIsMusicPlaying(playing);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Voice Assistant Control Panel
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-mono">
                  {persona.name.split(' ')[0]}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Full-duplex audio stream, orb visualization & sensitivity
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Orb & Audio Details */}
        <div className="p-6 flex flex-col items-center bg-gradient-to-b from-zinc-900/40 to-black">
          {/* Audio Visualizer Orb */}
          <div className="py-2">
            <GeminiLiveOrb
              state={voiceState}
              micVolume={micVolume}
              outputVolume={outputVolume}
              persona={persona}
              onClick={onToggleMic}
              isMicActive={isMicActive}
            />
          </div>

          {/* Real-time Telemetry Bar */}
          <div className="grid grid-cols-2 gap-3 w-full my-4">
            <div className="bg-black/50 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-xs text-zinc-400 font-medium">WS Pipeline</span>
              </div>
              <span className="text-xs font-bold text-emerald-300 capitalize">{connectionState}</span>
            </div>

            <div className="bg-black/50 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-zinc-400 font-medium">Latency</span>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-300">{latencyMs || 24}ms</span>
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {persona.moodLevelLabel} Intensity
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">{intensity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={intensity}
              onChange={(e) => onIntensityChange(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
              <span>Mild & Subdued</span>
              <span>Maximum Intensity</span>
            </div>
          </div>

          {/* Ambient Mood Music Assistant Quick Toggle */}
          <div className="w-full bg-zinc-900/80 border border-cyan-900/40 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 text-sm">
                <Music className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">Mood on Music Assistance</span>
                  {isMusicPlaying && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 truncate max-w-[200px] sm:max-w-xs">
                  {currentTrack.title}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleMusic}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow ${
                isMusicPlaying
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              {isMusicPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isMusicPlaying ? 'Playing' : 'Play Beat'}</span>
            </button>
          </div>

          {/* Multilingual Voice Assistant Language Selector */}
          {onChangeLanguage && (
            <div className="w-full bg-zinc-900/80 border border-indigo-900/40 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 text-sm">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white">Voice Language</span>
                  <p className="text-[11px] text-zinc-400">
                    {currentLang.flag} {currentLang.name} ({currentLang.nativeName})
                  </p>
                </div>
              </div>

              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => onChangeLanguage(e.target.value)}
                  className="bg-black/80 border border-zinc-700 hover:border-indigo-400 text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer appearance-none pr-7"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-zinc-900 text-white">
                      {lang.flag} {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[9px] text-zinc-400">
                  ▼
                </span>
              </div>
            </div>
          )}

          {/* Primary Buttons */}
          <div className="flex items-center gap-3 w-full">
            <button
              type="button"
              onClick={onToggleMic}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 cursor-pointer ${
                isMicActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
              }`}
            >
              {isMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isMicActive ? 'Stop Voice Recording' : 'Start Continuous Voice'}</span>
            </button>

            <button
              type="button"
              onClick={onInterrupt}
              disabled={voiceState !== 'speaking' && voiceState !== 'thinking'}
              className={`p-3 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 ${
                voiceState === 'speaking' || voiceState === 'thinking'
                  ? 'bg-amber-950/60 border-amber-600/60 text-amber-300 hover:bg-amber-900/50 cursor-pointer active:scale-95'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
              title="Interrupt speech"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Cut Off</span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <span>Character: <strong className="text-white">{persona.name}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
