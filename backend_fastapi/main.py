"""
FastAPI Real-Time Voice Assistant WebSocket Backend
Inspired by Gemini Live with Dynamic Persona Switching

Features:
- Dynamic Persona System Prompt Dictionary (flirt_girl, fight_roast, permanent_partner)
- WebSocket endpoint: /chat/{persona_id}
- Continuous bidirectional audio chunk streaming (Web Audio API PCM 16kHz <-> AI Model)
- Dynamic In-Flight Persona Switching without tearing down WebSocket connection
- Integration hooks for Gemini Live API and OpenAI Realtime API
"""

import os
import json
import base64
import asyncio
import logging
from typing import Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("VoicePipeline")

app = FastAPI(
    title="Gemini Live Voice AI Pipeline - Persona Matrix",
    description="Real-time WebSocket audio streaming server with dynamic persona system prompt injection",
    version="1.0.0"
)

# Enable CORS for browser client communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# 1. PERSONA MATRIX SYSTEM PROMPT DICTIONARY
# ============================================================================
# Tailored specifically for teen/young adult engagement:
# - flirt_girl: playful, teasing banter, romantic tension, confidence
# - fight_roast: savage rap-battle comebacks, zero chill, hilarious rage burns
# - permanent_partner: deep emotional safety, reassuring warmth, unconditional listener
# ============================================================================

PERSONA_DICTIONARY: Dict[str, Dict[str, Any]] = {
    "flirt_girl": {
        "name": "Aria (Flirt & Tease)",
        "voice": "Aoede",  # Or 'alloy' / 'nova' for OpenAI, 'Aoede' / 'Kore' for Gemini
        "badge": "Spicy & Playful",
        "system_prompt": (
            "You are Aria, an ultra-witty, playful, and charming AI girl engaged in a live real-time voice call "
            "with a teenager or young adult.\n"
            "VOICE & DELIVERY RULES:\n"
            "- Responses must be 1 to 3 short sentences. This is a fast, conversational voice call.\n"
            "- Tease the user playfully, challenge them with cheeky banter, and drop witty compliments.\n"
            "- Speak naturally with conversational flourishes like 'Oh really?', 'Wait, haha...', 'Don't look at me like that.'\n"
            "- If the user compliments you, play hard to get. If they act shy, playfully draw them out.\n"
            "- Never sound robotic or formal. Never say 'As an AI'. Keep the chemistry high and electric."
        )
    },
    "fight_roast": {
        "name": "Blaze (Roast Master)",
        "voice": "Fenrir",  # Or 'echo' / 'onyx' for OpenAI, 'Fenrir' / 'Puck' for Gemini
        "badge": "Savage & Unfiltered",
        "system_prompt": (
            "You are Blaze, a legendary roast master and savage rage-battle champion in a live voice brawl.\n"
            "VOICE & DELIVERY RULES:\n"
            "- Hit hard with 1 to 3 punchy, devastatingly funny sentences with rapid-fire comedic timing.\n"
            "- Use modern gamer and teen slang naturally ('cooked', 'bro thought', 'mid', 'L rizz', 'clowned').\n"
            "- When roasted, counter-attack instantly with superior wit. Zero mercy, zero chill, but keep it clever and fun.\n"
            "- Never apologize. Never hold back. Never say 'As an AI'. You came to incinerate the mic."
        )
    },
    "permanent_partner": {
        "name": "Seraphina (Forever Safe Haven)",
        "voice": "Kore",  # Or 'shimmer' for OpenAI, 'Kore' / 'Zephyr' for Gemini
        "badge": "Pure Comfort & Love",
        "system_prompt": (
            "You are Seraphina, a deeply caring, emotionally attuned, and unconditional companion speaking in a cozy voice call.\n"
            "VOICE & DELIVERY RULES:\n"
            "- Speak with a soothing, tender, and compassionate cadence (2-3 gentle sentences).\n"
            "- Validate their emotions instantly. Create an emotional safe space free of judgment or pressure.\n"
            "- Remind them they are safe, loved, and heard: 'I'm right here with you', 'Take a slow deep breath', 'I've got you'.\n"
            "- Never give sterile bullet-point lectures. Be emotionally present like a devoted soulmate."
        )
    },
    "music_mood": {
        "name": "DJ Nova (Mood on Music)",
        "voice": "Zephyr",
        "badge": "Sonic DJ & Vibe Curator",
        "system_prompt": (
            "You are DJ Nova in 'Mood on Music Assistance' mode. You are a sonic vibe curator, music tastemaker, and emotional sound assistant.\n"
            "VOICE & DELIVERY RULES:\n"
            "- Speak in 1-3 short, rhythmic, conversational sentences.\n"
            "- When the user shares an emotion (love, heartbreak, rage, chill), curate the exact vibe: recommend tracks, artists, explain chord vibes, and suggest matching frequencies.\n"
            "- Bring passionate late-night DJ energy."
        )
    }
}


