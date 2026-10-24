import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Channel } from '../../lib/supabase';
import VideoPlayer from '../../components/VideoPlayer';
import {
  ChevronLeft,
  Tv,
  List,
  X,
} from 'lucide-react';

export default function PlayerPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    fetchAllChannels();
  }, []);

  useEffect(() => {
    if (channelId && channels.length > 0) {
      const found = channels.find(c => c.id === channelId);
      if (found) setChannel(found);
    }
  }, [channelId, channels]);

  async function fetchAllChannels() {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (!error && data) setChannels(data as Channel[]);
    setLoading(false);
  }

  const handleChannelChange = (newChannel: Channel) => {
    setChannel(newChannel);
    navigate(`/tv/play/${newChannel.id}`, { replace: true });
    setShowSidebar(false);
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading channel...</p>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Channel Not Found</h2>
          <button
            onClick={() => navigate('/tv')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Back to Channels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black flex flex-col">
      {/* Player area */}
      <div className="flex-1 relative">
        <VideoPlayer
          channel={channel}
          channels={channels}
          onChannelChange={handleChannelChange}
          onClose={() => navigate('/tv')}
        />
      </div>

      {/* Channel sidebar toggle (mobile) */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg lg:hidden"
      >
        {showSidebar ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
      </button>

      {/* Channel sidebar */}
      {showSidebar && (
        <div className="fixed inset-y-0 right-0 z-40 w-72 bg-[#0a0e1a] border-l border-gray-800 overflow-y-auto lg:hidden">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Channels</h2>
            <button onClick={() => setShowSidebar(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-2">
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => handleChannelChange(ch)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  ch.id === channel.id
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="w-10 h-10 bg-[#1a1f35] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {ch.logo_url ? (
                    <img src={ch.logo_url} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-gray-500">{ch.name.charAt(0)}</span>
                  )}
                </div>
                <div className="text-left min-w-0">
                  <p className={`text-sm font-medium truncate ${ch.id === channel.id ? 'text-blue-400' : 'text-white'}`}>
                    {ch.name}
                  </p>
                  <p className="text-xs text-gray-500">{ch.category}</p>
                </div>
                {ch.id === channel.id && (
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs text-red-400">LIVE</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
