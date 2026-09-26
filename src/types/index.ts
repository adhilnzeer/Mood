export type PersonaId = 'flirt_girl' | 'fight_roast' | 'permanent_partner' | 'music_mood' | 'custom_mood';

export type VoiceName = 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon' | 'Aoede';

export type AssistantGender = 'female' | 'male';

export interface UserProfile {
  name: string;
  age?: number;
  phone: string;
  email: string;
  username: string;
  moodName?: string;
  avatar?: string;
  profilePhoto?: string;
  bio?: string;
  statusMessage?: string;
  friendsCollection?: string[];
  isOnline?: boolean;
}

export interface DirectMessage {
  id: string;
  fromUsername: string;
  toUsername: string; // recipient username or 'mood_lounge'
  fromName: string;
  fromPhone?: string;
  fromEmail?: string;
  fromMoodName: string;
  fromAvatar?: string;
  text: string;
  timestamp: number;
  type?: 'text' | 'voice' | 'snap_mood';
  mediaUrl?: string;
  isRead?: boolean;
}

export interface MoodContact {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  moodName: string;
  avatar: string;
  statusMessage: string;
  isOnline: boolean;
  lastSeen?: string;
  unreadCount?: number;
}

export interface PersonaConfig {
  id: PersonaId;
  name: string;
  actionTitle: string; // "Make a Flirt", "Make a Fight", "Make Love", or Custom
  tagline: string;
  avatar: string;
  badge: string;
  accentColor: string;
  glowColor: string;
  borderColor: string;
  bgGradient: string;
  voice: VoiceName;
  genderVoice?: {
    female: { name: string; voice: VoiceName; avatar: string };
    male: { name: string; voice: VoiceName; avatar: string };
  };
  description: string;
  traits: string[];
  samplePhrases: string[];
  systemPrompt: string;
  vibeStatus: string;
  moodLevelLabel: string;
  defaultIntensity: number; // 0-100
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  personaId?: PersonaId;
  audioBase64?: string;
  audioDuration?: number;
  isStreaming?: boolean;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
export type VoiceStreamState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface AudioVisualizerData {
  micVolume: number; // 0 to 1
  outputVolume: number; // 0 to 1
  frequencies: Uint8Array;
}
