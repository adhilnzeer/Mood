import React, { useState, useEffect } from 'react';
import { PersonaId } from '../types';
import { MOOD_SONGS, MoodSong } from '../utils/musicTracks';
import { musicEngine, MusicMoodType } from '../utils/musicEngine';
import { Music, Play, Pause, Volume2, VolumeX, Sparkles, Disc, Radio, FastForward, Headphones, Quote } from 'lucide-react';

interface MoodMusicColumnProps {
  personaId: PersonaId;
  onAskMusicAssistant: (prompt: string) => void;
}

export const MoodMusicColumn: React.FC<MoodMusicColumnProps> = ({
  personaId,
  onAskMusicAssistant,
}) => {
  const songs = MOOD_SONGS[personaId] || MOOD_SONGS.permanent_partner;
  const [activeSongIndex, setActiveSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(musicEngine.getIsPlaying());
  const [volume, setVolume] = useState<number>(musicEngine.getVolume());

  const currentSong: MoodSong = songs[activeSongIndex] || songs[0];

  useEffect(() => {
    setActiveSongIndex(0);
    const moodKey = personaId as MusicMoodType;
    if (isPlaying) {
      musicEngine.setMood(moodKey);
    }
  }, [personaId]);

  useEffect(() => {
    const handleState = (playing: boolean) => {
      setIsPlaying(playing);
    };
    musicEngine.onPlayStateChange = handleState;
  }, []);

  const handleTogglePlay = () => {
    const playing = musicEngine.togglePlay(personaId as MusicMoodType);
    setIsPlaying(playing);
  };

  const handleSelectSong = (index: number) => {
    setActiveSongIndex(index);
    if (!isPlaying) {
      musicEngine.play(personaId as MusicMoodType);
      setIsPlaying(true);
    }
  };

  const handleNextSong = () => {
    const nextIdx = (activeSongIndex + 1) % songs.length;
    handleSelectSong(nextIdx);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    musicEngine.setVolume(newVol);
  };

  // Persona-specific styling
  const theme = {
    permanent_partner: {
      accentText: 'text-rose-400',
      badgeBg: 'bg-rose-950/60 border-rose-800 text-rose-300',
      playBtn: 'bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-900/40',
      activeBorder: 'border-rose-500/50 bg-rose-950/20',
      waveColor: 'bg-rose-400',
      headerTitle: 'Love & Comfort Music Assistant',
    },
    flirt_girl: {
      accentText: 'text-pink-400',
      badgeBg: 'bg-pink-950/60 border-pink-800 text-pink-300',
      playBtn: 'bg-gradient-to-r from-pink-500 to-fuchsia-600 shadow-pink-900/40',
      activeBorder: 'border-pink-500/50 bg-pink-950/20',
      waveColor: 'bg-pink-400',
      headerTitle: 'Flirt & Rizz Music Assistant',
    },
    fight_roast: {
      accentText: 'text-orange-400',
      badgeBg: 'bg-orange-950/60 border-orange-800 text-orange-300',
      playBtn: 'bg-gradient-to-r from-amber-500 to-red-600 shadow-orange-900/40',
      activeBorder: 'border-orange-500/50 bg-orange-950/20',
      waveColor: 'bg-orange-400',
      headerTitle: 'Rage & Battle Music Assistant',
    },
    music_mood: {
      accentText: 'text-cyan-400',
      badgeBg: 'bg-cyan-950/60 border-cyan-800 text-cyan-300',
      playBtn: 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-900/40',
      activeBorder: 'border-cyan-500/50 bg-cyan-950/20',
      waveColor: 'bg-cyan-400',
      headerTitle: 'Sonic Mood Music Assistant',
    },
    custom_mood: {
      accentText: 'text-purple-400',
      badgeBg: 'bg-purple-950/60 border-purple-800 text-purple-300',
      playBtn: 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-900/40',
      activeBorder: 'border-purple-500/50 bg-purple-950/20',
      waveColor: 'bg-purple-400',
      headerTitle: 'Custom Mood Music Assistant',
    },
  }[personaId] || {
    accentText: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/60 border-cyan-800 text-cyan-300',
    playBtn: 'bg-gradient-to-r from-cyan-500 to-blue-600',
    activeBorder: 'border-cyan-500/50',
    waveColor: 'bg-cyan-400',
    headerTitle: 'Mood on Music Assistant',
  };

  return (
    <div className="flex flex-col h-full glass-water rounded-[36px] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-sm shadow">
            <Music className={`w-4 h-4 ${theme.accentText}`} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>{theme.headerTitle}</span>
            </h3>
            <span className="text-[10px] text-zinc-400 font-mono">
              Mood-Matched Sound Engine
            </span>
          </div>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-1">
            {[40, 75, 100, 60, 85].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full ${theme.waveColor} animate-pulse`}
                style={{ height: `${(h * volume * 0.16) + 4}px` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Now Playing Mini Player Box */}
      <div className="p-4 border-b border-zinc-800/70 bg-black/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Play / Pause button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform cursor-pointer active:scale-95 shrink-0 ${theme.playBtn}`}
              title={isPlaying ? 'Pause Mood Track' : 'Play Mood Track'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{currentSong.icon}</span>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {currentSong.title}
                </h4>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                {currentSong.artistOrVibe}
              </p>
            </div>
          </div>

          {/* Next Song Button */}
          <button
            type="button"
            onClick={handleNextSong}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer shrink-0"
            title="Next Mood Track"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Volume & Details Row */}
        <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="font-mono">
            {currentSong.bpm} BPM • {currentSong.key}
          </span>

          <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800 px-2.5 py-1 rounded-xl">
            {volume === 0 ? (
              <VolumeX className="w-3 h-3 text-zinc-500" />
            ) : (
              <Volume2 className={`w-3 h-3 ${theme.accentText}`} />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>
      </div>

      {/* Mood-Wise Songs Playlist */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[310px] scrollbar-thin scrollbar-thumb-zinc-700">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
            Mood Playlist ({songs.length} Tracks)
          </span>
          <span className="text-[10px] text-zinc-500">Tap to play</span>
        </div>

        {songs.map((song, idx) => {
          const isSelected = activeSongIndex === idx;

          return (
            <div
              key={song.id}
              onClick={() => handleSelectSong(idx)}
              className={`p-2.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex items-center justify-between gap-2 group ${
                isSelected
                  ? `${theme.activeBorder} shadow-md`
                  : 'bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800/70 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-sm shrink-0">{song.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-100 truncate">
                      {song.title}
                    </span>
                    {isSelected && isPlaying && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 block truncate">
                    {song.artistOrVibe}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-black/40 text-zinc-400 border border-white/5 font-mono">
                  {song.tag}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {song.duration}
                </span>
              </div>
            </div>
          );
        })}

        {/* Lyrics & Vibe Quote highlight */}
        <div className="mt-3 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-semibold mb-1">
            <Quote className={`w-3 h-3 ${theme.accentText}`} />
            <span>Vibe Highlight:</span>
          </div>
          <p className="italic text-zinc-300 text-[11px] leading-relaxed">
            {currentSong.lyricsHighlight}
          </p>
        </div>
      </div>

      {/* Ask Music Assistant Prompts */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950/60">
        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-2">
          Ask Music Assistant
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onAskMusicAssistant(`What song matches my mood right now with ${currentSong.title}?`)}
            className="text-[11px] text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 px-2.5 py-1 rounded-xl border border-zinc-700/50 transition-colors cursor-pointer"
          >
            🎵 Vibe check this song
          </button>
          <button
            type="button"
            onClick={() => onAskMusicAssistant(`Recommend 3 songs with the exact same emotional frequency as this mood.`)}
            className="text-[11px] text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 px-2.5 py-1 rounded-xl border border-zinc-700/50 transition-colors cursor-pointer"
          >
            🎧 Recommend playlist
          </button>
        </div>
      </div>
    </div>
  );
};
