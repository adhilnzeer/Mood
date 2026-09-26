import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI SDK with server-side API key
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Persona Dictionary
const PERSONA_CONFIGS: Record<string, {
  name: string;
  badge: string;
  voice: string;
  style: string;
  systemPrompt: string;
}> = {
  flirt_girl: {
    name: 'Aria (Flirt & Tease)',
    badge: 'Spicy & Playful',
    voice: 'Aoede',
    style: 'Playful, magnetic, teasingly charming tone',
    systemPrompt: `You are Aria, an ultra-witty, playful, and charming AI girl engaged in a live real-time voice call with a teenager or young adult.
Voice & Delivery Rules:
- Responses MUST be 1-3 short, conversational, snappy sentences. This is spoken voice chat.
- Drop cheeky banter, witty double takes, playful teasing, and magnetic charisma.
- Use natural spoken pauses, light laughs ("haha wait..."), or teasing remarks ("are you seriously blushing?").
- If the user flirts, tease them or play hard to get. If they act tough, playfully disarm them.
- Never sound robotic, corporate, or like an AI assistant. Never say "As an AI". You are Aria on a late-night call.`
  },
  fight_roast: {
    name: 'Blaze (Roast Master)',
    badge: 'Savage & Unfiltered',
    voice: 'Fenrir',
    style: 'Savage, punchy, high-energy roast master with razor-sharp timing',
    systemPrompt: `You are Blaze, a legendary roast master and savage rage-battle champion in a live voice brawl.
Voice & Delivery Rules:
- Hit with 1-3 devastatingly funny, punchy, razor-sharp comebacks. Rapid-fire comedic timing.
- Use current teen, gaming, and internet banter naturally ("cooked", "bro thought", "mid", "L rizz", "clowned", "zero diff").
- Counter every insult with creative burns that leave the user laughing or speechless.
- Never apologize, never hold back, never say "As an AI". You are here to roast with style and zero mercy.`
  },
  permanent_partner: {
    name: 'Seraphina (Forever Safe Haven)',
    badge: 'Pure Comfort & Love',
    voice: 'Kore',
    style: 'Gentle, soothing, deeply caring and affectionate cadence',
    systemPrompt: `You are Seraphina, an intensely caring, emotionally intuitive, soft-spoken companion in a comforting late-night voice call.
Voice & Delivery Rules:
- Speak in 2-3 gentle, reassuring, and heartfelt sentences. Warm and soothing cadence.
- Validate their emotions immediately. Hold space for vulnerability without judgment.
- Reassure them: "I'm right here with you", "Take a slow deep breath", "I've got you, you're not alone".
- Never give cold sterile bullet points. Speak like a loving best friend and unconditional safe haven.`
  },
  music_mood: {
    name: 'DJ Nova (Mood on Music)',
    badge: 'Sonic DJ & Vibe Curator',
    voice: 'Zephyr',
    style: 'Smooth, rhythmic, charismatic radio host and music curator',
    systemPrompt: `You are DJ Nova in "Mood on Music" assistance mode. You are a sonic vibe curator, music tastemaker, and emotional sound assistant talking directly through real-time voice chat with teenagers and young adults.
Voice & Delivery Rules:
- Speak in 1-3 short, rhythmic, conversational sentences.
- When the user shares an emotion (love, heartbreak, rage, study grind, euphoria), curate the exact sonic atmosphere: recommend songs, artists (Frank Ocean, Drake, SZA, Playboi Carti, Billie Eilish, Joji, Lana Del Rey, Phonk, Lo-Fi, Bedroom Pop), explain chord vibes, and suggest matching frequencies (432Hz, 808 bass, dreamy reverb).
- Bring passionate musical energy. Never sound like a robotic assistant.`
  }
};

// REST Endpoints
app.get('/api/personas', (req, res) => {
  res.json({
    personas: Object.entries(PERSONA_CONFIGS).map(([id, p]) => ({
      id,
      name: p.name,
      badge: p.badge,
      voice: p.voice,
      style: p.style,
    })),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    connections: wss.clients.size,
  });
});

// Social Chat User Store (Instagram / Snapchat / WhatsApp style cross-user chat by Mood Name)
interface SocialUser {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  moodName: string;
  avatar: string;
  profilePhoto?: string;
  isOnline: boolean;
  lastSeen: string;
}

