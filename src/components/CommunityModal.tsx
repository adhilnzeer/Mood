import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  ArrowLeft,
  X,
  Briefcase,
  Users,
  MapPin,
  MessageSquare,
  PlusCircle,
  Search,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Send,
  Heart,
  Globe,
  CheckCircle,
} from 'lucide-react';

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenChatWithUser: (username: string) => void;
}

type CommunityTab = 'jobs' | 'people' | 'places' | 'discussions';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  tags: string[];
  postedBy: {
    name: string;
    username: string;
    avatar: string;
  };
  description: string;
  timeAgo: string;
}

interface PlaceRecommendation {
  id: string;
  name: string;
  city: string;
  country: string;
  category: 'Vinyl Cafe' | 'Late Night' | 'Co-working' | 'Studio' | 'Scenic Spot';
  vibe: string;
  recommendedBy: string;
  notes: string;
  likes: number;
}

interface CommunityDiscussion {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  location: string;
  content: string;
  tag: string;
  timeAgo: string;
  likes: number;
  commentsCount: number;
}

const INITIAL_JOBS: JobPosting[] = [
  {
    id: 'j1',
    title: 'Senior Frontend & Web Audio Engineer',
    company: 'SoundScape Labs',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    tags: ['React', 'TypeScript', 'Web Audio API', 'Next.js'],
    postedBy: {
      name: 'Maya Lin',
      username: 'maya_sunset',
      avatar: '🌸',
    },
    description:
      'Building next-generation real-time voice and interactive music synthesizer interfaces.',
    timeAgo: '2h ago',
  },
  {
    id: 'j2',
    title: 'Creative UI/UX Designer (Spatial Audio)',
    company: 'Aura Studio',
    location: 'Tokyo, Japan / Remote',
    type: 'Contract',
    tags: ['Figma', 'Liquid UI', 'Design Systems', '3D'],
    postedBy: {
      name: 'Ethan Cole',
      username: 'ethan_sparks',
      avatar: '😏',
    },
    description:
      'Designing minimal, tactile, glassmorphic interfaces for ambient music creators.',
    timeAgo: '5h ago',
  },
  {
    id: 'j3',
    title: 'Full Stack AI Developer (Voice Agents)',
    company: 'Pulse AI',
    location: 'London, UK & Bangalore, India',
    type: 'Full-time',
    tags: ['Node.js', 'FastAPI', 'Gemini Live', 'WebSockets'],
    postedBy: {
      name: 'Kai Vance',
      username: 'kai_rage808',
      avatar: '⚡',
    },
    description:
      'Architecting low-latency full-duplex voice streams and community discovery backends.',
    timeAgo: '1d ago',
  },
  {
    id: 'j4',
    title: 'Sound Designer & Lo-Fi Beat Producer',
    company: 'Echo Frequency',
    location: 'Berlin, Germany',
    type: 'Freelance',
    tags: ['Ableton', 'Sound Design', 'Lo-Fi', 'Ambient'],
    postedBy: {
      name: 'Chloe Zhang',
      username: 'chloe_lofi',
      avatar: '🎧',
    },
    description:
      'Curating 432Hz ambient soundscapes, Rhodes piano chords, and study vinyl textures.',
    timeAgo: '2d ago',
  },
  {
    id: 'j5',
    title: 'Product Marketing & Community Lead',
    company: 'VibeMatrix Global',
    location: 'Dubai, UAE / Kochi, India',
    type: 'Full-time',
    tags: ['Community', 'Growth', 'Creator Economy'],
    postedBy: {
      name: 'Zack Miller',
      username: 'zack_midnight',
      avatar: '🌧️',
    },
    description:
      'Connecting global creators, musicians, and developers in localized city hubs.',
    timeAgo: '3d ago',
  },
];

