import React, { useRef, useEffect } from 'react';
import { ChatMessage, PersonaConfig } from '../types';
import { PERSONAS } from '../personas/personaConfig';
import { Volume2, Send, Sparkles, User, Trash2, Mic, MicOff, Settings2 } from 'lucide-react';

interface LiveTranscriptProps {
  messages: ChatMessage[];
  currentPersona: PersonaConfig;
  assistantDisplayName: string;
  onSendMessage: (text: string) => void;
  onReplayAudio?: (msg: ChatMessage) => void;
  onClearHistory?: () => void;
  inputText: string;
  setInputText: (text: string) => void;
  isProcessing: boolean;
  isMicActive: boolean;
  onToggleMic: () => void;
  onOpenVoiceAssistant: () => void;
  voiceState: string;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  messages,
  currentPersona,
  assistantDisplayName,
  onSendMessage,
  onReplayAudio,
  onClearHistory,
  inputText,
  setInputText,
  isProcessing,
  isMicActive,
  onToggleMic,
  onOpenVoiceAssistant,
  voiceState,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full glass-water rounded-[36px] overflow-hidden shadow-2xl">
      {/* Transcript Header with Clean Title */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                voiceState === 'speaking'
                  ? 'bg-indigo-400 animate-bounce'
                  : isMicActive
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-zinc-500'
              }`}
            />
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{assistantDisplayName || currentPersona.name}</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Clear */}
          {messages.length > 0 && onClearHistory && (
            <button
              type="button"
              onClick={onClearHistory}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/80 transition-colors"
              title="Clear Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-[340px] max-h-[520px] scrollbar-thin scrollbar-thumb-zinc-700"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-3xl shadow-lg">
              {currentPersona.avatar}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-200">
                Chat with {assistantDisplayName || currentPersona.name}
              </p>
              <p className="text-xs text-zinc-400 max-w-sm mt-1">
                Type your thoughts below or tap the microphone voice symbol to speak out loud.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSystem = msg.sender === 'system';
            const personaMeta = msg.personaId ? PERSONAS[msg.personaId] : currentPersona;

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-950/70 border border-zinc-800/80 px-3 py-1 rounded-full shadow-sm">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-lg shrink-0 shadow-md">
                    {personaMeta?.avatar || '🤖'}
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl px-4 py-3 text-xs sm:text-sm shadow-md transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/60 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span className="font-bold text-xs opacity-90">
                      {isUser ? 'You' : assistantDisplayName || personaMeta?.name || 'Assistant'}
                    </span>
                    <span className="text-[10px] opacity-60 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="leading-relaxed text-zinc-100 whitespace-pre-wrap">{msg.text}</p>

                  {!isUser && onReplayAudio && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-700/50 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onReplayAudio(msg)}
                        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Play Voice</span>
                      </button>
                      <span className="text-[10px] text-zinc-500 font-mono">Voice: {personaMeta?.voice}</span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-indigo-900/60 border border-indigo-500/40 flex items-center justify-center text-white shrink-0 shadow-md">
                    <User className="w-4 h-4 text-indigo-300" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isProcessing && (
          <div className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-2xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-lg shrink-0 animate-pulse">
              {currentPersona.avatar}
            </div>
            <div className="bg-zinc-800/90 border border-zinc-700/60 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-zinc-300 flex items-center gap-2 shadow">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>{assistantDisplayName || currentPersona.name} is responding...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input bar with Voice Symbol directly inside message bar */}
      <form onSubmit={handleSubmit} className="p-3 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center gap-2">
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${assistantDisplayName || currentPersona.name}...`}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl pl-4 pr-12 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />

          {/* Voice Chat Option inside Voice Symbol inside the message bar */}
          <button
            type="button"
            onClick={onToggleMic}
            className={`absolute right-2 p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              isMicActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-md shadow-rose-900/40'
                : 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white'
            }`}
            title={isMicActive ? 'Stop Voice Chat' : 'Start Voice Chat'}
          >
            {isMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || isProcessing}
          className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:hover:from-indigo-600 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
