import React, { useState, useRef } from 'react';
import { UserProfile, MoodContact } from '../types';
import {
  X,
  User,
  Phone,
  Mail,
  Camera,
  Upload,
  Sparkles,
  Users,
  MessageCircle,
  Trash2,
  Check,
  Copy,
  LogOut,
  Search,
  ExternalLink,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onOpenChatWithUser?: (username: string) => void;
  allContacts?: MoodContact[];
}

const PRESET_AVATARS = [
  '🌸', '⚡', '🎧', '💫', '🌙', '🎨', '🌊', '🔥', '💎', '🕶️', '🚀', '🦊',
  '🦁', '🦋', '🍀', '✨', '☕', '🪐',
];

const PRESET_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
  onOpenChatWithUser,
  allContacts = [],
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'friends'>('profile');
  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [moodName, setMoodName] = useState(currentUser.moodName || '💖 Love');
  const [avatar, setAvatar] = useState(currentUser.avatar || '✨');
  const [profilePhoto, setProfilePhoto] = useState(currentUser.profilePhoto || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [friendsCollection, setFriendsCollection] = useState<string[]>(
    currentUser.friendsCollection || ['maya_sunset', 'ethan_sparks']
  );
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(`@${currentUser.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfilePhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFriend = (username: string) => {
    const updated = friendsCollection.filter((u) => u !== username);
    setFriendsCollection(updated);
  };

  const handleAddFriend = (username: string) => {
    const clean = username.replace(/^@/, '').trim();
    if (clean && !friendsCollection.includes(clean)) {
      setFriendsCollection((prev) => [...prev, clean]);
      setFriendSearchQuery('');
    }
  };

  const handleSave = () => {
    const updated: UserProfile = {
      ...currentUser,
      name: name.trim() || currentUser.username,
      phone: phone.trim(),
      email: email.trim(),
      moodName: moodName.trim(),
      avatar,
      profilePhoto,
      bio: bio.trim(),
      friendsCollection,
    };

    localStorage.setItem('gemini_assistant_user', JSON.stringify(updated));
    onUpdateUser(updated);

    // Sync to backend
    fetch('/api/social/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: updated.username,
        name: updated.name,
        phone: updated.phone,
        email: updated.email,
        moodName: updated.moodName,
        avatar: updated.avatar,
        profilePhoto: updated.profilePhoto,
      }),
    }).catch(() => {});

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  // Contacts matching Friends Collection
  const friendsInCollection = allContacts.filter((c) =>
    friendsCollection.includes(c.username)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-950/95 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Top Left Back Arrow */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[11px] font-bold hidden sm:inline">Back</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-white shadow">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>Account & Profile</span>
                <span className="text-[11px] text-pink-400 font-semibold font-mono">
                  @{currentUser.username}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Manage photo, credentials & Friends Collection
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

        {/* Tab Toggle: Profile Details vs Friends Collection */}
        <div className="px-6 pt-3 pb-2 flex gap-2 border-b border-zinc-800/60 bg-zinc-900/30 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-zinc-800 text-white shadow'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-pink-400" />
            <span>Profile Photo & Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'friends'
                ? 'bg-zinc-800 text-white shadow'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Friends Collection ({friendsCollection.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'profile' ? (
            <>
              {/* Profile Photo Option */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={currentUser.username}
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-pink-500/80 shadow-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-3xl shadow-xl ring-2 ring-pink-500/40">
                      {avatar}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 shadow-lg cursor-pointer"
                    title="Upload Profile Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h4 className="text-sm font-bold text-white">Profile Photo & Avatar</h4>
                  <p className="text-[11px] text-zinc-400">
                    Upload your picture or pick an aesthetic mood emoji
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-zinc-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3 text-pink-400" />
                      <span>Upload Device Photo</span>
                    </button>
                    {profilePhoto && (
                      <button
                        type="button"
                        onClick={() => setProfilePhoto('')}
                        className="px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-rose-950 text-zinc-400 hover:text-rose-300 text-[11px] cursor-pointer"
                      >
                        Reset Photo
                      </button>
                    )}
                  </div>

                  {/* Preset Photos */}
                  <div className="pt-1 flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-[10px] text-zinc-500 font-semibold shrink-0">Presets:</span>
                    {PRESET_PHOTOS.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="preset"
                        onClick={() => setProfilePhoto(url)}
                        className={`w-7 h-7 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform ${
                          profilePhoto === url ? 'ring-2 ring-pink-500' : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Preset Emoji Avatars */}
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                    {PRESET_AVATARS.map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => {
                          setAvatar(emo);
                        }}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center cursor-pointer transition-transform ${
                          avatar === emo && !profilePhoto
                            ? 'bg-pink-600/40 border border-pink-500 scale-110'
                            : 'bg-zinc-800/60 hover:bg-zinc-700'
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Username Part */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-bold text-sm">@</span>
                    <div>
                      <span className="text-xs text-zinc-400 block text-[10px] uppercase font-bold">
                        Your Unique Username
                      </span>
                      <span className="text-sm font-bold text-white font-mono">
                        {currentUser.username}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyUsername}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Connected Phone */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Connected Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 0192"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500"
                    />
                    <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
                  </div>
                </div>

                {/* Connected Email */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Connected Email ID
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500"
                    />
                    <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
                  </div>
                </div>

                {/* Active Mood Status */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Active Mood Name (Broadcasted to Friends)
                  </label>
                  <input
                    type="text"
                    value={moodName}
                    onChange={(e) => setMoodName(e.target.value)}
                    placeholder="e.g. 💖 Love or 🌙 2AM Rain Drive"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Friends Collection Option */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Your Friends Collection</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Saved individual friends you interact and chat with 1-on-1
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {friendsCollection.length} friends
                </span>
              </div>

              {/* Add Friend by @username input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={friendSearchQuery}
                    onChange={(e) => setFriendSearchQuery(e.target.value)}
                    placeholder="Add by @username (e.g. maya_sunset)..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 pl-8 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddFriend(friendSearchQuery)}
                  disabled={!friendSearchQuery.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-xs font-bold text-white cursor-pointer transition-all shrink-0"
                >
                  Add
                </button>
              </div>

              {/* Friends Collection List */}
              <div className="space-y-2">
                {friendsCollection.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-xs">
                    No friends in your collection yet. Search by username above to add friends!
                  </div>
                ) : (
                  friendsCollection.map((u) => {
                    const match = allContacts.find((c) => c.username === u);
                    return (
                      <div
                        key={u}
                        className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-lg shrink-0 border border-zinc-700">
                            {match?.avatar || '👤'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-xs font-bold text-white truncate">
                                {match?.name || u}
                              </h5>
                              {match?.isOnline && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              )}
                            </div>
                            <p className="text-[11px] text-pink-400 font-mono truncate">@{u}</p>
                            {match?.moodName && (
                              <span className="text-[10px] text-zinc-400 truncate block">
                                Mood: {match.moodName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {onOpenChatWithUser && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenChatWithUser(u);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Direct 1-on-1 Chat"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-pink-400" />
                              <span>Chat</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveFriend(u)}
                            className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Remove from Collection"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800/80 hover:bg-rose-950/60 hover:text-rose-300 text-xs font-bold text-zinc-400 transition-colors cursor-pointer border border-zinc-700/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-xs font-bold text-white shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
