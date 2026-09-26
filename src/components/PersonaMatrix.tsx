import React from 'react';
import { PersonaConfig, PersonaId } from '../types';
import { PERSONAS } from '../personas/personaConfig';
import { Sparkles, Flame, Heart, Mic, CheckCircle2, Volume2 } from 'lucide-react';

interface PersonaMatrixProps {
  selectedPersonaId: PersonaId;
  onSelectPersona: (personaId: PersonaId) => void;
  onSamplePhraseClick?: (phrase: string) => void;
  isStreaming: boolean;
}

export const PersonaMatrix: React.FC<PersonaMatrixProps> = ({
  selectedPersonaId,
  onSelectPersona,
  onSamplePhraseClick,
  isStreaming,
}) => {
  const personaList = Object.values(PERSONAS);

  const getPersonaIcon = (id: PersonaId) => {
    switch (id) {
      case 'flirt_girl':
        return <Sparkles className="w-4 h-4 text-pink-400" />;
      case 'fight_roast':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'permanent_partner':
        return <Heart className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            Persona Matrix
            <span className="text-xs font-normal text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/50">
              Live Dynamic Switching
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Pick a character to switch live AI voice model & system prompt in real-time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {personaList.map((persona) => {
          const isSelected = persona.id === selectedPersonaId;

          return (
            <div
              key={persona.id}
              onClick={() => onSelectPersona(persona.id)}
              className={`relative rounded-2xl p-4 cursor-pointer transition-all duration-300 border text-left overflow-hidden group flex flex-col justify-between ${
                isSelected
                  ? `bg-zinc-900/90 ${persona.borderColor} shadow-lg ring-1 ring-white/10`
                  : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/70'
              }`}
              style={{
                boxShadow: isSelected ? `0 0 30px ${persona.glowColor}` : undefined,
              }}
            >
              {/* Dynamic top gradient bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${persona.accentColor} ${
                  isSelected ? 'opacity-100' : 'opacity-30 group-hover:opacity-60'
                }`}
              />

              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-105 shadow-md ${
                        isSelected
                          ? `bg-gradient-to-br ${persona.accentColor} text-white`
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {persona.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">{persona.name.split(' ')[0]}</span>
                        {getPersonaIcon(persona.id)}
                      </div>
                      <span className="text-[11px] font-medium text-zinc-400 block">
                        Voice: <strong className="text-zinc-200">{persona.voice}</strong>
                      </span>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full animate-pulse">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-zinc-500 bg-zinc-800/60 border border-zinc-700/40 px-2 py-0.5 rounded-full">
                      {persona.badge}
                    </span>
                  )}
                </div>

                {/* Tagline */}
                <p className="text-xs text-zinc-300 font-medium mb-2.5 line-clamp-2">
                  {persona.tagline}
                </p>

                {/* Vibe Status */}
                <div className="text-[11px] text-zinc-400 bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 mb-3 flex items-center gap-1.5">
                  <span className="text-xs">⚡</span>
                  <span className="truncate italic">{persona.vibeStatus}</span>
                </div>

                {/* Personality Traits */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {persona.traits.slice(0, 3).map((trait, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample test prompt chip */}
              <div className="pt-2 border-t border-zinc-800/60">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                  Try Saying:
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSamplePhraseClick) {
                      onSamplePhraseClick(persona.samplePhrases[0]);
                    }
                  }}
                  className="w-full text-left text-[11px] text-zinc-300 bg-zinc-800/40 hover:bg-zinc-800/80 hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-700/30 transition-colors flex items-center justify-between group/phrase"
                >
                  <span className="truncate italic">"{persona.samplePhrases[0]}"</span>
                  <Volume2 className="w-3 h-3 text-zinc-500 group-hover/phrase:text-white shrink-0 ml-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
