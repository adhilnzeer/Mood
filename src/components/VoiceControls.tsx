import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Square, Radio, Activity, Zap } from 'lucide-react';
import { ConnectionState, VoiceStreamState } from '../types';

interface VoiceControlsProps {
  isMicActive: boolean;
  onToggleMic: () => void;
  voiceState: VoiceStreamState;
  connectionState: ConnectionState;
  latencyMs: number;
  onInterrupt: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  intensity: number;
  onIntensityChange: (val: number) => void;
  intensityLabel: string;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isMicActive,
  onToggleMic,
  voiceState,
  connectionState,
  latencyMs,
  onInterrupt,
  isMuted,
  onToggleMute,
  intensity,
  onIntensityChange,
  intensityLabel,
}) => {
  return (
    <div className="w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Main Audio Trigger Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
          {/* Mic Toggle Button */}
          <button
            type="button"
            onClick={onToggleMic}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${
              isMicActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
            }`}
          >
            {isMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isMicActive ? 'Stop Voice (Live)' : 'Start Voice Chat'}</span>
          </button>

          {/* Interrupt / Barge-in Button */}
          <button
            type="button"
            onClick={onInterrupt}
            disabled={voiceState !== 'speaking' && voiceState !== 'thinking'}
            title="Interrupt AI Speech (Barge-In)"
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              voiceState === 'speaking' || voiceState === 'thinking'
                ? 'bg-amber-950/40 border-amber-600/60 text-amber-300 hover:bg-amber-900/50 cursor-pointer active:scale-95'
                : 'bg-zinc-800/40 border-zinc-700/30 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Interrupt</span>
          </button>

          {/* Mute Output Audio Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        {/* Center: Live Status & Latency Gauge */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 bg-black/40 border border-zinc-800 px-3 py-1.5 rounded-lg text-zinc-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-zinc-400 font-medium">WS Pipeline:</span>
            <span className="font-semibold text-emerald-300">
              {connectionState === 'connected' ? 'Connected' : connectionState}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/40 border border-zinc-800 px-3 py-1.5 rounded-lg text-zinc-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-400 font-medium">Latency:</span>
            <span className="font-mono font-semibold text-cyan-300">{latencyMs || 24}ms</span>
          </div>
        </div>

        {/* Right: Persona Intensity Slider */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto bg-black/40 border border-zinc-800/60 px-3 py-1.5 rounded-xl">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-300 gap-2">
              <span>{intensityLabel}</span>
              <span className="text-amber-400 font-mono">{intensity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={intensity}
              onChange={(e) => onIntensityChange(Number(e.target.value))}
              className="w-24 sm:w-28 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
