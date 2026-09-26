import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DirectMessage, MoodContact } from '../types';
import {
  ArrowLeft,
  X,
  Send,
  Search,
  Users,
  Camera,
  Phone,
  Mail,
  Sparkles,
  CheckCheck,
  Smile,
  Mic,
  Radio,
  UserPlus,
  Bookmark,
  BookmarkCheck,
  MessageCircle,
} from 'lucide-react';

export type SocialMode = 'friends' | 'lounge';

interface SocialMoodChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  initialMode?: SocialMode;
  initialSearchQuery?: string;
  onOpenMoodRoom?: (moodId: string) => void;
  onUpdateCurrentUser?: (user: UserProfile) => void;
}

// Initial realistic active community contacts (Human Peer Users)
const INITIAL_CONTACTS: MoodContact[] = [
  {
    id: 'user_maya',
    username: 'maya_sunset',
    name: 'Maya Lin',
    phone: '+1 (555) 234-8901',
    email: 'maya.lin@gmail.com',
    moodName: '💖 Love',
    avatar: '🌸',
    statusMessage: 'Student & photographer in NYC • Late night coffee lover',
    isOnline: true,
    lastSeen: 'Active now',
    unreadCount: 1,
  },
  {
    id: 'user_ethan',
    username: 'ethan_sparks',
    name: 'Ethan Cole',
    phone: '+1 (555) 872-4412',
    email: 'ethan.c@icloud.com',
    moodName: '💋 Flirt',
    avatar: '😏',
    statusMessage: 'UI Designer & music collector • Hit me up with lo-fi beats',
    isOnline: true,
    lastSeen: 'Active now',
    unreadCount: 1,
  },
  {
    id: 'user_kai',
    username: 'kai_rage808',
    name: 'Kai Vance',
    phone: '+1 (555) 319-9023',
    email: 'kaivance.beats@gmail.com',
    moodName: '🔥 Fight',
    avatar: '⚡',
    statusMessage: 'Gamer & phonk producer • Looking for Warzone / Valorant duo',
    isOnline: true,
    lastSeen: '5m ago',
    unreadCount: 0,
  },
  {
    id: 'user_chloe',
    username: 'chloe_lofi',
    name: 'Chloe Zhang',
    phone: '+1 (555) 604-1278',
    email: 'chloezhang@outlook.com',
    moodName: '🎧 Music',
    avatar: '🎧',
    statusMessage: 'Studying architecture with vinyl spins on background',
    isOnline: false,
    lastSeen: '25m ago',
    unreadCount: 0,
  },
  {
    id: 'user_zack',
    username: 'zack_midnight',
    name: 'Zack Miller',
    phone: '+1 (555) 441-9980',
    email: 'zack.miller99@gmail.com',
    moodName: '🌙 Custom',
    avatar: '🌧️',
    statusMessage: 'Late night driver, cars & cinematography',
    isOnline: true,
    lastSeen: 'Active now',
    unreadCount: 0,
  },
];

const INITIAL_MESSAGES: Record<string, DirectMessage[]> = {
  user_maya: [
    {
      id: 'm1',
      fromUsername: 'maya_sunset',
      toUsername: 'me',
      fromName: 'Maya Lin',
      fromPhone: '+1 (555) 234-8901',
      fromEmail: 'maya.lin@gmail.com',
      fromMoodName: '💖 Love',
      fromAvatar: '🌸',
      text: 'Hey! Found your account on the network. I just finished my photo set today, what kind of vibe are you listening to right now?',
      timestamp: Date.now() - 1000 * 60 * 18,
      isRead: true,
    },
  ],
  user_ethan: [
    {
      id: 'e1',
      fromUsername: 'ethan_sparks',
      toUsername: 'me',
      fromName: 'Ethan Cole',
      fromPhone: '+1 (555) 872-4412',
      fromEmail: 'ethan.c@icloud.com',
      fromMoodName: '💋 Flirt',
      fromAvatar: '😏',
      text: 'Yo! Checked your mood profile. Love your taste in tracks. Hope you had a great day!',
      timestamp: Date.now() - 1000 * 60 * 6,
      isRead: false,
    },
  ],
  user_kai: [
    {
      id: 'k1',
      fromUsername: 'kai_rage808',
      toUsername: 'me',
      fromName: 'Kai Vance',
      fromPhone: '+1 (555) 319-9023',
      fromEmail: 'kaivance.beats@gmail.com',
      fromMoodName: '🔥 Fight',
      fromAvatar: '⚡',
      text: 'Yo! You down for some late night gaming or music production talk? Let us connect 😤',
      timestamp: Date.now() - 1000 * 60 * 45,
      isRead: true,
    },
  ],
};

