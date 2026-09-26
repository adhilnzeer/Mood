import React from 'react';
import { PersonaConfig, PersonaId } from '../types';
import { Zap, Sparkles, Swords, Heart, Headphones } from 'lucide-react';

interface QuickSparksProps {
  currentPersona: PersonaConfig;
  onTriggerClick: (prompt: string) => void;
  disabled?: boolean;
}

const PERSONA_TRIGGERS: Record<PersonaId, { label: string; icon: any; prompts: string[] }> = {
  permanent_partner: {
    label: 'Make Love & Comfort Prompts',
    icon: Heart,
    prompts: [
      'I had an exhausting day, can you hold space for me? 🥺',
      'Remind me that you are here and I am safe with you',
      'Tell me what you love about listening to me late at night',
      'I feel a bit overwhelmed right now, talk to me softly',
    ],
  },
  flirt_girl: {
    label: 'Make a Flirt Prompts',
    icon: Sparkles,
    prompts: [
      'Rate my rizz on a scale of 1 to 10 😏',
      'Tease me about being up this late',
      'What are you wearing to our imaginary late-night date?',
      'Tell me the biggest red flag you see in me',
    ],
  },
  fight_roast: {
    label: 'Make a Fight Prompts',
    icon: Swords,
    prompts: [
      'Roast my gaming skills right now 🔥',
      'Tell me why my taste in music is absolute trash',
      'Give me your most unhinged, devastating comeback',
      'Why do you sound like a toaster running on 1% battery?',
    ],
  },
  music_mood: {
    label: 'Mood on Music Prompts',
    icon: Headphones,
    prompts: [
      'Recommend songs that sound like staring at the ceiling at 2 AM 🎧',
      'What track matches my current chaotic mood right now?',
      'Tell me what frequency heals a broken heart',
      'Give me the ultimate hype gym track for rage motivation',
    ],
  },
  custom_mood: {
    label: 'Custom Mood Prompts',
    icon: Sparkles,
    prompts: [
      'Tell me how this custom space feels to you ✨',
      'What kind of music pattern should we set for this room?',
      'Let us explore this custom mood together',
      'Ask me something personal tailored to this mood',
    ],
  },
};

export const RageOrFlirtTriggers: React.FC<QuickSparksProps> = ({
  currentPersona,
  onTriggerClick,
  disabled,
}) => {
  const triggerData = PERSONA_TRIGGERS[currentPersona.id] || PERSONA_TRIGGERS.permanent_partner;
  const IconComponent = triggerData.icon;

  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3.5 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-2.5">
        <IconComponent className="w-4 h-4 text-amber-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          {triggerData.label}
        </h4>
        <span className="text-[10px] text-zinc-500 italic">One-tap conversation sparks</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {triggerData.prompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onTriggerClick(prompt)}
            className="text-left text-xs bg-zinc-800/70 hover:bg-zinc-800 text-zinc-200 hover:text-white px-3 py-2.5 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
          >
            <span className="line-clamp-2 pr-1">{prompt}</span>
            <Zap className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 shrink-0 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};