const INITIAL_PLACES: PlaceRecommendation[] = [
  {
    id: 'p1',
    name: 'Lion Cafe (Classic Vinyl Sanctuary)',
    city: 'Shibuya, Tokyo',
    country: 'Japan',
    category: 'Vinyl Cafe',
    vibe: 'Pure silence, giant custom horn speakers, classical & ambient vinyl',
    recommendedBy: '@maya_sunset',
    notes: 'The absolute best place to unplug and think. No talking allowed, just deep acoustic sound.',
    likes: 42,
  },
  {
    id: 'p2',
    name: 'Rough Trade East & Espresso Bar',
    city: 'London',
    country: 'United Kingdom',
    category: 'Co-working',
    vibe: 'Vinyl racks, warm pour-overs, indie creators with laptops',
    recommendedBy: '@chloe_lofi',
    notes: 'Great Wi-Fi, incredible records, and friendly developers working on creative projects.',
    likes: 38,
  },
  {
    id: 'p3',
    name: 'Fort Kochi Sunset Promenade & Heritage Lounge',
    city: 'Kochi, Kerala',
    country: 'India',
    category: 'Scenic Spot',
    vibe: 'Sea breeze, rain sound, historic rain trees, artisanal spice coffee',
    recommendedBy: '@malavika_nair',
    notes: 'Magical atmosphere at 5 PM when the sun sets over the Arabian Sea with cool rain clouds.',
    likes: 56,
  },
  {
    id: 'p4',
    name: 'Holzmarkt Creative Riverside',
    city: 'Berlin',
    country: 'Germany',
    category: 'Late Night',
    vibe: 'Open fire pits, Spree river reflections, experimental music',
    recommendedBy: '@kai_rage808',
    notes: 'Unbeatable creative hub to meet international designers, DJs, and technologists.',
    likes: 29,
  },
  {
    id: 'p5',
    name: 'Alserkal Avenue Art & Sound Labs',
    city: 'Al Quoz, Dubai',
    country: 'UAE',
    category: 'Studio',
    vibe: 'Industrial warehouses turned indie cafes, analog synth workshops',
    recommendedBy: '@zack_midnight',
    notes: 'Quiet, inspiring warehouses with specialty matcha, bookshops, and acoustic exhibitions.',
    likes: 31,
  },
];

const INITIAL_PEOPLE = [
  {
    name: 'Maya Lin',
    username: 'maya_sunset',
    location: 'New York, USA',
    role: 'Photographer & Audio Engineer',
    avatar: '🌸',
    mood: '💖 Love',
    skills: ['Web Audio', 'Analog Photography', 'Ambient Rhodes'],
    isOnline: true,
  },
  {
    name: 'Ethan Cole',
    username: 'ethan_sparks',
    location: 'San Francisco, USA',
    role: 'UI Designer & Beat Producer',
    avatar: '😏',
    mood: '💋 Flirt',
    skills: ['Design Systems', 'Micro-interactions', 'Neo-soul'],
    isOnline: true,
  },
  {
    name: 'Kai Vance',
    username: 'kai_rage808',
    location: 'Tokyo, Japan',
    role: 'Gaming Producer & Drill Head',
    avatar: '⚡',
    mood: '🔥 Fight',
    skills: ['Game Audio', '808 Mixing', 'Phonk Bass'],
    isOnline: true,
  },
  {
    name: 'Chloe Zhang',
    username: 'chloe_lofi',
    location: 'London, UK',
    role: 'Architect & Vinyl Archivist',
    avatar: '🎧',
    mood: '🎧 Music',
    skills: ['Architecture', 'Vinyl Restoration', 'Jazz Chords'],
    isOnline: false,
  },
  {
    name: 'Malavika Nair',
    username: 'malavika_nair',
    location: 'Kochi, Kerala, India',
    role: 'Tech Writer & Soundscape Curator',
    avatar: '🌴',
    mood: '💖 Love',
    skills: ['Malayalam & English Writing', 'Indie Folk', 'Poetry'],
    isOnline: true,
  },
  {
    name: 'Zack Miller',
    username: 'zack_midnight',
    location: 'Berlin, Germany',
    role: 'Cinematographer & Night Driver',
    avatar: '🌧️',
    mood: '🌙 Custom',
    skills: ['Color Grading', 'Dark Synthwave', 'Filmmaking'],
    isOnline: true,
  },
  {
    name: 'Tariq Al-Mansoor',
    username: 'tariq_sound',
    location: 'Dubai, UAE',
    role: 'Sound Architect & Studio Lead',
    avatar: '🪐',
    mood: '✨ Creative',
    skills: ['Acoustic Engineering', 'Arabic Oud', 'Event Production'],
    isOnline: true,
  },
];

const INITIAL_DISCUSSIONS: CommunityDiscussion[] = [
  {
    id: 'd1',
    authorName: 'Malavika Nair',
    authorUsername: 'malavika_nair',
    authorAvatar: '🌴',
    location: 'Kochi, Kerala',
    tag: 'Soundscapes',
    content:
      'Anyone else find that monsoon rain sounds with acoustic guitars hit differently late at night? Setting up a collaborative playlist for anyone working odd hours worldwide.',
    timeAgo: '1h ago',
    likes: 24,
    commentsCount: 9,
  },
  {
    id: 'd2',
    authorName: 'Kai Vance',
    authorUsername: 'kai_rage808',
    authorAvatar: '⚡',
    location: 'Tokyo, Japan',
    tag: 'Gaming & Beats',
    content:
      'Looking for developers and sound designers in Tokyo or remote who want to build high-octane indie games. Drop your handle or reach out if you mix 808s or code in Rust/TS.',
    timeAgo: '3h ago',
    likes: 31,
    commentsCount: 14,
  },
  {
    id: 'd3',
    authorName: 'Maya Lin',
    authorUsername: 'maya_sunset',
    authorAvatar: '🌸',
    location: 'New York, USA',
    tag: 'Work & Places',
    content:
      'Just posted a new opening for Web Audio & Frontend engineering at our lab! If you love audio synthesis and fluid glassmorphism, check the Jobs tab and DM me.',
    timeAgo: '4h ago',
    likes: 19,
    commentsCount: 6,
  },
];

