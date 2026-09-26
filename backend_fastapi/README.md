# FastAPI Real-Time Voice Assistant Pipeline

A high-performance Python FastAPI WebSocket backend inspired by Gemini Live with continuous bidirectional audio streaming and dynamic persona system prompt injection.

## Personas Included
1. **`flirt_girl` ("Aria")**: Witty, teasing, charismatic banter, high chemistry.
2. **`fight_roast` ("Blaze")**: Sarcastic, razor-sharp comebacks, rap-battle intensity, savage rage roasts.
3. **`permanent_partner` ("Seraphina")**: Gentle, deeply comforting, late-night safe haven, emotional reassurance.

## Key Features
- **WebSocket Endpoint**: `/chat/{persona_id}`
- **Dynamic Prompt Injection**: Change personas in-flight via `{"type": "switch_persona", "persona_id": "fight_roast"}` without reconnecting or interrupting Web Audio streams.
- **Continuous Audio Streaming**: Web Audio API sends raw 16kHz PCM audio buffers; backend connects to Gemini Live API / OpenAI Realtime API.
- **Barge-in / Interruption Support**: Instant `interrupt` protocol to silence AI speech immediately when the user speaks.

## Running the FastAPI Backend
```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set environment variable
export GEMINI_API_KEY="your-gemini-api-key"

# 4. Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
