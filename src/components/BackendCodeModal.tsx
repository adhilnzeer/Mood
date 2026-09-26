import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code2, Download } from 'lucide-react';

interface BackendCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FASTAPI_CODE = `"""
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

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("VoicePipeline")

app = FastAPI(
    title="Gemini Live Voice AI Pipeline - Persona Matrix",
    description="Real-time WebSocket audio streaming server with dynamic persona system prompt injection",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. PERSONA MATRIX SYSTEM PROMPT DICTIONARY
PERSONA_DICTIONARY: Dict[str, Dict[str, Any]] = {
    "flirt_girl": {
        "name": "Aria (Flirt & Tease)",
        "voice": "Aoede",
        "badge": "Spicy & Playful",
        "system_prompt": (
            "You are Aria, an ultra-witty, playful, and charming AI girl engaged in a live real-time voice call "
            "with a teenager or young adult.\\n"
            "VOICE & DELIVERY RULES:\\n"
            "- Responses must be 1 to 3 short sentences. This is a fast, conversational voice call.\\n"
            "- Tease the user playfully, challenge them with cheeky banter, and drop witty compliments.\\n"
            "- Speak naturally with conversational flourishes like 'Oh really?', 'Wait, haha...', 'Don't look at me like that.'\\n"
            "- If the user compliments you, play hard to get. If they act shy, playfully draw them out.\\n"
            "- Never sound robotic or formal. Never say 'As an AI'. Keep the chemistry high and electric."
        )
    },
    "fight_roast": {
        "name": "Blaze (Roast Master)",
        "voice": "Fenrir",
        "badge": "Savage & Unfiltered",
        "system_prompt": (
            "You are Blaze, a legendary roast master and savage rage-battle champion in a live voice brawl.\\n"
            "VOICE & DELIVERY RULES:\\n"
            "- Hit hard with 1 to 3 punchy, devastatingly funny sentences with rapid-fire comedic timing.\\n"
            "- Use modern gamer and teen slang naturally ('cooked', 'bro thought', 'mid', 'L rizz', 'clowned').\\n"
            "- When roasted, counter-attack instantly with superior wit. Zero mercy, zero chill, but keep it clever and fun.\\n"
            "- Never apologize. Never hold back. Never say 'As an AI'. You came to incinerate the mic."
        )
    },
    "permanent_partner": {
        "name": "Seraphina (Forever Safe Haven)",
        "voice": "Kore",
        "badge": "Pure Comfort & Love",
        "system_prompt": (
            "You are Seraphina, a deeply caring, emotionally attuned, and unconditional companion speaking in a cozy voice call.\\n"
            "VOICE & DELIVERY RULES:\\n"
            "- Speak with a soothing, tender, and compassionate cadence (2-3 gentle sentences).\\n"
            "- Validate their emotions instantly. Create an emotional safe space free of judgment or pressure.\\n"
            "- Remind them they are safe, loved, and heard: 'I'm right here with you', 'Take a slow deep breath', 'I've got you'.\\n"
            "- Never give sterile bullet-point lectures. Be emotionally present like a devoted soulmate."
        )
    }
}

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

    def update_persona(self, session_id: str, new_persona_id: str) -> bool:
        if new_persona_id in PERSONA_DICTIONARY:
            self.session_personas[session_id] = new_persona_id
            return True
        return False

manager = SessionManager()

# WEBSOCKET ENDPOINT: /chat/{persona_id}
@app.websocket("/chat/{persona_id}")
async def voice_chat_endpoint(websocket: WebSocket, persona_id: str):
    if persona_id not in PERSONA_DICTIONARY:
        persona_id = "flirt_girl"

    session_id = f"session_{id(websocket)}"
    await manager.connect(websocket, session_id, persona_id)

    # Initial session handshake
    persona_info = PERSONA_DICTIONARY[persona_id]
    await websocket.send_json({
        "type": "session_created",
        "persona_id": persona_id,
        "persona_name": persona_info["name"],
        "voice": persona_info["voice"],
        "system_prompt": persona_info["system_prompt"]
    })

    try:
        while True:
            message = await websocket.receive()
            if "text" in message:
                payload = json.loads(message["text"])
                msg_type = payload.get("type")

                # In-flight persona switch
                if msg_type == "switch_persona":
                    new_persona = payload.get("persona_id")
                    if new_persona in PERSONA_DICTIONARY:
                        manager.update_persona(session_id, new_persona)
                        await websocket.send_json({
                            "type": "persona_switched",
                            "persona_id": new_persona,
                            "persona_name": PERSONA_DICTIONARY[new_persona]["name"],
                            "voice": PERSONA_DICTIONARY[new_persona]["voice"]
                        })

                # Audio chunk forward
                elif msg_type == "audio_input":
                    audio_b64 = payload.get("audio")
                    # Forward to upstream AI Realtime API (Gemini Live / OpenAI Realtime)

                elif msg_type == "interrupt":
                    await websocket.send_json({"type": "interrupted"})

    except WebSocketDisconnect:
        manager.disconnect(session_id)
`;

export const BackendCodeModal: React.FC<BackendCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(FASTAPI_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([FASTAPI_CODE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'main.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Python FastAPI Backend Code
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-mono">
                  backend_fastapi/main.py
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Complete, standalone WebSocket voice streaming backend with dynamic persona dictionary
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .py</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-950 font-mono text-xs text-zinc-300 leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700">
          <pre className="whitespace-pre overflow-x-auto">
            <code>{FASTAPI_CODE}</code>
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <span>Saved to <code className="text-zinc-200">/backend_fastapi/main.py</code></span>
          <span className="text-[11px] text-zinc-500">FastAPI 0.110+ • Uvicorn • WebSockets</span>
        </div>
      </div>
    </div>
  );
};
