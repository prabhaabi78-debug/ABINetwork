import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Channel } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import ChannelCard from '../../components/ChannelCard';
import {
  Radio,
  Search,
  LogOut,
  Tv,
  Filter,
} from 'lucide-react';

export default function ViewerHomePage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchChannels();
  }, []);

  async function fetchChannels() {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (!error && data) setChannels(data as Channel[]);
    setLoading(false);
  }

  const categories = ['All', ...Array.from(new Set(channels.map(c => c.category)))];

  const filtered = channels.filter(ch => {
    const matchesSearch = ch.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ch.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0e1a]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white leading-tight">ABI NETWORK</h1>
              <p className="text-xs text-gray-400 leading-tight">Live Channels</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search channels..."
                className="w-full pl-10 pr-4 py-2 bg-[#1a1f35] border border-gray-800 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm text-gray-400 hidden md:block">
              Hi, {profile?.full_name?.split(' ')[0] || 'Viewer'}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Category filter */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-[#1a1f35] text-gray-400 border border-gray-800 hover:text-white hover:border-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Channel grid */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-[#1a1f35] border border-gray-800 rounded-xl animate-pulse">
                <div className="aspect-video bg-gray-800 rounded-t-xl" />
                <div className="p-3">
                  <div className="w-20 h-3 bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Channels Available</h2>
            <p className="text-gray-400">
              {search ? 'No channels match your search.' : 'Channels will appear here once the admin adds them.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">{filtered.length} channel{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filtered.map(channel => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onClick={() => navigate(`/tv/play/${channel.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