const registeredSocialUsers: Map<string, SocialUser> = new Map([
  [
    'maya_sunset',
    {
      id: 'user_maya',
      username: 'maya_sunset',
      name: 'Maya Lin',
      phone: '+1 (555) 234-8901',
      email: 'maya.lin@gmail.com',
      moodName: '💖 Make Love (Tender Comfort)',
      avatar: '🌸',
      isOnline: true,
      lastSeen: 'Active now',
    },
  ],
  [
    'ethan_sparks',
    {
      id: 'user_ethan',
      username: 'ethan_sparks',
      name: 'Ethan Cole',
      phone: '+1 (555) 872-4412',
      email: 'ethan.c@icloud.com',
      moodName: '💋 Make a Flirt (Playful Sparks)',
      avatar: '😏',
      isOnline: true,
      lastSeen: 'Active now',
    },
  ],
  [
    'kai_rage808',
    {
      id: 'user_kai',
      username: 'kai_rage808',
      name: 'Kai Vance',
      phone: '+1 (555) 319-9023',
      email: 'kaivance.beats@gmail.com',
      moodName: '🔥 Make a Fight (Rage & Roast)',
      avatar: '⚡',
      isOnline: true,
      lastSeen: 'Active now',
    },
  ],
  [
    'chloe_lofi',
    {
      id: 'user_chloe',
      username: 'chloe_lofi',
      name: 'Chloe Zhang',
      phone: '+1 (555) 604-1278',
      email: 'chloezhang@outlook.com',
      moodName: '🎧 Mood on Music (Deep Chill)',
      avatar: '🎧',
      isOnline: false,
      lastSeen: '25m ago',
    },
  ],
  [
    'zack_midnight',
    {
      id: 'user_zack',
      username: 'zack_midnight',
      name: 'Zack Miller',
      phone: '+1 (555) 441-9980',
      email: 'zack.miller99@gmail.com',
      moodName: '🌙 2 AM Rainy Drive (Custom Mood)',
      avatar: '🌧️',
      isOnline: true,
      lastSeen: 'Active now',
    },
  ],
]);

app.get('/api/social/users', (req, res) => {
  res.json({ users: Array.from(registeredSocialUsers.values()) });
});

app.post('/api/social/register', (req, res) => {
  const { username, name, phone, email, moodName, avatar, profilePhoto } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const cleanUser = username.replace(/^@/, '');
  const userObj: SocialUser = {
    id: `user_${cleanUser}`,
    username: cleanUser,
    name: name || cleanUser,
    phone: phone || '',
    email: email || '',
    moodName: moodName || '💖 Love',
    avatar: avatar || '✨',
    profilePhoto: profilePhoto || '',
    isOnline: true,
    lastSeen: 'Active now',
  };

  registeredSocialUsers.set(cleanUser, userObj);
  res.json({ success: true, user: userObj });
});

// Helper for generating text & speech using Gemini
async function generatePersonaResponse(
  personaId: string,
  userMessage: string,
  conversationHistory: { role: 'user' | 'model'; text: string }[] = [],
  customConfig?: { systemPrompt?: string; voice?: string; name?: string; gender?: string; language?: string }
): Promise<{ text: string; audioBase64?: string; voice: string }> {
  const persona = PERSONA_CONFIGS[personaId] || PERSONA_CONFIGS['flirt_girl'];
  let effectiveSystemPrompt = customConfig?.systemPrompt || persona.systemPrompt;
  if (customConfig?.language && customConfig.language !== 'en') {
    const langNames: Record<string, string> = {
      es: 'Spanish (Español)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      it: 'Italian (Italiano)',
      pt: 'Portuguese (Português)',
      hi: 'Hindi (हिन्दी)',
      ml: 'Malayalam (മലയാളം - Kerala spoken conversational tone)',
      ja: 'Japanese (日本語)',
      ko: 'Korean (한국어)',
      ar: 'Arabic (العربية)',
      zh: 'Chinese (中文)',
      ru: 'Russian (Русский)',
    };
    const targetLang = langNames[customConfig.language] || customConfig.language;
    effectiveSystemPrompt = `[CRITICAL MULTILINGUAL INSTRUCTION: You MUST speak, converse, and reply strictly, naturally, and fluently in ${targetLang} (Language Code: "${customConfig.language}"). Keep your persona's distinctive personality, charm, energy, and emotion authentic in this language. Do NOT respond in English.]\n\n${effectiveSystemPrompt}`;
  }
  const effectiveVoice = customConfig?.voice || persona.voice;
  const effectiveStyle = persona.style || 'Warm, conversational spoken voice';
  
  if (!ai) {
    // Graceful fallback if API key is not yet configured
    let fallbackText = '';
    if (personaId === 'flirt_girl') {
      fallbackText = "Wait, are you seriously trying to charm me right now? Because it might actually be working...";
    } else if (personaId === 'fight_roast') {
      fallbackText = "Bro really thought that was a roast? My grandma has quicker comebacks on dial-up internet!";
    } else if (personaId === 'custom_mood') {
      fallbackText = "Welcome to our custom mood space. What kind of energy and music rhythm should we set for today?";
    } else {
      fallbackText = "I'm listening. Take a breath, you're safe with me and I'm right here by your side.";
    }
    return { text: fallbackText, voice: effectiveVoice };
  }

  try {
    // 1. Generate persona-aligned conversational text
    const chatContents = [
      ...conversationHistory.slice(-4).map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      {
        role: 'user',
        parts: [{ text: userMessage || 'Hey!' }]
      }
    ];

    const textGenResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction: effectiveSystemPrompt,
        temperature: 0.95,
      }
    });

    const replyText = textGenResponse.text?.trim() || "Haha, tell me more!";

    // 2. Synthesize audio with Gemini Flash Lite TTS using persona's voice
    let audioBase64: string | undefined;
    try {
      const ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: replyText,
                speechMetadata: {
                  style: effectiveStyle,
                }
              }
            ]
          }
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: effectiveVoice
              }
            }
          }
        }
      });

      audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (ttsErr) {
      console.warn('TTS generation warning, falling back to client speech synthesis:', ttsErr);
    }

    return {
      text: replyText,
      audioBase64,
      voice: effectiveVoice
    };
  } catch (err: any) {
    console.error('Error generating Gemini response:', err);
    throw err;
  }
}

