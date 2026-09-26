import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PERSONAS } from './personas/personaConfig';
import { PersonaId, ChatMessage, ConnectionState, VoiceStreamState, UserProfile, AssistantGender, PersonaConfig } from './types';
import { MoodSelectorHome } from './components/MoodSelectorHome';
import { VoiceAssistantColumn } from './components/VoiceAssistantColumn';
import { LiveTranscript } from './components/LiveTranscript';
import { MoodMusicColumn } from './components/MoodMusicColumn';
import { AuthModal } from './components/AuthModal';
import { CreateMoodModal } from './components/CreateMoodModal';
import { SocialMoodChat, SocialMode } from './components/SocialMoodChat';
import { UserProfileModal } from './components/UserProfileModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { BackendCodeModal } from './components/BackendCodeModal';
import { AudioManager } from './utils/audio';
import { musicEngine, MOOD_TRACKS, MusicMoodType } from './utils/musicEngine';
import { getLanguageByCode, SUPPORTED_LANGUAGES } from './utils/languages';
import {
  Code2,
  ArrowLeft,
  Heart,
  Sparkles,
  Swords,
  Settings2,
  User,
  Music,
  Play,
  Pause,
  FastForward,
  Volume2,
  VolumeX,
  Radio,
  Edit3,
  Check,
  Zap,
  MessageCircle,
  Users,
} from 'lucide-react';