export const CommunityModal: React.FC<CommunityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onOpenChatWithUser,
}) => {
  const [activeTab, setActiveTab] = useState<CommunityTab>('jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_JOBS);
  const [places, setPlaces] = useState<PlaceRecommendation[]>(INITIAL_PLACES);
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>(INITIAL_DISCUSSIONS);

  // New post state
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('');
  const [newJobDesc, setNewJobDesc] = useState('');

  const [newPostContent, setNewPostContent] = useState('');

  if (!isOpen) return null;

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim() || !newJobCompany.trim()) return;

    const posting: JobPosting = {
      id: `job_${Date.now()}`,
      title: newJobTitle.trim(),
      company: newJobCompany.trim(),
      location: newJobLocation.trim() || 'Remote',
      type: 'Full-time / Gig',
      tags: ['Community Post', 'Worldwide'],
      postedBy: {
        name: currentUser?.name || 'Community Member',
        username: currentUser?.username || 'member',
        avatar: currentUser?.avatar || '💼',
      },
      description: newJobDesc.trim() || 'Opportunities shared directly with community members.',
      timeAgo: 'Just now',
    };

    setJobs((prev) => [posting, ...prev]);
    setNewJobTitle('');
    setNewJobCompany('');
    setNewJobLocation('');
    setNewJobDesc('');
    setShowNewJobModal(false);
  };

  const handleCreateDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newDisc: CommunityDiscussion = {
      id: `disc_${Date.now()}`,
      authorName: currentUser?.name || 'Community Member',
      authorUsername: currentUser?.username || 'member',
      authorAvatar: currentUser?.avatar || '✨',
      location: 'Global Hub',
      tag: 'General',
      content: newPostContent.trim(),
      timeAgo: 'Just now',
      likes: 1,
      commentsCount: 0,
    };

    setDiscussions((prev) => [newDisc, ...prev]);
    setNewPostContent('');
  };

  // Filter jobs by search
  const filteredJobs = jobs.filter((j) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      j.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Filter people by search & region
  const filteredPeople = INITIAL_PEOPLE.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.skills.some((s) => s.toLowerCase().includes(q));

    const matchRegion =
      selectedRegion === 'All' ||
      (selectedRegion === 'Asia' && (p.location.includes('Japan') || p.location.includes('India'))) ||
      (selectedRegion === 'Europe' && (p.location.includes('UK') || p.location.includes('Germany'))) ||
      (selectedRegion === 'Americas' && p.location.includes('USA')) ||
      (selectedRegion === 'Middle East' && p.location.includes('UAE'));

    return matchQuery && matchRegion;
  });

  // Filter places by search
  const filteredPlaces = places.filter((pl) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      pl.name.toLowerCase().includes(q) ||
      pl.city.toLowerCase().includes(q) ||
      pl.country.toLowerCase().includes(q) ||
      pl.category.toLowerCase().includes(q) ||
      pl.vibe.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[840px] bg-zinc-950/95 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header with Back Arrow on Left */}
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

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                  <span>Community</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                    Global Network
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Connect across cities • Jobs, people & places worldwide
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="px-5 py-2.5 border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'jobs'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white bg-zinc-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Jobs & Gigs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('people')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'people'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white bg-zinc-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Find People</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('places')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'places'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white bg-zinc-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Places & Cafes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('discussions')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'discussions'
                  ? 'bg-zinc-700 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white bg-zinc-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discussions</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 pl-8 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: Jobs & Opportunities */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Global Jobs & Openings</h4>
                  <p className="text-xs text-zinc-400">
                    Find engineering, design, audio, and creative roles in different regions
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (currentUser) {
                      setShowNewJobModal(true);
                    } else {
                      onOpenAuth();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post Job / Gig</span>
                </button>
              </div>

              {/* Job Posting Form Modal */}
              {showNewJobModal && (
                <form
                  onSubmit={handlePostJob}
                  className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700 space-y-3 shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-white">Post an Opportunity</span>
                    <button
                      type="button"
                      onClick={() => setShowNewJobModal(false)}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Role Title (e.g. Senior Frontend Developer)"
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Company or Studio Name"
                      value={newJobCompany}
                      onChange={(e) => setNewJobCompany(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Location (e.g. Remote / Tokyo / Kochi / London)"
                    value={newJobLocation}
                    onChange={(e) => setNewJobLocation(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />

                  <textarea
                    rows={2}
                    placeholder="Brief description of the role or freelance project..."
                    value={newJobDesc}
                    onChange={(e) => setNewJobDesc(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow"
                  >
                    Publish to Community
                  </button>
                </form>
              )}

              {/* Jobs List */}
              <div className="grid grid-cols-1 gap-3">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="font-bold text-sm text-white">{job.title}</h5>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                          {job.type}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-medium">
                        <span className="text-zinc-200">{job.company}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-zinc-300">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {job.location}
                        </span>
                        <span>•</span>
                        <span className="text-zinc-500">{job.timeAgo}</span>
                      </div>

                      <p className="text-xs text-zinc-300">{job.description}</p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenChatWithUser(job.postedBy.username);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer transition-colors shadow"
                        title="Chat directly with the poster"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Connect</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Finding People */}
          {activeTab === 'people' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Find People Across Regions</h4>
                  <p className="text-xs text-zinc-400">
                    Connect with developers, designers, musicians, and creators in different cities
                  </p>
                </div>

                {/* Region Filter */}
                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs">
                  {['All', 'Asia', 'Europe', 'Americas', 'Middle East'].map((reg) => (
                    <button
                      key={reg}
                      type="button"
                      onClick={() => setSelectedRegion(reg)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        selectedRegion === reg
                          ? 'bg-zinc-800 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>
              </div>

              {/* People Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPeople.map((person) => (
                  <div
                    key={person.username}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl border border-zinc-700">
                          {person.avatar}
                        </div>
                        {person.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-sm text-white truncate">{person.name}</h5>
                        <p className="text-xs text-pink-400 font-mono">@{person.username}</p>
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{person.location}</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs text-zinc-300 font-medium">{person.role}</p>
                      <div className="flex flex-wrap gap-1">
                        {person.skills.map((sk) => (
                          <span
                            key={sk}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400">{person.mood}</span>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenChatWithUser(person.username);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-xs font-bold text-white flex items-center gap-1 cursor-pointer transition-all shadow"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Places & Cafes */}
          {activeTab === 'places' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Recommended Places & Spots</h4>
                <p className="text-xs text-zinc-400">
                  Vinyl listening cafes, co-working studios, and scenic hangouts across the globe
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPlaces.map((place) => (
                  <div
                    key={place.id}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-sm text-white flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>{place.name}</span>
                        </h5>
                        <p className="text-xs text-zinc-400 font-medium">
                          {place.city}, {place.country}
                        </p>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-mono shrink-0">
                        {place.category}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs text-zinc-300">
                      <p className="font-semibold text-amber-200/90 text-[11px] mb-0.5">Vibe:</p>
                      <p>{place.vibe}</p>
                    </div>

                    <p className="text-xs text-zinc-400 italic">"{place.notes}"</p>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                      <span>Shared by {place.recommendedBy}</span>
                      <span className="flex items-center gap-1 text-pink-400">
                        <Heart className="w-3 h-3 fill-current" />
                        {place.likes}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Community Discussions Feed */}
          {activeTab === 'discussions' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Community Discussions</h4>
                <p className="text-xs text-zinc-400">
                  Share ideas, ask questions, and collaborate with members worldwide
                </p>
              </div>

              {/* New Post Input */}
              <form
                onSubmit={handleCreateDiscussion}
                className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5"
              >
                <textarea
                  rows={2}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share a thought, collaboration call, or question with the community..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newPostContent.trim()}
                    className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-xs font-bold text-white cursor-pointer shadow transition-all flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post</span>
                  </button>
                </div>
              </form>

              {/* Feed Stream */}
              <div className="space-y-3">
                {discussions.map((disc) => (
                  <div
                    key={disc.id}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-base border border-zinc-700">
                          {disc.authorAvatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-bold text-xs text-white">{disc.authorName}</h5>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              @{disc.authorUsername}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400">{disc.location}</span>
                        </div>
                      </div>

                      <span className="text-[10px] text-zinc-500">{disc.timeAgo}</span>
                    </div>

                    <p className="text-xs text-zinc-200 leading-relaxed">{disc.content}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-xs text-zinc-400">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenChatWithUser(disc.authorUsername);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Message {disc.authorName.split(' ')[0]}</span>
                      </button>

                      <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                        <Heart className="w-3 h-3 text-pink-400 fill-current" />
                        {disc.likes} likes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
