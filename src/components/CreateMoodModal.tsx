import React, { useState } from 'react';
import { X, Sparkles, Music, Palette, Smile } from 'lucide-react';
import { PersonaConfig } from '../types';

interface CreateMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMood: (customConfig: Partial<PersonaConfig>) => void;
}

const EMOJI_OPTIONS = ['✨', '🌙', '🎧', '🪐', '⚡', '🌊', '🥀', '🔮', '🎮', '☕', '🔥', '🌸'];

const THEMES = [
  { name: 'Violet Nebula', grad: 'from-violet-500 via-purple-500 to-indigo-600', glow: 'rgba(139, 92, 246, 0.45)', border: 'border-violet-500/50' },
  { name: 'Neon Cyber', grad: 'from-cyan-400 via-blue-500 to-indigo-600', glow: 'rgba(59, 130, 246, 0.45)', border: 'border-cyan-500/50' },
  { name: 'Sunset Warmth', grad: 'from-amber-400 via-rose-500 to-pink-600', glow: 'rgba(244, 63, 94, 0.45)', border: 'border-rose-500/50' },
  { name: 'Emerald Forest', grad: 'from-emerald-400 via-teal-500 to-cyan-600', glow: 'rgba(16, 185, 129, 0.45)', border: 'border-emerald-500/50' },
];

export const CreateMoodModal: React.FC<CreateMoodModalProps> = ({
  isOpen,
  onClose,
  onCreateMood,
}) => {
  const [moodTitle, setMoodTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✨');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [preferredMusic, setPreferredMusic] = useState('Lo-Fi Chill & Ambient Keys');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moodTitle.trim()) return;

    onCreateMood({
      actionTitle: moodTitle.trim(),
      name: moodTitle.trim(),
      tagline: description.trim() || 'A custom emotional space created by you',
      avatar: selectedEmoji,
      badge: 'Custom Mood',
      accentColor: selectedTheme.grad,
      glowColor: selectedTheme.glow,
      borderColor: selectedTheme.border,
      vibeStatus: `Custom vibe tuned to ${preferredMusic} 🎵`,
      samplePhrases: [
        `Hey, let's explore this ${moodTitle} vibe together.`,
        `What kind of music pattern should we set for ${moodTitle}?`,
        `Tell me what's on your mind in this custom mood.`
      ],
      systemPrompt: `You are interacting in a personalized Custom Mood named "${moodTitle.trim()}" created by the user.
The user described the mood as: "${description.trim() || 'Custom emotional space'}" and preferred music style: "${preferredMusic}".
Voice & Tone Guidelines:
- Style: Highly attentive, enthusiastic, adaptive, warm, and engaging.
- For the first 3 chats:
  * 1st chat: Acknowledge the user's custom mood "${moodTitle.trim()}" and ask what inspired them to create it and how their heart/mind feels right now.
  * 2nd chat: Ask about the exact music rhythm and sonic energy they want in this space.
  * 3rd chat: Confirm the pattern and lead into a deep, personalized conversation.
- Always keep responses to 1-3 short, spoken sentences.`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Create Your Own Mood</h3>
              <p className="text-[11px] text-zinc-400">
                Design a custom AI atmosphere & sonic frequency
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Mood Title */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
              Mood Name / Title
            </label>
            <input
              type="text"
              required
              value={moodTitle}
              onChange={(e) => setMoodTitle(e.target.value)}
              placeholder="e.g., Late Night Study Grind, Euphoric Dream, Cozy Nostalgia"
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Tagline / Description */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
              How does this mood feel?
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Deep focus with rain sounds, or chill talk after a long day"
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Emoji Avatar Picker */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
              Choose Mood Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                    selectedEmoji === emoji
                      ? 'bg-purple-600 text-white scale-110 shadow-md ring-2 ring-purple-400'
                      : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Music Style Preference */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
              Music Style & Sound Vibe
            </label>
            <select
              value={preferredMusic}
              onChange={(e) => setPreferredMusic(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Lo-Fi Chill & Ambient Keys">Lo-Fi Chill & Ambient Keys (Relaxed)</option>
              <option value="R&B Soul & Bedroom Pop">R&B Soul & Bedroom Pop (Smooth & Bouncy)</option>
              <option value="Dark Phonk & Drill 808s">Dark Phonk & Drill 808s (Hype & Rage)</option>
              <option value="Acoustic Folk & Soft Rain">Acoustic Folk & Soft Rain (Emotional & Cozy)</option>
              <option value="Synthwave & Retro Arpeggios">Synthwave & Retro Arpeggios (Futuristic)</option>
            </select>
          </div>

          {/* Theme Color */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
              Atmosphere Color Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => setSelectedTheme(theme)}
                  className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                    selectedTheme.name === theme.name
                      ? 'bg-zinc-800 border-white/40 text-white shadow'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${theme.grad}`} />
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/40 transition-all cursor-pointer active:scale-98"
            >
              Launch Custom Mood
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