const MUSIC_GENRE_KEYWORDS = [
  'lofi', 'lo-fi', 'phonk', 'drill', 'rnb', 'r&b', 'acoustic', 'jazz', 'pop', 'synthwave',
  'rock', 'metal', 'trap', 'hiphop', 'hip-hop', 'chill', 'rain', 'piano', 'ambient', 'bass',
  'indie', 'edm', 'electronic', 'slow', 'soul', 'dark'
];

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'inside'>('home');
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaId>('permanent_partner');
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [voiceState, setVoiceState] = useState<VoiceStreamState>('idle');
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [outputVolume, setOutputVolume] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number>(22);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showCreateMoodModal, setShowCreateMoodModal] = useState<boolean>(false);
  const [showSocialChat, setShowSocialChat] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [friendsSearchQuery, setFriendsSearchQuery] = useState<string>('');
  const [socialChatMode, setSocialChatMode] = useState<SocialMode>('friends');
  const [pendingSocialChatMode, setPendingSocialChatMode] = useState<SocialMode | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [intensity, setIntensity] = useState<number>(90);

  // User Authentication State (stored in localStorage)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('gemini_assistant_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Assistant Customization: Gender and Custom Assistant Name
  const [selectedGender, setSelectedGender] = useState<AssistantGender>('female');
  const [customAssistantNames, setCustomAssistantNames] = useState<Record<string, string>>({
    permanent_partner: 'Seraphina',
    flirt_girl: 'Aria',
    fight_roast: 'Blaze',
    custom_mood: 'Nova',
  });

  // Custom Mood State
  const [customMood, setCustomMood] = useState<PersonaConfig | null>(() => {
    try {
      const saved = localStorage.getItem('gemini_custom_mood');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Music Assistant Learning & Playback state
  const [chatTurnCounts, setChatTurnCounts] = useState<Record<string, number>>({});
  const [learnedPatterns, setLearnedPatterns] = useState<Record<string, string>>({});
  const [learnedPatternToast, setLearnedPatternToast] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(musicEngine.getIsPlaying());
  const [musicVolume, setMusicVolume] = useState<number>(musicEngine.getVolume());

  // Determine current active persona
  const basePersona = selectedPersonaId === 'custom_mood' && customMood
    ? customMood
    : PERSONAS[selectedPersonaId] || PERSONAS.permanent_partner;

  // Compute active name based on custom name or gender
  const currentAssistantName = customAssistantNames[selectedPersonaId] ||
    (selectedGender === 'male' && basePersona.genderVoice?.male
      ? basePersona.genderVoice.male.name
      : basePersona.name);

  // Compute active voice based on gender
  const effectiveVoice = selectedGender === 'male' && basePersona.genderVoice?.male
    ? basePersona.genderVoice.male.voice
    : basePersona.voice;

  const currentPersona: PersonaConfig = {
    ...basePersona,
    name: currentAssistantName,
    voice: effectiveVoice,
    avatar: selectedGender === 'male' && basePersona.genderVoice?.male
      ? basePersona.genderVoice.male.avatar
      : basePersona.avatar,
  };

  // Audio & WebSocket Refs
  const audioManagerRef = useRef<AudioManager | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const pingIntervalRef = useRef<any>(null);

  // Sync music engine play state
  useEffect(() => {
    musicEngine.onPlayStateChange = (playing) => {
      setIsMusicPlaying(playing);
    };
  }, []);

  // Initialize Audio Manager
  useEffect(() => {
    const audioMgr = new AudioManager();
    audioMgr.onVolumeUpdate = (micVol, outVol) => {
      setMicVolume(micVol);
      setOutputVolume(outVol);
    };

    audioMgr.onAudioChunk = (pcmBase64) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'audio_input',
            audio: pcmBase64,
            customConfig: {
              systemPrompt: currentPersona.systemPrompt,
              voice: effectiveVoice,
              name: currentAssistantName,
              gender: selectedGender,
              language: selectedLanguage,
            },
          })
        );
      }
    };

    audioManagerRef.current = audioMgr;

    return () => {
      audioMgr.stopMicrophone();
      audioMgr.interrupt();
    };
  }, [currentPersona.systemPrompt, effectiveVoice, currentAssistantName, selectedGender, selectedLanguage]);

  // Connect WebSocket
  const connectWebSocket = useCallback((personaId: PersonaId) => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        // ignore
      }
    }

    setConnectionState('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/chat/${personaId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionState('connected');

      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        }
      }, 5000);
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'pong': {
            if (data.timestamp) {
              const rtt = Math.max(8, Date.now() - data.timestamp);
              setLatencyMs(rtt);
            }
            break;
          }

          case 'status': {
            setVoiceState(data.state || 'idle');
            break;
          }

          case 'ai_response': {
            setIsProcessing(false);
            const newMsg: ChatMessage = {
              id: `ai_${Date.now()}`,
              sender: 'assistant',
              text: data.text,
              timestamp: Date.now(),
              personaId: data.personaId || selectedPersonaId,
              audioBase64: data.audio,
            };

            setMessages((prev) => [...prev, newMsg]);

            if (!isMuted) {
              setVoiceState('speaking');
              if (data.audio && audioManagerRef.current) {
                await audioManagerRef.current.playBase64Audio(data.audio);
              } else if (audioManagerRef.current) {
                await audioManagerRef.current.speakBrowserTTS(data.text, effectiveVoice, getLanguageByCode(selectedLanguage).speechCode);
              }
              setVoiceState('idle');
            }
            break;
          }

          case 'interrupted': {
            setVoiceState('idle');
            setIsProcessing(false);
            if (audioManagerRef.current) {
              audioManagerRef.current.interrupt();
            }
            break;
          }

          case 'persona_switched': {
            console.log('Switched persona on server:', data.persona_name);
            break;
          }
        }
      } catch (err) {
        console.error('Error handling WebSocket message in client:', err);
      }
    };

    ws.onerror = (err) => {
      console.warn('WebSocket error:', err);
      setConnectionState('error');
    };

    ws.onclose = () => {
      setConnectionState('disconnected');
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, [effectiveVoice, isMuted, selectedPersonaId]);

  // Connect on mount or persona switch
  useEffect(() => {
    connectWebSocket(selectedPersonaId);
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, [selectedPersonaId, connectWebSocket]);

  // Update assistant name
  const handleUpdateAssistantName = (newName: string) => {
    setCustomAssistantNames((prev) => ({
      ...prev,
      [selectedPersonaId]: newName,
    }));
  };

  // Toggle gender
  const handleChangeGender = (gender: AssistantGender) => {
    setSelectedGender(gender);
    const targetPersona = selectedPersonaId === 'custom_mood' && customMood ? customMood : PERSONAS[selectedPersonaId];
    if (targetPersona?.genderVoice) {
      const newDefaultName = targetPersona.genderVoice[gender].name;
      setCustomAssistantNames((prev) => ({
        ...prev,
        [selectedPersonaId]: newDefaultName,
      }));
    }
  };

  // Step Inside a Mood from Home
  const handleSelectMoodFromHome = (moodId: PersonaId) => {
    setSelectedPersonaId(moodId);
    setIntensity(PERSONAS[moodId]?.defaultIntensity || 90);
    setCurrentView('inside');

    // Switch on server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'switch_persona',
          personaId: moodId,
          customConfig: {
            systemPrompt: (PERSONAS[moodId] || customMood)?.systemPrompt,
            voice: effectiveVoice,
            name: customAssistantNames[moodId] || PERSONAS[moodId]?.name,
            language: selectedLanguage,
          },
        })
      );
    } else {
      connectWebSocket(moodId);
    }

    // Ask about music preference for the first 2-3 chats if not learned yet
    const turns = chatTurnCounts[moodId] || 0;
    if (turns === 0) {
      let promptQuestion = '';
      if (moodId === 'permanent_partner') {
        promptQuestion = `Hey... I'm so glad you're here. Tell me: what kind of music vibe do you love when you're in the mood for Love? (Like soft acoustic, lo-fi rain, ambient piano, or slow R&B?)`;
      } else if (moodId === 'flirt_girl') {
        promptQuestion = `Hey! Before we get into trouble... what music gets you in the mood when you want to Flirt? (Smooth R&B, late-night pop, bouncy neo-soul, or spicy beats?)`;
      } else if (moodId === 'fight_roast') {
        promptQuestion = `Yo, step into the ring! Before I cook you, what rage music do you listen to when you're ready to Fight? (Heavy phonk, 808 drill trap, hip-hop, or metal?)`;
      } else if (moodId === 'custom_mood' && customMood) {
        promptQuestion = `Welcome to your custom mood "${customMood.actionTitle}"! What inspired this vibe today, and what kind of music rhythm should we set?`;
      }

      setMessages([
        {
          id: `ai_init_${Date.now()}`,
          sender: 'assistant',
          text: promptQuestion,
          timestamp: Date.now(),
          personaId: moodId,
        },
      ]);
    }
  };

  // Switch Mood Inside Room
  const handleSwitchPersona = (newPersonaId: PersonaId) => {
    if (newPersonaId === selectedPersonaId) return;

    setSelectedPersonaId(newPersonaId);
    setIntensity(PERSONAS[newPersonaId]?.defaultIntensity || 90);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'switch_persona',
          personaId: newPersonaId,
        })
      );
    } else {
      connectWebSocket(newPersonaId);
    }
  };

  // Toggle Microphone
  const handleToggleMic = async () => {
    if (isMicActive) {
      setIsMicActive(false);
      setVoiceState('idle');
      if (audioManagerRef.current) audioManagerRef.current.stopMicrophone();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    } else {
      if (!audioManagerRef.current) return;
      const success = await audioManagerRef.current.startMicrophone();
      if (success) {
        setIsMicActive(true);
        setVoiceState('listening');

        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          try {
            const recognition = new SpeechRec();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = getLanguageByCode(selectedLanguage).speechCode;

            recognition.onresult = (event: any) => {
              const current = event.resultIndex;
              const transcript = event.results[current][0].transcript.trim();
              if (transcript) {
                handleSendMessage(transcript);
              }
            };

            recognition.onerror = (e: any) => {
              console.warn('Speech recognition notice:', e.error);
            };

            recognition.start();
            speechRecognitionRef.current = recognition;
          } catch (recErr) {
            console.warn('SpeechRecognition start warning:', recErr);
          }
        }
      }
    }
  };

  // Barge-in / Interrupt
  const handleInterrupt = () => {
    if (audioManagerRef.current) {
      audioManagerRef.current.interrupt();
    }
    setVoiceState('idle');
    setIsProcessing(false);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'interrupt' }));
    }
  };

  // Send Message with Music Pattern Detection
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    handleInterrupt();

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
      personaId: selectedPersonaId,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);
    setVoiceState('thinking');

    // Track chat turn count for this mood
    const currentTurns = (chatTurnCounts[selectedPersonaId] || 0) + 1;
    setChatTurnCounts((prev) => ({
      ...prev,
      [selectedPersonaId]: currentTurns,
    }));

    // Detect music pattern in first 3 chats
    if (currentTurns <= 3) {
      const lower = text.toLowerCase();
      const detected = MUSIC_GENRE_KEYWORDS.find((k) => lower.includes(k));
      if (detected) {
        setLearnedPatterns((prev) => ({
          ...prev,
          [selectedPersonaId]: detected,
        }));
        musicEngine.setLearnedPattern(detected, selectedPersonaId as MusicMoodType);
        setIsMusicPlaying(true);
        setLearnedPatternToast(`Learned your music vibe: ${detected.toUpperCase()} • Playing pattern 🎵`);
        setTimeout(() => setLearnedPatternToast(null), 6000);
      }
    }

    const payload = {
      type: 'text_message',
      text,
      personaId: selectedPersonaId,
      customConfig: {
        systemPrompt: currentPersona.systemPrompt,
        voice: effectiveVoice,
        name: currentAssistantName,
        gender: selectedGender,
        language: selectedLanguage,
      },
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: selectedPersonaId,
          message: text,
          customConfig: payload.customConfig,
          history: messages.slice(-4).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          setIsProcessing(false);
          const aiMsg: ChatMessage = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            text: data.text,
            timestamp: Date.now(),
            personaId: selectedPersonaId,
            audioBase64: data.audioBase64,
          };
          setMessages((prev) => [...prev, aiMsg]);

          if (!isMuted) {
            setVoiceState('speaking');
            if (data.audioBase64 && audioManagerRef.current) {
              await audioManagerRef.current.playBase64Audio(data.audioBase64);
            } else if (audioManagerRef.current) {
              await audioManagerRef.current.speakBrowserTTS(data.text, effectiveVoice, getLanguageByCode(selectedLanguage).speechCode);
            }
            setVoiceState('idle');
          }
        })
        .catch((err) => {
          console.error('HTTP Chat error:', err);
          setIsProcessing(false);
          setVoiceState('idle');
        });
    }
  };

  // Replay Audio
  const handleReplayAudio = async (msg: ChatMessage) => {
    if (!audioManagerRef.current) return;
    setVoiceState('speaking');
    if (msg.audioBase64) {
      await audioManagerRef.current.playBase64Audio(msg.audioBase64);
    } else {
      await audioManagerRef.current.speakBrowserTTS(msg.text, effectiveVoice, getLanguageByCode(selectedLanguage).speechCode);
    }
    setVoiceState('idle');
  };

  // Handle Custom Mood Creation
  const handleCreateMood = (newConfig: Partial<PersonaConfig>) => {
    const fullConfig: PersonaConfig = {
      id: 'custom_mood',
      name: newConfig.name || 'Nova',
      actionTitle: newConfig.actionTitle || 'Custom Mood',
      tagline: newConfig.tagline || 'Customized space created by you',
      avatar: newConfig.avatar || '✨',
      badge: 'Custom Mood',
      accentColor: newConfig.accentColor || 'from-violet-500 to-indigo-600',
      glowColor: newConfig.glowColor || 'rgba(139, 92, 246, 0.45)',
      borderColor: newConfig.borderColor || 'border-purple-500/50',
      bgGradient: 'bg-gradient-to-br from-violet-950/40 via-purple-950/30 to-black',
      voice: 'Aoede',
      description: newConfig.tagline || 'Personalized atmosphere',
      traits: ['Custom Vibe', 'Personalized Voice', 'Unique Atmosphere'],
      samplePhrases: newConfig.samplePhrases || ['Hello in our custom space.'],
      systemPrompt: newConfig.systemPrompt || 'You are an attentive AI in a personalized custom mood.',
      vibeStatus: newConfig.vibeStatus || 'Tuned to your custom frequency 🌌',
      moodLevelLabel: 'Custom Energy',
      defaultIntensity: 90,
      genderVoice: {
        female: { name: newConfig.name || 'Nova', voice: 'Aoede', avatar: newConfig.avatar || '✨' },
        male: { name: 'Orion', voice: 'Puck', avatar: '🪐' },
      },
    };

    setCustomMood(fullConfig);
    localStorage.setItem('gemini_custom_mood', JSON.stringify(fullConfig));
    PERSONAS.custom_mood = fullConfig;

    // Immediately step inside this custom mood
    setSelectedPersonaId('custom_mood');
    setIntensity(90);
    setCurrentView('inside');

    // First greeting in custom mood
    setMessages([
      {
        id: `ai_custom_${Date.now()}`,
        sender: 'assistant',
        text: `Welcome to your custom mood "${fullConfig.actionTitle}"! I'm ${fullConfig.name}. What inspired you to build this space today, and what kind of music rhythm should we set?`,
        timestamp: Date.now(),
        personaId: 'custom_mood',
      },
    ]);
  };

  // Toggle Music Engine Playback from bottom logo
  const handleToggleMusic = () => {
    const playing = musicEngine.togglePlay(selectedPersonaId as MusicMoodType);
    setIsMusicPlaying(playing);
  };

  return (
    <div
      className={`min-h-screen text-zinc-100 flex flex-col transition-colors duration-700 font-sans selection:bg-rose-500/30 selection:text-white ${currentPersona.bgGradient}`}
    >
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-3xl bg-black/40 border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentView === 'inside' ? (
            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition-colors cursor-pointer mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Moods</span>
            </button>
          ) : null}

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-pink-900/30 shrink-0">
            {currentPersona.avatar}
          </div>

          <div>
            {/* Clean Heading with handwritten aesthetic */}
            <h1 className="font-handwritten text-2xl sm:text-3xl font-bold tracking-wide text-white flex items-center gap-2 leading-none">
              <span>{currentPersona.actionTitle}</span>
            </h1>
            <p className="text-xs text-zinc-400 truncate max-w-xs sm:max-w-md">
              {currentPersona.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Mood Pills inside room */}
          {currentView === 'inside' && (
            <div className="hidden md:flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 p-1 rounded-2xl">
              {[
                { id: 'permanent_partner' as PersonaId, label: 'Love', icon: Heart, color: 'text-rose-400' },
                { id: 'flirt_girl' as PersonaId, label: 'Flirt', icon: Sparkles, color: 'text-pink-400' },
                { id: 'fight_roast' as PersonaId, label: 'Fight', icon: Swords, color: 'text-orange-400' },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = selectedPersonaId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSwitchPersona(m.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Find Friends Option (User-to-User Real Interaction) */}
          <button
            type="button"
            onClick={() => {
              if (currentUser) {
                setShowSocialChat(true);
              } else {
                setFriendsSearchQuery('');
                setShowAuthModal(true);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all shadow-sm cursor-pointer border border-white/15 backdrop-blur-md active:scale-95"
            title="Find Friends - Real User to User Chat"
          >
            <Users className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Find Friends</span>
            <span className="sm:hidden">Friends</span>
          </button>

          {/* Multilingual Voice Assistant Language Selector */}
          <div className="relative flex items-center">
            <select
              value={selectedLanguage}
              onChange={(e) => {
                const newLang = e.target.value;
                setSelectedLanguage(newLang);
                if (speechRecognitionRef.current) {
                  try {
                    speechRecognitionRef.current.lang = getLanguageByCode(newLang).speechCode;
                  } catch (e) {}
                }
              }}
              className="bg-black/60 border border-zinc-700/80 hover:border-indigo-400 text-zinc-200 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer appearance-none pr-6 shadow-sm"
              title="Change Voice Assistant Language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-zinc-900 text-white">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[9px] text-zinc-400">
              ▼
            </span>
          </div>

          {/* User Account Interface Option in Top Right: Small Circle Avatar */}
          {currentUser ? (
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="relative p-0.5 rounded-full ring-2 ring-emerald-500/70 hover:ring-pink-500 transition-all cursor-pointer shadow-lg active:scale-95 group shrink-0"
              title={`Logged in as @${currentUser.username} • Tap to view Profile Photo & Friends Collection`}
            >
              {currentUser.profilePhoto ? (
                <img
                  src={currentUser.profilePhoto}
                  alt={currentUser.username}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-sm text-white font-bold">
                  {currentUser.avatar || currentUser.name?.charAt(0)?.toUpperCase() || '👤'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-black rounded-full" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white transition-all shadow-sm cursor-pointer active:scale-95 shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Voice Assistant Options modal button */}
          <button
            type="button"
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700/80 text-zinc-200 transition-all shadow-sm cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Options</span>
          </button>

          {/* FastAPI Backend Code Button */}
          <button
            type="button"
            onClick={() => setShowCodeModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">FastAPI</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {currentView === 'home' ? (
          /* Initial Screen: Select one of the 3 moods to move inside */
          <MoodSelectorHome
            onSelectMood={handleSelectMoodFromHome}
            onOpenCreateMoodModal={() => setShowCreateMoodModal(true)}
            customMood={customMood}
            currentUser={currentUser}
            onOpenFindFriends={(searchUsername) => {
              if (searchUsername) setFriendsSearchQuery(searchUsername);
              setShowSocialChat(true);
            }}
            onOpenAuth={(pendingUsername) => {
              if (pendingUsername) setFriendsSearchQuery(pendingUsername);
              setShowAuthModal(true);
            }}
          />
        ) : (
          /* Inside Screen: 3 Balanced Columns (Voice Assistant, Chat / Message Box, Mood Music Assistant) */
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Column 1: Voice Assistant (Customizable Name, Male/Female Toggle, Multilingual Selector, Orb, Controls) */}
              <div className="lg:col-span-4 flex flex-col min-h-[500px]">
                <VoiceAssistantColumn
                  persona={currentPersona}
                  customAssistantName={currentAssistantName}
                  onUpdateAssistantName={handleUpdateAssistantName}
                  selectedGender={selectedGender}
                  onChangeGender={handleChangeGender}
                  selectedLanguage={selectedLanguage}
                  onChangeLanguage={(lang) => {
                    setSelectedLanguage(lang);
                    if (speechRecognitionRef.current) {
                      try {
                        speechRecognitionRef.current.lang = getLanguageByCode(lang).speechCode;
                      } catch (e) {}
                    }
                  }}
                  voiceState={voiceState}
                  isMicActive={isMicActive}
                  onToggleMic={handleToggleMic}
                  onInterrupt={handleInterrupt}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted((prev) => !prev)}
                  micVolume={micVolume}
                  outputVolume={outputVolume}
                  intensity={intensity}
                  onIntensityChange={setIntensity}
                />
              </div>

              {/* Column 2: Message Box & AI Chat (User on one side, AI on other, Mic directly in message bar) */}
              <div className="lg:col-span-4 xl:col-span-5 flex flex-col min-h-[500px]">
                <LiveTranscript
                  messages={messages}
                  currentPersona={currentPersona}
                  assistantDisplayName={currentAssistantName}
                  onSendMessage={handleSendMessage}
                  onReplayAudio={handleReplayAudio}
                  onClearHistory={() => setMessages([])}
                  inputText={inputText}
                  setInputText={setInputText}
                  isProcessing={isProcessing}
                  isMicActive={isMicActive}
                  onToggleMic={handleToggleMic}
                  onOpenVoiceAssistant={() => setShowVoiceModal(true)}
                  voiceState={voiceState}
                />
              </div>

              {/* Column 3: Dedicated Mood-Wise Music Assistant */}
              <div className="lg:col-span-4 xl:col-span-3 flex flex-col min-h-[500px]">
                <MoodMusicColumn
                  personaId={selectedPersonaId}
                  onAskMusicAssistant={(prompt) => handleSendMessage(prompt)}
                />
              </div>
            </div>

            {/* Notification Toast when a music pattern is learned */}
            {learnedPatternToast && (
              <div className="fixed bottom-18 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-zinc-950/95 border border-cyan-500/60 text-cyan-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
                <Music className="w-4 h-4 text-cyan-400" />
                <span>{learnedPatternToast}</span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sleek Bottom Bar with Small Size Music Logo & Controls */}
      <footer className="mt-auto border-t border-white/[0.08] bg-black/40 backdrop-blur-3xl px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-zinc-400 z-30">
        {/* Left: Small Logo for Music */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleMusic}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 ${
              isMusicPlaying
                ? 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white ring-2 ring-cyan-400/50'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
            title={isMusicPlaying ? 'Pause Mood Soundscape' : 'Play Mood Soundscape'}
          >
            <Music className={`w-4 h-4 ${isMusicPlaying ? 'animate-pulse' : ''}`} />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-200 text-xs truncate max-w-[150px] sm:max-w-xs">
              {MOOD_TRACKS[selectedPersonaId as MusicMoodType]?.title || 'Mood Soundscape'}
            </span>
            {learnedPatterns[selectedPersonaId] && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 font-mono hidden sm:inline">
                Pattern: {learnedPatterns[selectedPersonaId]}
              </span>
            )}
            {isMusicPlaying && (
              <div className="hidden sm:flex items-center gap-0.5">
                {[30, 80, 50, 90, 60].map((h, i) => (
                  <span
                    key={i}
                    className="w-0.5 bg-cyan-400 rounded-full animate-pulse"
                    style={{ height: `${h * 0.12 + 2}px` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Play/Pause & Volume */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleMusic}
            className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
          >
            {isMusicPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-xl">
            <Volume2 className="w-3 h-3 text-zinc-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVolume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setMusicVolume(v);
                musicEngine.setVolume(v);
              }}
              className="w-14 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>
      </footer>

      {/* Login & Sign Up Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingSocialChatMode(null);
        }}
        currentUser={currentUser}
        onSaveUser={(user) => {
          setCurrentUser(user);
          setShowAuthModal(false);
          if (pendingSocialChatMode) {
            setSocialChatMode(pendingSocialChatMode);
            setShowSocialChat(true);
            setPendingSocialChatMode(null);
          }
        }}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('gemini_assistant_user');
          setShowAuthModal(false);
        }}
      />

      {/* Create Your Own Mood Modal */}
      <CreateMoodModal
        isOpen={showCreateMoodModal}
        onClose={() => setShowCreateMoodModal(false)}
        onCreateMood={handleCreateMood}
      />

      {/* Voice Assistant Options Modal */}
      <VoiceAssistantModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        persona={currentPersona}
        voiceState={voiceState}
        isMicActive={isMicActive}
        onToggleMic={handleToggleMic}
        onInterrupt={handleInterrupt}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        micVolume={micVolume}
        outputVolume={outputVolume}
        latencyMs={latencyMs}
        connectionState={connectionState}
        intensity={intensity}
        onIntensityChange={setIntensity}
        selectedLanguage={selectedLanguage}
        onChangeLanguage={(lang) => {
          setSelectedLanguage(lang);
          if (speechRecognitionRef.current) {
            try {
              speechRecognitionRef.current.lang = getLanguageByCode(lang).speechCode;
            } catch (e) {}
          }
        }}
      />

      {/* Python FastAPI Backend Code Viewer Modal */}
      <BackendCodeModal isOpen={showCodeModal} onClose={() => setShowCodeModal(false)} />

      {/* Social Mood Chat Modal (Find Friends: 1-on-1 User-to-User Interaction) */}
      {currentUser && (
        <SocialMoodChat
          isOpen={showSocialChat}
          onClose={() => {
            setShowSocialChat(false);
            setFriendsSearchQuery('');
          }}
          currentUser={currentUser}
          initialSearchQuery={friendsSearchQuery}
          onOpenMoodRoom={(moodId) => {
            setShowSocialChat(false);
            handleSelectMoodFromHome(moodId as PersonaId);
          }}
          onUpdateCurrentUser={(updated) => setCurrentUser(updated)}
        />
      )}

      {/* User Profile Modal with Profile Photo & Friends Collection */}
      {currentUser && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          currentUser={currentUser}
          onUpdateUser={(updated) => setCurrentUser(updated)}
          onLogout={() => {
            setCurrentUser(null);
            localStorage.removeItem('gemini_assistant_user');
            setShowProfileModal(false);
          }}
          onOpenChatWithUser={(targetUsername) => {
            setShowProfileModal(false);
            setFriendsSearchQuery(targetUsername);
            setShowSocialChat(true);
          }}
        />
      )}
    </div>
  );
}
