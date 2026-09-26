import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, Sparkles, Disc, Radio } from 'lucide-react';
import { musicEngine, MusicMoodType, MOOD_TRACKS } from '../utils/musicEngine';
import { PersonaId } from '../types';

interface MoodMusicPlayerProps {
  currentPersonaId: PersonaId;
}

export const MoodMusicPlayer: React.FC<MoodMusicPlayerProps> = ({ currentPersonaId }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.4);
  const [selectedMood, setSelectedMood] = useState<MusicMoodType>(
    (currentPersonaId as MusicMoodType) || 'music_mood'
  );

  // Sync with persona change if playing
  useEffect(() => {
    setSelectedMood(currentPersonaId as MusicMoodType);
    if (isPlaying) {
      musicEngine.setMood(currentPersonaId as MusicMoodType);
    }
  }, [currentPersonaId]);

  useEffect(() => {
    musicEngine.onPlayStateChange = (playing, mood) => {
      setIsPlaying(playing);
      setSelectedMood(mood);
    };

    return () => {
      musicEngine.onPlayStateChange = undefined;
    };
  }, []);

  const handleTogglePlay = () => {
    const playing = musicEngine.togglePlay(selectedMood);
    setIsPlaying(playing);
  };

  const handleMoodSelect = (mood: MusicMoodType) => {
    setSelectedMood(mood);
    if (isPlaying) {
      musicEngine.setMood(mood);
    } else {
      const playing = musicEngine.togglePlay(mood);
      setIsPlaying(playing);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    musicEngine.setVolume(newVol);
  };

  const activeTrack = MOOD_TRACKS[selectedMood] || MOOD_TRACKS.music_mood;

  return (
    <div className="w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Track Info & Play Button */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ${
              isPlaying
                ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-blue-900/40 animate-pulse'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
            title={isPlaying ? 'Pause Mood Music' : 'Play Mood Music'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <Music className="w-3.5 h-3.5 animate-bounce" />
                Mood on Music Assistance
              </span>
              {isPlaying && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono animate-pulse">
                  {activeTrack.bpm} BPM
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 truncate max-w-xs sm:max-w-md">
              <span>{activeTrack.icon}</span>
              <span className="truncate">{activeTrack.title}</span>
            </h4>
            <p className="text-[11px] text-zinc-400">
              {activeTrack.genre} • Key: <strong className="text-zinc-300">{activeTrack.key}</strong>
            </p>
          </div>
        </div>

        {/* Center: Mood Track Selector Chips */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center w-full md:w-auto">
          {(Object.keys(MOOD_TRACKS) as MusicMoodType[]).map((moodKey) => {
            const track = MOOD_TRACKS[moodKey];
            const isSelected = selectedMood === moodKey;

            return (
              <button
                key={moodKey}
                type="button"
                onClick={() => handleMoodSelect(moodKey)}
                className={`text-[11px] px-3 py-1.5 rounded-xl font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm'
                    : 'bg-zinc-800/60 border-zinc-700/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <span>{track.icon}</span>
                <span className="capitalize">{moodKey.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Volume & Soundwave Bars */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Animated visualizer bars */}
          <div className="flex items-center gap-1 h-5 px-2">
            {[40, 80, 100, 60, 90, 50].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlaying ? 'bg-cyan-400' : 'bg-zinc-700'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(6, (h * volume * (1 + (i % 2) * 0.4)))}px` : '4px',
                }}
              />
            ))}
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 bg-black/40 border border-zinc-800/60 px-3 py-1.5 rounded-xl">
            {volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-16 sm:w-20 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              title="Mood music volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