export const SocialMoodChat: React.FC<SocialMoodChatProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialMode = 'friends',
  initialSearchQuery = '',
  onUpdateCurrentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'collection' | 'lounge'>('all');
  const [contacts, setContacts] = useState<MoodContact[]>(() => {
    try {
      const saved = localStorage.getItem('gemini_social_contacts');
      return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
    } catch {
      return INITIAL_CONTACTS;
    }
  });

  const [selectedContact, setSelectedContact] = useState<MoodContact>(contacts[0]);
  const [messagesMap, setMessagesMap] = useState<Record<string, DirectMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('gemini_social_messages');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [myMoodStatus, setMyMoodStatus] = useState<string>(currentUser.moodName || '💖 Love');
  const [isEditingMyMood, setIsEditingMyMood] = useState(false);
  const [userFriendsCollection, setUserFriendsCollection] = useState<string[]>(
    currentUser.friendsCollection || ['maya_sunset', 'ethan_sparks']
  );

  // Sync initialSearchQuery
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Sync friends collection from props
  useEffect(() => {
    if (currentUser.friendsCollection) {
      setUserFriendsCollection(currentUser.friendsCollection);
    }
  }, [currentUser.friendsCollection]);

  // Lounge broadcast messages (Public Community Group Chat between real users)
  const [loungeMessages, setLoungeMessages] = useState<DirectMessage[]>([
    {
      id: 'l1',
      fromUsername: 'maya_sunset',
      toUsername: 'lounge',
      fromName: 'Maya Lin',
      fromMoodName: '💖 Love',
      fromAvatar: '🌸',
      text: 'Warm greetings to everyone studying or chilling right now! ✨',
      timestamp: Date.now() - 1000 * 60 * 20,
    },
    {
      id: 'l2',
      fromUsername: 'ethan_sparks',
      toUsername: 'lounge',
      fromName: 'Ethan Cole',
      fromMoodName: '💋 Flirt',
      fromAvatar: '😏',
      text: 'Anyone here working on creative design or music tracks tonight? Drop your handles!',
      timestamp: Date.now() - 1000 * 60 * 15,
    },
    {
      id: 'l3',
      fromUsername: 'kai_rage808',
      toUsername: 'lounge',
      fromName: 'Kai Vance',
      fromMoodName: '🔥 Fight',
      fromAvatar: '⚡',
      text: 'Drift Phonk blast session! Who wants to hop in a Discord gaming match tonight? 😤',
      timestamp: Date.now() - 1000 * 60 * 8,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesMap, selectedContact, loungeMessages, activeTab]);

  // Save contacts & messages in localStorage
  useEffect(() => {
    localStorage.setItem('gemini_social_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('gemini_social_messages', JSON.stringify(messagesMap));
  }, [messagesMap]);

  if (!isOpen) return null;

  // Toggle Friend in Collection
  const handleToggleFriendCollection = (username: string) => {
    let updated: string[];
    if (userFriendsCollection.includes(username)) {
      updated = userFriendsCollection.filter((u) => u !== username);
    } else {
      updated = [...userFriendsCollection, username];
    }
    setUserFriendsCollection(updated);

    const updatedUser: UserProfile = {
      ...currentUser,
      friendsCollection: updated,
    };
    localStorage.setItem('gemini_assistant_user', JSON.stringify(updatedUser));
    if (onUpdateCurrentUser) onUpdateCurrentUser(updatedUser);
  };

  // Filter contacts by Instagram-style search query & collection tab
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase().trim().replace(/^@/, '');
    const matchesSearch =
      !q ||
      c.username.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.moodName.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeTab === 'collection') {
      return userFriendsCollection.includes(c.username);
    }
    return true;
  });

  // If user searched a username that doesn't exist yet, allow adding them as a real individual contact
  const searchedClean = searchQuery.trim().replace(/^@/, '');
  const hasExactMatch = contacts.some(
    (c) => c.username.toLowerCase() === searchedClean.toLowerCase()
  );

  const handleAddNewSearchedUser = () => {
    if (!searchedClean) return;
    const newContact: MoodContact = {
      id: `user_${searchedClean}`,
      username: searchedClean,
      name: searchedClean.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      phone: '+1 (555) ' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000),
      email: `${searchedClean}@example.com`,
      moodName: '✨ Active Friend',
      avatar: '👤',
      statusMessage: 'Connected individual friend',
      isOnline: true,
      lastSeen: 'Active now',
    };

    setContacts((prev) => [newContact, ...prev]);
    setSelectedContact(newContact);
    handleToggleFriendCollection(searchedClean);
    setSearchQuery('');
  };

  const currentMessages = messagesMap[selectedContact.id] || [];

  // Send Direct Message (User-to-User Real Interaction)
  const handleSendMessage = (e?: React.FormEvent, customMsg?: string, msgType: 'text' | 'voice' | 'snap_mood' = 'text') => {
    if (e) e.preventDefault();
    const textToSend = customMsg || inputText;
    if (!textToSend.trim()) return;

    if (activeTab === 'lounge') {
      const newLoungeMsg: DirectMessage = {
        id: `lounge_${Date.now()}`,
        fromUsername: currentUser.username,
        toUsername: 'lounge',
        fromName: currentUser.name,
        fromPhone: currentUser.phone,
        fromEmail: currentUser.email,
        fromMoodName: myMoodStatus,
        fromAvatar: currentUser.avatar || '✨',
        text: textToSend.trim(),
        timestamp: Date.now(),
        type: msgType,
      };
      setLoungeMessages((prev) => [...prev, newLoungeMsg]);
      setInputText('');
      return;
    }

    const newMsg: DirectMessage = {
      id: `msg_${Date.now()}`,
      fromUsername: currentUser.username,
      toUsername: selectedContact.username,
      fromName: currentUser.name,
      fromPhone: currentUser.phone,
      fromEmail: currentUser.email,
      fromMoodName: myMoodStatus,
      fromAvatar: currentUser.avatar || '✨',
      text: textToSend.trim(),
      timestamp: Date.now(),
      type: msgType,
      isRead: false,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg],
    }));

    setInputText('');

    // Realistic peer automated confirmation reply from the individual
    setTimeout(() => {
      let reply = '';
      if (selectedContact.username === 'maya_sunset') {
        reply = `Hey @${currentUser.username}! Just saw your text. So glad you reached out! What are you listening to right now?`;
      } else if (selectedContact.username === 'ethan_sparks') {
        reply = `Yo! Thanks for the message @${currentUser.username}. Was just tweaking some design beats. What's good?`;
      } else if (selectedContact.username === 'kai_rage808') {
        reply = `Yo bro! Glad to connect on here 😤 Let us know if you want to hop on a lobby or share some phonk!`;
      } else {
        reply = `Hey @${currentUser.username}! Thanks for finding my account! Great to connect with you on here.`;
      }

      const peerReply: DirectMessage = {
        id: `peer_${Date.now()}`,
        fromUsername: selectedContact.username,
        toUsername: currentUser.username,
        fromName: selectedContact.name,
        fromPhone: selectedContact.phone,
        fromEmail: selectedContact.email,
        fromMoodName: selectedContact.moodName,
        fromAvatar: selectedContact.avatar,
        text: reply,
        timestamp: Date.now(),
        isRead: true,
      };

      setMessagesMap((prev) => ({
        ...prev,
        [selectedContact.id]: [...(prev[selectedContact.id] || []), peerReply],
      }));
    }, 1400);
  };

  const handleSendVoiceNote = () => {
    handleSendMessage(undefined, '🎤 [Voice Note 0:14] "Hey, just sending a quick voice message to check in!"', 'voice');
  };

  const handleSendSnap = () => {
    handleSendMessage(undefined, `📸 Sent a photo snap: [${myMoodStatus} vibe]`, 'snap_mood');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[820px] bg-zinc-950/95 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header Bar with Top Left Back Arrow */}
        <div className="px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Back Option Arrow in Top Left */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:inline">Back</span>
            </button>

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white tracking-tight">
                  Find Friends
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono">
                  Direct Messaging
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Connected as <strong className="text-zinc-200">@{currentUser.username}</strong> • Search by @username
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick My Mood Badge */}
            <div className="relative">
              {isEditingMyMood ? (
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 px-2 py-1 rounded-xl">
                  <input
                    type="text"
                    value={myMoodStatus}
                    onChange={(e) => setMyMoodStatus(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingMyMood(false)}
                    className="bg-transparent text-xs text-white focus:outline-none w-28"
                    placeholder="My Mood..."
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingMyMood(false)}
                    className="text-xs text-cyan-400 font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingMyMood(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-zinc-200 transition-all cursor-pointer shadow-sm"
                  title="Click to edit your broadcasted mood"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span className="text-[11px] truncate max-w-[130px]">{myMoodStatus}</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs: All Friends vs Friends Collection vs Community Lounge */}
        <div className="px-5 py-2.5 border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white bg-zinc-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search People (@username)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('collection')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'collection'
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white bg-zinc-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Friends Collection ({userFriendsCollection.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lounge')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'lounge'
                  ? 'bg-zinc-700 text-white shadow'
                  : 'text-zinc-400 hover:text-white bg-zinc-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Lounge</span>
            </button>
          </div>

          <span className="hidden md:inline text-[11px] text-zinc-400 font-medium">
            {activeTab === 'all'
              ? 'Search individual accounts across the network'
              : activeTab === 'collection'
              ? 'Your saved close friends collection'
              : 'Public live community channel'}
          </span>
        </div>

        {/* Main Body: Sidebar + Chat Window */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT SIDEBAR: Search & Contacts List */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-zinc-800 flex flex-col bg-zinc-950/60 shrink-0 ${
              activeTab !== 'lounge' ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Username Search Bar */}
            <div className="p-3 border-b border-zinc-800/80 bg-zinc-900/40">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search people using their @username..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 pl-8 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
                />
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Notice if searched username is not found yet */}
              {searchedClean && !hasExactMatch && (
                <div className="mt-2 p-2 rounded-xl bg-cyan-950/40 border border-cyan-800 text-[11px] text-cyan-300 flex items-center justify-between">
                  <span>Start chat with @{searchedClean}</span>
                  <button
                    type="button"
                    onClick={handleAddNewSearchedUser}
                    className="px-2 py-0.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer"
                  >
                    + Add & Chat
                  </button>
                </div>
              )}
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-10 px-4 text-xs text-zinc-500">
                  {activeTab === 'collection'
                    ? 'No friends saved in your collection yet. Search by @username and bookmark them!'
                    : `No individual account matching "${searchQuery}".`}
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected = selectedContact.id === contact.id;
                  const isSavedInCollection = userFriendsCollection.includes(contact.username);
                  const lastMsg = (messagesMap[contact.id] || []).slice(-1)[0];

                  return (
                    <div
                      key={contact.id}
                      onClick={() => {
                        setSelectedContact(contact);
                        if (activeTab === 'lounge') setActiveTab('all');
                      }}
                      className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-zinc-800/80 border-l-4 border-cyan-500'
                          : 'hover:bg-zinc-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-xl shadow-md border border-zinc-700">
                            {contact.avatar}
                          </div>
                          {contact.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white truncate">
                              {contact.name}
                            </h4>
                            {lastMsg && (
                              <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                                {new Date(lastMsg.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-mono">
                            <span>@{contact.username}</span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-400 font-sans truncate text-[10px]">
                              {contact.moodName}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {lastMsg?.text || contact.statusMessage}
                          </p>
                        </div>
                      </div>

                      {/* Bookmark to Friends Collection */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFriendCollection(contact.username);
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                          isSavedInCollection
                            ? 'text-pink-400 hover:text-pink-300'
                            : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                        title={isSavedInCollection ? 'In Friends Collection' : 'Add to Friends Collection'}
                      >
                        {isSavedInCollection ? (
                          <BookmarkCheck className="w-4 h-4 fill-current" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT SIDE: 1-on-1 Real User Chat or Live Community Lounge */}
          <div className="flex-1 flex flex-col bg-zinc-950/40">
            {activeTab === 'lounge' ? (
              /* Public Live Community Lounge */
              <div className="flex-1 flex flex-col">
                <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-cyan-900/60 flex items-center justify-center text-cyan-300">
                      <Radio className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Live Community Lounge</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Live Broadcast
                        </span>
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        Chat publicly with people across all moods
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lounge Message Feed */}
                <div className="flex-1 p-5 overflow-y-auto space-y-3">
                  {loungeMessages.map((msg) => {
                    const isMe = msg.fromUsername === currentUser.username;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm shrink-0 border border-zinc-700">
                          {msg.fromAvatar || '👤'}
                        </div>
                        <div
                          className={`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 ${
                            isMe
                              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none shadow-md'
                              : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] opacity-80">
                            <span className="font-bold">@{msg.fromUsername}</span>
                            <span>•</span>
                            <span>{msg.fromMoodName}</span>
                          </div>
                          <p>{msg.text}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            ) : (
              /* 1-on-1 Direct Chat with Individual User */
              <div className="flex-1 flex flex-col">
                {/* 1-on-1 User Header */}
                <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl shadow border border-zinc-700">
                        {selectedContact.avatar}
                      </div>
                      {selectedContact.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {selectedContact.name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                          @{selectedContact.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono mt-0.5">
                        <span className="text-pink-400 font-sans">{selectedContact.moodName}</span>
                        <span>📱 {selectedContact.phone}</span>
                        <span className="hidden sm:inline">✉️ {selectedContact.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bookmark to Friends Collection */}
                  <button
                    type="button"
                    onClick={() => handleToggleFriendCollection(selectedContact.username)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      userFriendsCollection.includes(selectedContact.username)
                        ? 'bg-pink-600/30 text-pink-300 border border-pink-500'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {userFriendsCollection.includes(selectedContact.username) ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>In Friends Collection</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>+ Add to Collection</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Message History Feed */}
                <div className="flex-1 p-5 overflow-y-auto space-y-3">
                  {currentMessages.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500 text-xs space-y-2">
                      <p>Start a conversation with @{selectedContact.username}!</p>
                      <p className="text-[11px] text-zinc-600">
                        Messages are delivered directly to their connected phone and email profile.
                      </p>
                    </div>
                  ) : (
                    currentMessages.map((msg) => {
                      const isMe = msg.fromUsername === currentUser.username;
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm shrink-0 border border-zinc-700">
                            {isMe ? currentUser.avatar || '👤' : selectedContact.avatar}
                          </div>

                          <div
                            className={`max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1 shadow-md ${
                              isMe
                                ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white rounded-tr-none'
                                : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none'
                            }`}
                          >
                            <p className="leading-relaxed">{msg.text}</p>
                            <div className="flex items-center justify-end gap-1.5 text-[10px] opacity-75 mt-1 font-mono">
                              <span>
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isMe && <CheckCheck className="w-3 h-3 text-cyan-300" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}

            {/* Input Bar (Direct Message / Voice Note / Snap) */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendSnap}
                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Send Photo Snap"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleSendVoiceNote}
                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Send Voice Note"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    activeTab === 'lounge'
                      ? 'Broadcast message to live community lounge...'
                      : `Message @${selectedContact.username}...`
                  }
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-xs font-bold text-white shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