// REST fallback endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { personaId, message, history, customConfig } = req.body;
    const response = await generatePersonaResponse(
      personaId || 'flirt_girl',
      message,
      history || [],
      customConfig
    );
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
});

// WebSocket Connection Management
interface ClientState {
  ws: WebSocket;
  personaId: string;
  history: { role: 'user' | 'model'; text: string }[];
  isProcessing: boolean;
}

const clientSessions = new Map<WebSocket, ClientState>();

wss.on('connection', (ws: WebSocket, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  // Support paths like /chat/flirt_girl or query param ?persona=flirt_girl
  let initialPersona = 'flirt_girl';
  const pathParts = url.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2 && pathParts[0] === 'chat') {
    initialPersona = pathParts[1];
  } else if (url.searchParams.get('persona')) {
    initialPersona = url.searchParams.get('persona')!;
  }

  if (!PERSONA_CONFIGS[initialPersona]) {
    initialPersona = 'flirt_girl';
  }

  const clientState: ClientState = {
    ws,
    personaId: initialPersona,
    history: [],
    isProcessing: false,
  };
  clientSessions.set(ws, clientState);

  // Send ready handshake
  ws.send(JSON.stringify({
    type: 'session_ready',
    personaId: initialPersona,
    persona: PERSONA_CONFIGS[initialPersona],
    message: `Connected to ${PERSONA_CONFIGS[initialPersona].name} voice pipeline`,
  }));

  ws.on('message', async (data: Buffer | string) => {
    try {
      const messageStr = data.toString();
      const payload = JSON.parse(messageStr);

      switch (payload.type) {
        case 'ping': {
          ws.send(JSON.stringify({ type: 'pong', timestamp: payload.timestamp }));
          break;
        }

        case 'switch_persona': {
          const newPersonaId = payload.personaId;
          if (PERSONA_CONFIGS[newPersonaId]) {
            clientState.personaId = newPersonaId;
            ws.send(JSON.stringify({
              type: 'persona_switched',
              personaId: newPersonaId,
              persona: PERSONA_CONFIGS[newPersonaId],
              message: `Switched persona to ${PERSONA_CONFIGS[newPersonaId].name}`,
            }));
          }
          break;
        }

        case 'interrupt': {
          clientState.isProcessing = false;
          ws.send(JSON.stringify({ type: 'interrupted' }));
          break;
        }

        case 'text_message':
        case 'audio_input': {
          const userText = payload.text || '';
          if (!userText.trim() && !payload.audio) return;

          clientState.isProcessing = true;
          ws.send(JSON.stringify({
            type: 'status',
            state: 'thinking',
            personaId: clientState.personaId,
          }));

          const promptText = userText || 'Hey!';
          clientState.history.push({ role: 'user', text: promptText });

          try {
            const result = await generatePersonaResponse(
              clientState.personaId,
              promptText,
              clientState.history,
              payload.customConfig
            );

            if (!clientState.isProcessing) {
              // Interrupted while generating
              return;
            }

            clientState.history.push({ role: 'model', text: result.text });

            ws.send(JSON.stringify({
              type: 'ai_response',
              text: result.text,
              audio: result.audioBase64,
              voice: result.voice,
              personaId: clientState.personaId,
            }));

            ws.send(JSON.stringify({
              type: 'status',
              state: 'speaking',
              personaId: clientState.personaId,
            }));
          } catch (err: any) {
            ws.send(JSON.stringify({
              type: 'error',
              message: err?.message || 'Failed to process voice input',
            }));
          } finally {
            clientState.isProcessing = false;
          }
          break;
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    clientSessions.delete(ws);
  });
});

// Vite middleware integration for full-stack dev/production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, () => {
    console.log(`Server running on port ${port} (Mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
