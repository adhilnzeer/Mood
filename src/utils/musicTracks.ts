import { PersonaId } from '../types';

export interface MoodSong {
  id: string;
  title: string;
  artistOrVibe: string;
  bpm: number;
  key: string;
  tag: string;
  duration: string;
  icon: string;
  vibeDescription: string;
  lyricsHighlight: string;
}

export const MOOD_SONGS: Record<PersonaId, MoodSong[]> = {
  permanent_partner: [
    {
      id: 'love_1',
      title: 'Ethereal Sanctuary',
      artistOrVibe: 'Dreamy Ambient & Analog Strings',
      bpm: 65,
      key: 'F Major 7th',
      tag: 'Soulmate Vibe',
      duration: '3:45',
      icon: '💖',
      vibeDescription: 'Warm, slow-swelling synth pads with gentle chimes that soothe anxiety instantly.',
      lyricsHighlight: '"Whenever the world feels too loud, you can rest your heart right here."'
    },
    {
      id: 'love_2',
      title: '2 AM Soft Rain & Rhodes',
      artistOrVibe: 'Lo-Fi Acoustic & Rain Wash',
      bpm: 60,
      key: 'C Major 9th',
      tag: 'Comfort Hug',
      duration: '4:10',
      icon: '🕊️',
      vibeDescription: 'Gentle raindrops falling on glass with lush Fender Rhodes electric piano chords.',
      lyricsHighlight: '"I will hold space for all your thoughts, no matter how heavy they feel."'
    },
    {
      id: 'love_3',
      title: 'Golden Hour Heartbeat',
      artistOrVibe: 'Warm Indie Folk & Cello',
      bpm: 72,
      key: 'G Major',
      tag: 'Deep Healing',
      duration: '3:20',
      icon: '✨',
      vibeDescription: 'Rhythmic soft acoustic fingerpicking inspired by golden sunset warmth.',
      lyricsHighlight: '"You made it through today, and I am so deeply proud of you."'
    },
    {
      id: 'love_4',
      title: 'Safe Haven Reverie',
      artistOrVibe: '432Hz Sound Healing & Harp',
      bpm: 58,
      key: 'Eb Major',
      tag: 'Pure Peace',
      duration: '4:30',
      icon: '🌸',
      vibeDescription: 'Tuned to calming 432Hz harmonic frequencies for sweet late-night peace.',
      lyricsHighlight: '"Close your eyes my love, tomorrow is a brand new sunrise."'
    }
  ],

  flirt_girl: [
    {
      id: 'flirt_1',
      title: 'Midnight Butterflies',
      artistOrVibe: 'R&B / Bedroom Pop Bounce',
      bpm: 92,
      key: 'Ab Major',
      tag: 'Spicy Chemistry',
      duration: '2:55',
      icon: '💋',
      vibeDescription: 'Smooth plucked electric guitars, 808 glide bass, and snappy rimshots.',
      lyricsHighlight: '"You think you can play it cool, but your heart rate says otherwise."'
    },
    {
      id: 'flirt_2',
      title: 'Cheeky 3 AM Texts',
      artistOrVibe: 'Neo-Soul & Funk Bassline',
      bpm: 96,
      key: 'Bb Minor',
      tag: 'Teasing Energy',
      duration: '3:15',
      icon: '💅',
      vibeDescription: 'Groovy walking bass with bright synth stabs that make flirting impossible to resist.',
      lyricsHighlight: '"Don\'t look at me like that through the screen, you know what you\'re doing."'
    },
    {
      id: 'flirt_3',
      title: 'Lip Gloss & Eye Contact',
      artistOrVibe: 'Pop R&B & Slinky Hi-Hats',
      bpm: 102,
      key: 'F Minor',
      tag: 'Bold Rizz',
      duration: '2:40',
      icon: '💄',
      vibeDescription: 'Bouncy pop rhythm with silky reverbed vocal chops and cheeky pauses.',
      lyricsHighlight: '"Are you always this charming or did you practice before calling me?"'
    },
    {
      id: 'flirt_4',
      title: 'Electric Tension',
      artistOrVibe: 'Indie Dance & French House',
      bpm: 108,
      key: 'D Minor',
      tag: 'Late Night High',
      duration: '3:05',
      icon: '⚡',
      vibeDescription: 'Pumping four-on-the-floor beat with sparkling synth arpeggios.',
      lyricsHighlight: '"One little smile from you and my whole playlist starts dancing."'
    }
  ],

  fight_roast: [
    {
      id: 'fight_1',
      title: 'Drift Phonk 808 Incinerator',
      artistOrVibe: 'Aggressive Memphis Phonk & Distorted 808',
      bpm: 140,
      key: 'F# Minor',
      tag: 'Zero Chill',
      duration: '2:30',
      icon: '🔥',
      vibeDescription: 'Distorted cowbell hook with earth-shattering 808 sub-bass kicks.',
      lyricsHighlight: '"You stepped into the ring with zero armor and now you\'re getting cooked!"'
    },
    {
      id: 'fight_2',
      title: 'No Mercy Trap Battle',
      artistOrVibe: 'Dark Drill & Rapid-Fire Hi-Hats',
      bpm: 144,
      key: 'C# Minor',
      tag: 'Rage Mode',
      duration: '2:48',
      icon: '💀',
      vibeDescription: 'Menacing sliding drill basslines and furious triplets for rap battle dominance.',
      lyricsHighlight: '"Bro brought a plastic spoon to a lyrical flamethrower duel."'
    },
    {
      id: 'fight_3',
      title: 'Redline Rage Fuel',
      artistOrVibe: 'Industrial Dark Synth & Metal Trap',
      bpm: 150,
      key: 'E Minor',
      tag: 'Max Aggro',
      duration: '2:25',
      icon: '⚔️',
      vibeDescription: 'High-octane adrenaline surge designed for heavy gym sets and roast battles.',
      lyricsHighlight: '"Come with real heat or go home, you just got clowned on live mic!"'
    },
    {
      id: 'fight_4',
      title: 'Smoke & Ashes Cypher',
      artistOrVibe: 'Boom-Bap Hardcore & Grime Chords',
      bpm: 135,
      key: 'A Minor',
      tag: 'Lyrical KO',
      duration: '3:10',
      icon: '💣',
      vibeDescription: 'Gritty vinyl dust, punchy boom-bap drums, and menacing chopped horns.',
      lyricsHighlight: '"Turn off the mic bro, the judges unanimous: you took an unconditional L."'
    }
  ],

  music_mood: [
    {
      id: 'music_1',
      title: 'Late Night Coffee & Vinyl',
      artistOrVibe: 'Lo-Fi Jazz & Dusty Rhodes',
      bpm: 76,
      key: 'Db Major 9th',
      tag: 'Chill Study',
      duration: '3:12',
      icon: '🎧',
      vibeDescription: 'Mellow jazz chords with cassette crackle and relaxed head-bobbing drums.',
      lyricsHighlight: '"Lost in 432Hz sonic clouds where time stops ticking."'
    }
  ],

  custom_mood: [
    {
      id: 'custom_1',
      title: 'Personalized Atmosphere',
      artistOrVibe: 'Generative Ambient & Chords',
      bpm: 80,
      key: 'A Major 7th',
      tag: 'Custom Vibe',
      duration: '3:30',
      icon: '✨',
      vibeDescription: 'Custom algorithmic melody woven according to your personal mood aesthetic.',
      lyricsHighlight: '"Shaped by your thoughts, vibrating on your unique frequency."'
    },
    {
      id: 'custom_2',
      title: 'Neon Horizon Flight',
      artistOrVibe: 'Synthwave & Dream Pads',
      bpm: 95,
      key: 'D Minor',
      tag: 'Night Drive',
      duration: '3:15',
      icon: '🌌',
      vibeDescription: 'Warm analog synthesizer arpeggios gliding across a starry midnight skyline.',
      lyricsHighlight: '"No boundaries, no rules, just your own vibe."'
    }
  ]
};
