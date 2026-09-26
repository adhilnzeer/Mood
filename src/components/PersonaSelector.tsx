import React from 'react';
import { PersonaId } from '../types';
import { PERSONAS } from '../personas/personaConfig';
import { Heart, Sparkles, Swords, Headphones, Mic, Settings2 } from 'lucide-react';

interface PersonaSelectorProps {
  selectedPersonaId: PersonaId;
  onSelectPersona: (personaId: PersonaId) => void;
  onOpenVoiceAssistant: () => void;
  voiceState: string;
  isMicActive: boolean;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPersonaId,
  onSelectPersona,
  onOpenVoiceAssistant,
  voiceState,
  isMicActive,
}) => {
  const modes: { id: PersonaId; title: string; subtitle: string; icon: any; iconColor: string; activeBadge: string }[] = [
    {
      id: 'permanent_partner',
      title: 'Make Love',
      subtitle: 'Soft warmth, deep care & heartfelt late-night comfort',
      icon: Heart,
      iconColor: 'text-rose-400',
      activeBadge: 'Tender Soulmate Active',
    },
    {
      id: 'flirt_girl',
      title: 'Make a Flirt',
      subtitle: 'Cheeky teasing, charming banter & spicy chemistry',
      icon: Sparkles,
      iconColor: 'text-pink-400',
      activeBadge: 'Flirty Banter Active',
    },
    {
      id: 'fight_roast',
      title: 'Make a Fight',
      subtitle: 'Savage roasts, rage battles & zero-chill burns',
      icon: Swords,
      iconColor: 'text-orange-400',
      activeBadge: 'Rage Battle Active',
    },
    {
      id: 'music_mood',
      title: 'Mood on Music',
      subtitle: 'Ambient beats, music therapy & sonic vibe curation',
      icon: Headphones,
      iconColor: 'text-cyan-400',
      activeBadge: 'Sonic DJ Active',
    },
  ];

  return (
    <div className="w-full">
      {/* 4 Main Choice Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {modes.map((mode) => {
          const isSelected = selectedPersonaId === mode.id;
          const Icon = mode.icon;
          const persona = PERSONAS[mode.id];

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectPersona(mode.id)}
              className={`relative rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer overflow-hidden border flex flex-col justify-between group ${
                isSelected
                  ? `bg-zinc-900/90 ${persona.borderColor} shadow-xl ring-2 ring-white/10`
                  : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/70 hover:border-zinc-700'
              }`}
              style={{
                boxShadow: isSelected ? `0 0 35px ${persona.glowColor}` : undefined,
              }}
            >
              {/* Highlight bar at top */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${persona.accentColor} ${
                  isSelected ? 'opacity-100' : 'opacity-20 group-hover:opacity-60'
                }`}
              />

              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform duration-200 group-hover:scale-105 shadow-md ${
                        isSelected
                          ? `bg-gradient-to-br ${persona.accentColor} text-white shadow-lg`
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {persona.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1">
                        {mode.title}
                        <Icon className={`w-3.5 h-3.5 ${mode.iconColor}`} />
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-medium">
                        <strong className="text-zinc-200">{persona.name.split(' ')[0]}</strong>
                      </p>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                      Active
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-full border border-zinc-700/40">
                      Pick
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-300/90 font-normal leading-relaxed line-clamp-2">
                  {mode.subtitle}
                </p>
              </div>

              {/* Status bar */}
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400">
                <span className="italic truncate mr-1">{persona.vibeStatus.split(' ')[0]} {persona.vibeStatus.split(' ')[1]}</span>
                <span className="shrink-0 font-medium text-zinc-300 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                  {persona.voice}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Action banner to launch or adjust Voice Assistant Option */}
      <div className="bg-gradient-to-r from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 border border-zinc-800/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
              <Mic className="w-5 h-5" />
            </div>
            {isMicActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-zinc-900 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-sm font-bold text-white">Voice Assistant Settings & Mode</span>
              {isMicActive ? (
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  LIVE TALKING
                </span>
              ) : (
                <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.2 rounded-full border border-zinc-700/50">
                  Standby
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Live microphone stream, audio controls, voice orb, and real-time parameters
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenVoiceAssistant}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-purple-900/30 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Settings2 className="w-4 h-4" />
          <span>Voice Assistant Options</span>
        </button>
      </div>
    </div>
  );
};
