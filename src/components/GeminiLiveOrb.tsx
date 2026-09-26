import React, { useMemo } from 'react';
import { VoiceStreamState, PersonaConfig } from '../types';

interface GeminiLiveOrbProps {
  state: VoiceStreamState;
  micVolume: number;
  outputVolume: number;
  persona: PersonaConfig;
  onClick?: () => void;
  isMicActive: boolean;
}

export const GeminiLiveOrb: React.FC<GeminiLiveOrbProps> = ({
  state,
  micVolume,
  outputVolume,
  persona,
  onClick,
  isMicActive,
}) => {
  // Compute active volume for scaling
  const dynamicScale = useMemo(() => {
    if (state === 'speaking') {
      return 1 + outputVolume * 0.45;
    }
    if (state === 'listening') {
      return 1 + micVolume * 0.35;
    }
    if (state === 'thinking') {
      return 1.08;
    }
    return 1.0;
  }, [state, micVolume, outputVolume]);

  // Color mapping based on persona
  const orbColors = useMemo(() => {
    switch (persona.id) {
      case 'flirt_girl':
        return {
          glow: 'shadow-[0_0_90px_rgba(244,63,94,0.65)]',
          grad1: 'from-pink-500 via-rose-500 to-purple-600',
          grad2: 'from-fuchsia-400 via-pink-600 to-indigo-700',
          ring: 'border-pink-500/40',
          particle: 'bg-rose-400',
          accent: '#ec4899',
        };
      case 'fight_roast':
        return {
          glow: 'shadow-[0_0_95px_rgba(249,115,22,0.7)]',
          grad1: 'from-amber-400 via-orange-500 to-red-600',
          grad2: 'from-yellow-400 via-red-600 to-rose-700',
          ring: 'border-orange-500/40',
          particle: 'bg-amber-400',
          accent: '#f97316',
        };
      case 'music_mood':
        return {
          glow: 'shadow-[0_0_95px_rgba(59,130,246,0.7)]',
          grad1: 'from-cyan-400 via-blue-500 to-indigo-600',
          grad2: 'from-sky-300 via-indigo-600 to-purple-800',
          ring: 'border-cyan-500/40',
          particle: 'bg-cyan-300',
          accent: '#06b6d4',
        };
      case 'permanent_partner':
      default:
        return {
          glow: 'shadow-[0_0_90px_rgba(244,63,94,0.65)]',
          grad1: 'from-rose-500 via-pink-500 to-red-500',
          grad2: 'from-pink-400 via-rose-600 to-purple-700',
          ring: 'border-rose-500/40',
          particle: 'bg-rose-300',
          accent: '#f43f5e',
        };
    }
  }, [persona.id]);

  const stateBadge = useMemo(() => {
    switch (state) {
      case 'listening':
        return {
          text: 'Listening to you...',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400 animate-ping',
        };
      case 'thinking':
        return {
          text: `${persona.name.split(' ')[0]} is cooking a response...`,
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400 animate-pulse',
        };
      case 'speaking':
        return {
          text: `${persona.name.split(' ')[0]} is speaking`,
          color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          dot: 'bg-indigo-400 animate-bounce',
        };
      case 'idle':
      default:
        return {
          text: isMicActive ? 'Voice channel open • Speak freely' : 'Tap orb to start voice',
          color: 'bg-zinc-800/60 text-zinc-300 border-zinc-700/40',
          dot: isMicActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500',
        };
    }
  }, [state, persona.name, isMicActive]);

  return (
    <div className="relative flex flex-col items-center justify-center py-6 select-none">
      {/* Outer ambient pulsing ripples */}
      <div
        className={`absolute w-72 h-72 sm:w-84 sm:h-84 rounded-full border border-dashed ${orbColors.ring} transition-all duration-700 ${
          state === 'speaking' || state === 'listening' ? 'scale-125 opacity-70 animate-spin-slow' : 'scale-100 opacity-20'
        }`}
        style={{ animationDuration: '30s' }}
      />
      <div
        className={`absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full border ${orbColors.ring} transition-all duration-500 ${
          state !== 'idle' ? 'scale-115 opacity-60' : 'scale-95 opacity-20'
        }`}
      />

      {/* Main Interactive Orb */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Toggle Live Voice"
        className={`relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full cursor-pointer focus:outline-none transition-transform duration-150 active:scale-95 flex items-center justify-center ${orbColors.glow}`}
        style={{
          transform: `scale(${dynamicScale})`,
        }}
      >
        {/* Deep background organic fluid layer */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${orbColors.grad1} blur-md opacity-80 transition-all duration-700 ${
            state === 'speaking' ? 'animate-pulse' : ''
          }`}
        />

        {/* Morphing fluid core layer */}
        <div
          className={`absolute inset-1.5 rounded-full bg-gradient-to-bl ${orbColors.grad2} opacity-95 transition-all duration-500 shadow-inner overflow-hidden`}
        >
          {/* Animated specular highlight gloss */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/30 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-black/40 rounded-full blur-lg pointer-events-none" />
        </div>

        {/* Central visualizer & persona icon */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center p-3">
          <span className="text-4xl sm:text-5xl filter drop-shadow-lg transition-transform duration-300 transform group-hover:scale-110">
            {persona.avatar}
          </span>
          <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/90 drop-shadow">
            {persona.voice} Voice
          </span>

          {/* Sound wave bars inside orb */}
          <div className="flex items-center gap-1 mt-2 h-5">
            {[40, 75, 100, 85, 45].map((baseH, idx) => {
              const activeHeight =
                state === 'speaking'
                  ? Math.max(15, baseH * outputVolume * 1.3)
                  : state === 'listening'
                  ? Math.max(15, baseH * micVolume * 1.3)
                  : state === 'thinking'
                  ? 25 + Math.sin(Date.now() / 150 + idx) * 15
                  : 8;

              return (
                <div
                  key={idx}
                  className="w-1 bg-white/90 rounded-full transition-all duration-100 shadow-sm"
                  style={{ height: `${activeHeight}px` }}
                />
              );
            })}
          </div>
        </div>
      </button>

      {/* Real-time State Badge */}
      <div className="mt-6 z-10 flex items-center">
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium backdrop-blur-md transition-all shadow-md ${stateBadge.color}`}
        >
          <span className={`w-2 h-2 rounded-full ${stateBadge.dot}`} />
          <span>{stateBadge.text}</span>
        </div>
      </div>
    </div>
  );
};
