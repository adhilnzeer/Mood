import React, { useState } from 'react';
import { PersonaId, PersonaConfig, UserProfile } from '../types';
import {
  Sparkles,
  Swords,
  ArrowRight,
  PlusCircle,
  Users,
  Search,
  Heart,
  UserPlus,
  Globe,
  Briefcase,
  MapPin,
} from 'lucide-react';

interface MoodSelectorHomeProps {
  onSelectMood: (moodId: PersonaId) => void;
  onOpenCreateMoodModal: () => void;
  customMood?: PersonaConfig | null;
  currentUser?: UserProfile | null;
  onOpenFindFriends: (searchUsername?: string) => void;
  onOpenCommunity: () => void;
  onOpenAuth: (pendingUsername?: string) => void;
}

export const MoodSelectorHome: React.FC<MoodSelectorHomeProps> = ({
  onSelectMood,
  onOpenCreateMoodModal,
  customMood,
  currentUser,
  onOpenFindFriends,
  onOpenCommunity,
  onOpenAuth,
}) => {
  const [usernameSearch, setUsernameSearch] = useState('');

  const moodCards: {
    id: PersonaId;
    title: string;
    icon: any;
    waterGradient: string;
    glowShadow: string;
    shapeClasses: string;
    specularHighlight: string;
    avatarEmoji: string;
    description: string;
  }[] = [
    {
      id: 'permanent_partner',
      title: 'Love',
      icon: Heart,
      avatarEmoji: '💖',
      description: 'Tender affection & warmth',
      waterGradient: 'from-zinc-700/30 via-slate-800/20 to-neutral-900/40',
      glowShadow: 'rgba(244, 63, 94, 0.25)',
      shapeClasses: 'rounded-[46px] rounded-tl-[24px] rounded-br-[24px]',
      specularHighlight: 'border-zinc-600/40 hover:border-pink-400/50',
    },
    {
      id: 'flirt_girl',
      title: 'Flirt',
      icon: Sparkles,
      avatarEmoji: '💋',
      description: 'Playful chemistry & sparks',
      waterGradient: 'from-zinc-700/30 via-slate-800/20 to-neutral-900/40',
      glowShadow: 'rgba(217, 70, 239, 0.25)',
      shapeClasses: 'rounded-[46px] rounded-tr-[24px] rounded-bl-[24px]',
      specularHighlight: 'border-zinc-600/40 hover:border-purple-400/50',
    },
    {
      id: 'fight_roast',
      title: 'Fight',
      icon: Swords,
      avatarEmoji: '🔥',
      description: 'Spicy roasts & banter',
      waterGradient: 'from-zinc-700/30 via-slate-800/20 to-neutral-900/40',
      glowShadow: 'rgba(249, 115, 22, 0.25)',
      shapeClasses: 'rounded-[40px] rounded-tl-[18px] rounded-br-[18px]',
      specularHighlight: 'border-zinc-600/40 hover:border-amber-400/50',
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = usernameSearch.trim().replace(/^@/, '');
    if (currentUser) {
      onOpenFindFriends(query);
    } else {
      onOpenAuth(query);
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-6 sm:py-12 overflow-hidden">
      {/* Grey Shady Liquid Drop Ambient Background */}
      <div className="absolute top-10 left-1/4 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-zinc-700/25 via-slate-800/35 to-neutral-900/50 blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-zinc-800/30 via-neutral-900/40 to-black blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-slate-900/40 blur-3xl pointer-events-none -z-10" />

      {/* Floating Shady Water Droplet Bubbles */}
      <div className="absolute top-20 right-10 w-24 h-24 rounded-full shady-liquid-drop opacity-40 blur-[1px] pointer-events-none hidden lg:block" />
      <div className="absolute bottom-24 left-10 w-32 h-32 rounded-full shady-liquid-drop opacity-30 blur-[1px] pointer-events-none hidden lg:block" />

      {/* Handwritten Aesthetic Mood Title */}
      <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
        <h2 className="text-6xl sm:text-8xl font-handwritten font-bold text-white tracking-wide drop-shadow-md">
          Moods
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-medium tracking-wide">
          Select your vibe or explore soundscapes
        </p>
      </div>

      {/* 3 Grey Shady Liquid-Glass Mood Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 w-full max-w-5xl px-2">
        {moodCards.map((card) => {
          return (
            <div
              key={card.id}
              onClick={() => onSelectMood(card.id)}
              className={`relative p-8 sm:p-9 text-center cursor-pointer transition-all duration-500 group flex flex-col items-center justify-between min-h-[310px] sm:min-h-[350px] glass-grey-liquid glass-grey-liquid-card water-sheen ${card.shapeClasses} ${card.specularHighlight} hover:scale-[1.03] active:scale-[0.98]`}
              style={{
                boxShadow: `0 24px 50px -10px ${card.glowShadow}, 0 10px 25px rgba(0, 0, 0, 0.6), inset 0 1.5px 2px rgba(255, 255, 255, 0.35)`,
              }}
            >
              {/* Internal shaded liquid reflection highlight */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${card.waterGradient} pointer-events-none ${card.shapeClasses}`}
              />

              {/* Top Water Drop Bevel Light */}
              <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              {/* Shady liquid droplet avatar bubble */}
              <div className="relative mt-2">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-transform duration-500 group-hover:scale-110 relative shady-liquid-drop"
                  style={{
                    boxShadow: `0 18px 35px ${card.glowShadow}, inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -3px 5px rgba(0, 0, 0, 0.6)`,
                  }}
                >
                  <span>{card.avatarEmoji}</span>
                </div>
              </div>

              {/* Handwritten Single-Word Mood Title */}
              <div className="my-auto py-3 z-10 flex flex-col items-center">
                <h3 className="text-4xl sm:text-5xl font-handwritten font-bold text-white tracking-wide group-hover:text-pink-300 transition-colors flex items-center gap-2">
                  <span>{card.title}</span>
                </h3>
                <span className="text-[11px] text-zinc-400 mt-1 font-medium">
                  {card.description}
                </span>
              </div>

              {/* Minimal Shaded Liquid Tap Pill */}
              <div className="z-10 mt-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-300 group-hover:text-white bg-white/5 group-hover:bg-white/15 border border-white/10 group-hover:border-white/30 backdrop-blur-md transition-all shadow-sm">
                  <span>Enter</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dual Find Friends & Global Community Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl mt-7 sm:mt-9 px-2">
        {/* Find Friends Card */}
        <div className="p-6 rounded-[34px] glass-grey-liquid border border-zinc-700/60 shadow-xl flex flex-col justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 border border-white/20 flex items-center justify-center text-white shadow-lg shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Find Friends
              </h3>
              <p className="text-xs text-zinc-300 mt-0.5">
                Search people using their @username to connect & chat
              </p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full mt-1">
            <div className="relative flex-1">
              <input
                type="text"
                value={usernameSearch}
                onChange={(e) => setUsernameSearch(e.target.value)}
                placeholder="Search by @username..."
                className="w-full bg-black/60 border border-zinc-700/80 hover:border-cyan-500 rounded-full px-4 py-2.5 pl-9 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 border border-white/10"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Global Community Card */}
        <div
          onClick={onOpenCommunity}
          className="p-6 rounded-[34px] glass-grey-liquid hover:bg-zinc-800/40 border border-zinc-700/60 hover:border-indigo-400/50 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between gap-4 relative overflow-hidden group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 border border-white/20 flex items-center justify-center text-white shadow-lg shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                  Community
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Global Hub
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Check jobs, discover places & connect with members worldwide
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
            <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                Jobs
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Places
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-pink-400" />
                People
              </span>
            </div>

            <span className="inline-flex items-center gap-1 font-bold text-cyan-300 group-hover:translate-x-1 transition-transform">
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* "Create Your Own Mood" option at the bottom */}
      <div className="w-full max-w-5xl mt-5 px-2">
        {customMood ? (
          <div
            onClick={() => onSelectMood('custom_mood')}
            className="p-6 rounded-[36px] glass-grey-liquid border-purple-400/30 hover:border-purple-300/60 transition-all duration-300 cursor-pointer shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg border border-white/30 shrink-0 shady-liquid-drop"
              >
                {customMood.avatar}
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-2xl sm:text-3xl font-handwritten font-bold text-white">
                  {customMood.actionTitle}
                </h4>
                <span className="text-[11px] font-bold text-purple-300">
                  Custom Mood
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMood('custom_mood');
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-md"
              >
                <span>Enter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCreateMoodModal();
                }}
                className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Edit
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={onOpenCreateMoodModal}
            className="p-5 sm:p-6 rounded-[34px] glass-grey-liquid hover:bg-zinc-800/40 border border-zinc-700/60 hover:border-purple-400/40 transition-all duration-300 cursor-pointer shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 group-hover:scale-105 transition-all flex items-center justify-center text-purple-300 shrink-0">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  Create Your Own Mood
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCreateMoodModal();
              }}
              className="px-5 py-2 rounded-full bg-white/10 group-hover:bg-purple-600/80 border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow shrink-0 cursor-pointer backdrop-blur-md"
            >
              <span>Create</span>
              <PlusCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
