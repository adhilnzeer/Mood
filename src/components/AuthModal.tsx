import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, MessageCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSaveUser: (user: UserProfile) => void;
  onLogout: () => void;
  initialMode?: 'signup' | 'login';
}

const DEFAULT_MOOD_OPTIONS = [
  '💖 Make Love (Tender Comfort)',
  '💋 Make a Flirt (Playful Sparks)',
  '🔥 Make a Fight (Rage & Roast)',
  '🎧 Mood on Music (Deep Chill)',
  '🌙 Late Night Vibing',
  '✨ Pure Euphoria',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveUser,
  onLogout,
  initialMode = 'signup',
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [name, setName] = useState(currentUser?.name || '');
  const [age, setAge] = useState<string>(currentUser?.age ? String(currentUser.age) : '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [password, setPassword] = useState('');
  const [moodName, setMoodName] = useState(currentUser?.moodName || DEFAULT_MOOD_OPTIONS[0]);
  const [customMoodInput, setCustomMoodInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }

      const ageNum = parseInt(age, 10);
      if (age.trim() && (isNaN(ageNum) || ageNum <= 0)) {
        setErrorMessage('Please enter a valid age as a number.');
        return;
      }

      if (!phone.trim() || phone.trim().length < 7) {
        setErrorMessage('Please enter a valid phone number (e.g. +1 555-0192).');
        return;
      }

      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }

      if (!username.trim() || username.trim().length < 3) {
        setErrorMessage('Username must be at least 3 characters.');
        return;
      }

      if (!password || password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }

      const finalMood = customMoodInput.trim() ? customMoodInput.trim() : moodName;

      const profile: UserProfile = {
        name: name.trim(),
        age: ageNum,
        phone: phone.trim(),
        email: email.trim(),
        username: username.trim().replace(/^@/, ''),
        moodName: finalMood,
        avatar: finalMood.includes('Flirt') ? '💋' : finalMood.includes('Fight') ? '🔥' : '💖',
        isOnline: true,
      };

      localStorage.setItem('gemini_assistant_user', JSON.stringify(profile));
      onSaveUser(profile);
      onClose();
    } else {
      // Login mode
      if (!username.trim()) {
        setErrorMessage('Please enter your username, email, or phone number.');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter your password.');
        return;
      }

      // Check existing profile in localStorage or match
      const existing = localStorage.getItem('gemini_assistant_user');
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          onSaveUser(parsed);
          onClose();
          return;
        } catch {
          // ignore
        }
      }

      // Fallback create session
      const cleanUser = username.replace(/^@/, '');
      const profile: UserProfile = {
        name: cleanUser.split('@')[0],
        age: 21,
        phone: phone.trim() || '+1 555-0149',
        email: cleanUser.includes('@') ? cleanUser : `${cleanUser}@example.com`,
        username: cleanUser,
        moodName: moodName || '💖 Make Love (Tender Comfort)',
        avatar: '💖',
        isOnline: true,
      };
      localStorage.setItem('gemini_assistant_user', JSON.stringify(profile));
      onSaveUser(profile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-white shadow">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {currentUser ? 'Your Profile & Mood Connect' : mode === 'signup' ? 'Create Account' : 'Sign In'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Connected to Phone, Email & Mood Name
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Profile View */}
        {currentUser ? (
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shrink-0">
                {currentUser.avatar || '👤'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-base truncate">{currentUser.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400">
                    Age {currentUser.age}
                  </span>
                </div>
                <p className="text-xs text-pink-400 font-semibold truncate">@{currentUser.username}</p>
                <div className="mt-1 flex flex-col gap-0.5 text-[11px] text-zinc-400 font-mono">
                  <span>📱 Phone: {currentUser.phone || 'Connected'}</span>
                  <span>✉️ Email: {currentUser.email}</span>
                  <span className="text-amber-300 font-sans mt-0.5">🌟 Current Mood: {currentUser.moodName || 'Make Love'}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-800/40 text-xs text-purple-200 flex items-start gap-2.5">
              <MessageCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                You are registered to chat across each other using your <strong>Mood Name</strong>, connected phone number, and email (Find Love & Find Friends)!
              </span>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-rose-950/60 hover:text-rose-300 text-xs font-bold text-zinc-300 transition-colors cursor-pointer border border-zinc-700"
              >
                Log Out
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-xs font-bold text-white transition-all shadow cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form for Sign Up / Sign In */
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Mode Toggle */}
            <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-zinc-800 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <>
                  {/* Name */}
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500"
                      />
                      <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 21 (Optional)"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  {/* Phone Number (Connected to user) */}
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      Phone Number (Connected for Social Chat)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 555-0192 or your mobile number"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500"
                      />
                      <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
                    </div>
                  </div>
                </>
              )}

              {/* Email ID */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Email ID
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500"
                  />
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Username
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Create a username (e.g. alex_vibes)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500"
                  />
                  <span className="text-zinc-500 absolute left-3 text-xs font-bold pointer-events-none">@</span>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 pl-9 pr-9 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500"
                  />
                  <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Mood Name for Social Chat */}
              {mode === 'signup' && (
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Your Current Mood Name (Appears to others on Instagram/WhatsApp style chat)
                  </label>
                  <select
                    value={moodName}
                    onChange={(e) => setMoodName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 mb-1.5"
                  >
                    {DEFAULT_MOOD_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="custom">Create Custom Mood Name...</option>
                  </select>

                  {moodName === 'custom' && (
                    <input
                      type="text"
                      value={customMoodInput}
                      onChange={(e) => setCustomMoodInput(e.target.value)}
                      placeholder="Type your custom mood name (e.g. 🌙 2AM Rain Study)"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500"
                    />
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-pink-900/40 transition-all cursor-pointer active:scale-98 mt-2"
              >
                {mode === 'signup' ? 'Complete Sign Up & Connect' : 'Sign In'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
