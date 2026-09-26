import React, { useState } from 'react';
import { PersonaConfig, VoiceStreamState, AssistantGender } from '../types';
import { GeminiLiveOrb } from './GeminiLiveOrb';
import { Mic, MicOff, Volume2, VolumeX, Square, Edit3, Check, Zap, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../utils/languages';

interface VoiceAssistantColumnProps {
  persona: PersonaConfig;
  customAssistantName: string;
  onUpdateAssistantName: (newName: string) => void;
  selectedGender: AssistantGender;
  onChangeGender: (gender: AssistantGender) => void;
  selectedLanguage: string;
  onChangeLanguage: (langCode: string) => void;
  voiceState: VoiceStreamState;
  isMicActive: boolean;
  onToggleMic: () => void;
  onInterrupt: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  micVolume: number;
  outputVolume: number;
  intensity: number;
  onIntensityChange: (val: number) => void;
}

export const VoiceAssistantColumn: React.FC<VoiceAssistantColumnProps> = ({
  persona,
  customAssistantName,
  onUpdateAssistantName,
  selectedGender,
  onChangeGender,
  selectedLanguage,
  onChangeLanguage,
  voiceState,
  isMicActive,
  onToggleMic,
  onInterrupt,
  isMuted,
  onToggleMute,
  micVolume,
  outputVolume,
  intensity,
  onIntensityChange,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(customAssistantName || persona.name);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateAssistantName(nameInput.trim());
    }
    setIsEditingName(false);
  };

  const displayName = customAssistantName || persona.name;
  const currentLang = getLanguageByCode(selectedLanguage);

  return (
    <div className="flex flex-col h-full glass-water rounded-[36px] p-5 shadow-2xl relative overflow-hidden justify-between">
      {/* Ambient background glow */}
      <div
        className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: persona.glowColor }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: persona.glowColor }}
      />

      {/* Top Header: Custom Name & Gender Selector */}
      <div className="z-10 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          {/* Customizable Assistant Name */}
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  placeholder="Assistant Name"
                  className="bg-zinc-800 border border-zinc-700 text-white text-xs font-bold px-2 py-1 rounded-lg focus:outline-none focus:border-pink-500 w-32"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="p-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>{displayName}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(displayName);
                    setIsEditingName(true);
                  }}
                  className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  title="Rename Assistant"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Male / Female Voice Selector */}
          <div className="flex items-center bg-black/60 border border-zinc-800 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => onChangeGender('female')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedGender === 'female'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>♀</span>
              <span className="text-[10px]">Female</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeGender('male')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedGender === 'male'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>♂</span>
              <span className="text-[10px]">Male</span>
            </button>
          </div>
        </div>

        {/* Multilingual Voice Assistant Language Selector */}
        <div className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-zinc-300 text-xs">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-semibold text-zinc-400">Language:</span>
          </div>

          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => onChangeLanguage(e.target.value)}
              className="bg-black/70 border border-zinc-700/80 hover:border-indigo-400 text-zinc-200 text-xs font-bold rounded-xl px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer appearance-none pr-6"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-zinc-900 text-white">
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[9px] text-zinc-400">
              ▼
            </span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-400">
          Speaking with {displayName} in <strong className="text-zinc-200">{currentLang.flag} {currentLang.name}</strong>
        </p>
      </div>

      {/* Middle: Interactive Gemini Live Glowing Orb */}
      <div className="my-auto py-4 flex flex-col items-center justify-center relative">
        <GeminiLiveOrb
          state={voiceState}
          micVolume={micVolume}
          outputVolume={outputVolume}
          persona={persona}
          onClick={onToggleMic}
          isMicActive={isMicActive}
        />

        {/* Dynamic Voice State Pill */}
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide transition-all shadow-md ${
              voiceState === 'listening'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                : voiceState === 'thinking'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : voiceState === 'speaking'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse'
                : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/50'
            }`}
          >
            {voiceState === 'listening' && 'Listening to your voice...'}
            {voiceState === 'thinking' && 'Composing response...'}
            {voiceState === 'speaking' && `${displayName} is speaking`}
            {voiceState === 'idle' && 'Voice Assistant Ready'}
          </span>
        </div>
      </div>

      {/* Bottom Controls: Mic Toggle, Interrupt, Mute, Intensity Slider */}
      <div className="z-10 flex flex-col gap-3 pt-3 border-t border-zinc-800/80">
        <div className="flex items-center gap-2 justify-center">
          {/* Main Push to Talk / Stream Toggle */}
          <button
            type="button"
            onClick={onToggleMic}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
              isMicActive
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white animate-pulse shadow-rose-900/50 ring-2 ring-rose-400/40'
                : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-pink-900/40'
            }`}
          >
            {isMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isMicActive ? 'Stop Voice Call' : 'Start Voice Call'}</span>
          </button>

          {/* Interrupt / Barge-In button */}
          <button
            type="button"
            onClick={onInterrupt}
            disabled={voiceState === 'idle'}
            className="p-3 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-200 border border-zinc-700/80 transition-colors cursor-pointer"
            title="Interrupt AI (Barge-in)"
          >
            <Square className="w-4 h-4 text-amber-400" />
          </button>

          {/* Mute output button */}
          <button
            type="button"
            onClick={onToggleMute}
            className="p-3 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Voice Output' : 'Mute Voice Output'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Emotion / Intensity Slider */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-semibold">{persona.moodLevelLabel}:</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="20"
              max="100"
              value={intensity}
              onChange={(e) => onIntensityChange(Number(e.target.value))}
              className="w-24 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <span className="font-mono text-[11px] text-zinc-300 w-8 text-right font-bold">
              {intensity}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