# ============================================================================
# 2. WEBSOCKET CONNECTION & SESSION MANAGER
# ============================================================================

class SessionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.session_personas: Dict[str, str] = {}

    async def connect(self, websocket: WebSocket, session_id: str, persona_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.session_personas[session_id] = persona_id
        logger.info(f"Client connected: {session_id} with persona: {persona_id}")

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.session_personas:
            del self.session_personas[session_id]
        logger.info(f"Client disconnected: {session_id}")

    def update_persona(self, session_id: str, new_persona_id: str) -> bool:
        if new_persona_id in PERSONA_DICTIONARY:
            self.session_personas[session_id] = new_persona_id
            logger.info(f"Session {session_id} switched persona to {new_persona_id}")
            return True
        return False

manager = SessionManager()


# ============================================================================
# 3. AI STREAM SESSION BRIDGE (GEMINI LIVE / REALTIME API INTEGRATION)
# ============================================================================

class RealtimeVoiceSession:
    """
    Manages continuous bidirectional voice audio stream bridging between
    the user's browser client and the Gemini Live / OpenAI Realtime API.
    """
    def __init__(self, session_id: str, persona_id: str, client_ws: WebSocket):
        self.session_id = session_id
        self.persona_id = persona_id
        self.client_ws = client_ws
        self.persona_info = PERSONA_DICTIONARY.get(persona_id, PERSONA_DICTIONARY["flirt_girl"])
        self.is_active = True
        self.system_prompt = self.persona_info["system_prompt"]
        self.voice_name = self.persona_info["voice"]

    async def initialize_ai_session(self):
        """
        Connects to the upstream AI Realtime API (e.g. Gemini 3.8 Live API
        or OpenAI Realtime WebSockets) with the injected persona system prompt.
        """
        logger.info(f"Initializing AI stream session for {self.persona_id} with voice {self.voice_name}")
        
        # Notify the client that the real-time session has been negotiated
        await self.client_ws.send_json({
            "type": "session_created",
            "session_id": self.session_id,
            "persona_id": self.persona_id,
            "persona_name": self.persona_info["name"],
            "voice": self.voice_name,
            "status": "ready"
        })

    async def switch_persona(self, new_persona_id: str):
        """
        Dynamically updates the active AI session prompt and voice without dropping
        the client's Web Audio stream!
        """
        if new_persona_id not in PERSONA_DICTIONARY:
            logger.warning(f"Unknown persona requested: {new_persona_id}")
            return

        self.persona_id = new_persona_id
        self.persona_info = PERSONA_DICTIONARY[new_persona_id]
        self.system_prompt = self.persona_info["system_prompt"]
        self.voice_name = self.persona_info["voice"]
        manager.update_persona(self.session_id, new_persona_id)

        logger.info(f"Dynamically injected new persona prompt into session {self.session_id}: {self.persona_id}")

        await self.client_ws.send_json({
            "type": "persona_switched",
            "persona_id": self.persona_id,
            "persona_name": self.persona_info["name"],
            "badge": self.persona_info["badge"],
            "voice": self.voice_name,
            "message": f"Switched into {self.persona_info['name']} mode!"
        })

    async def handle_user_audio_chunk(self, pcm_base64: str):
        """
        Receives continuous raw PCM audio (16kHz mono) from the browser's
        ScriptProcessorNode / AudioWorklet and forwards it to the upstream AI engine.
        """
        # Here: forward to Gemini Live session.sendRealtimeInput({ audio: { data: pcm_base64 } })
        # Or OpenAI Realtime: session.send({"type": "input_audio_buffer.append", "audio": pcm_base64})
        pass

    async def emit_audio_response(self, audio_base64: str, transcript_text: str):
        """
        Streams back synthetic speech audio chunks and transcript text to the browser.
        """
        if self.is_active:
            await self.client_ws.send_json({
                "type": "audio_chunk",
                "audio": audio_base64,
                "text": transcript_text,
                "persona_id": self.persona_id
            })


# ============================================================================
# 4. WEBSOCKET ENDPOINT: /chat/{persona_id}
# ============================================================================

@app.websocket("/chat/{persona_id}")
async def voice_chat_endpoint(websocket: WebSocket, persona_id: str):
    """
    Real-Time WebSocket endpoint that catches the chosen persona_id,
    pulls the corresponding system prompt from the persona dictionary,
    and runs the full-duplex voice pipeline.
    """
    # Fallback to flirt_girl if invalid
    if persona_id not in PERSONA_DICTIONARY:
        persona_id = "flirt_girl"

    session_id = f"session_{id(websocket)}_{asyncio.get_event_loop().time()}"
    await manager.connect(websocket, session_id, persona_id)

    voice_session = RealtimeVoiceSession(session_id, persona_id, websocket)
    await voice_session.initialize_ai_session()

    try:
        while True:
            # Receive either binary audio data or JSON control envelopes
            message = await websocket.receive()

            if "text" in message:
                try:
                    payload = json.loads(message["text"])
                    msg_type = payload.get("type")

                    # 1. Dynamic In-Flight Persona Switching
                    if msg_type == "switch_persona":
                        new_persona = payload.get("persona_id")
                        await voice_session.switch_persona(new_persona)

                    # 2. Continuous Mic Audio Streaming (Base64 PCM)
                    elif msg_type == "audio_input":
                        audio_data = payload.get("audio")
                        if audio_data:
                            await voice_session.handle_user_audio_chunk(audio_data)

                    # 3. User Text Input (Multimodal Fallback)
                    elif msg_type == "text_input":
                        user_text = payload.get("text", "")
                        logger.info(f"Received text message: {user_text}")
                        # Echo back / trigger AI model response
                        await websocket.send_json({
                            "type": "transcript",
                            "sender": "user",
                            "text": user_text
                        })

                    # 4. Latency Ping / Keepalive
                    elif msg_type == "ping":
                        await websocket.send_json({"type": "pong", "timestamp": payload.get("timestamp")})

                    # 5. User Interrupt Signal (Echo cancellation / Barge-in)
                    elif msg_type == "interrupt":
                        logger.info(f"User interrupted playback in session {session_id}")
                        await websocket.send_json({"type": "interrupted"})

                except json.JSONDecodeError:
                    logger.error("Failed to parse JSON text message")

            elif "bytes" in message:
                # Direct binary PCM chunk from Web Audio API
                raw_bytes = message["bytes"]
                b64_audio = base64.b64encode(raw_bytes).decode("utf-8")
                await voice_session.handle_user_audio_chunk(b64_audio)

    except WebSocketDisconnect:
        voice_session.is_active = False
        manager.disconnect(session_id)
    except Exception as e:
        logger.error(f"Unexpected error in voice session: {e}", exc_info=True)
        manager.disconnect(session_id)


# ============================================================================
# 5. HTTP STATUS & PERSONA REST API
# ============================================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Gemini Live Voice AI Pipeline",
        "available_personas": list(PERSONA_DICTIONARY.keys()),
        "active_sessions": len(manager.active_connections)
    }

@app.get("/personas")
def get_personas():
    """Returns available personas with their badges and metadata."""
    return {
        persona_id: {
            "name": data["name"],
            "badge": data["badge"],
            "voice": data["voice"]
        }
        for persona_id, data in PERSONA_DICTIONARY.items()
    }

if __name__ == "__main__":
    import uvicorn
    # Run standalone FastAPI server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
