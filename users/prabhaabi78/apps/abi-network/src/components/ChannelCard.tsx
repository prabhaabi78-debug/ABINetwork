import { Channel } from '../lib/supabase';
import { Play } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
  onClick: () => void;
}

export default function ChannelCard({ channel, onClick }: ChannelCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-[#1a1f35] border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 hover:bg-[#1e2440] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0a0e1a]"
      tabIndex={0}
    >
      {/* Channel logo / thumbnail area */}
      <div className="aspect-video bg-gradient-to-br from-[#1a1f35] to-[#0f1425] flex items-center justify-center relative overflow-hidden">
        {channel.logo_url ? (
          <img
            src={channel.logo_url}
            alt={channel.name}
            className="w-20 h-20 object-contain p-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`${channel.logo_url ? 'hidden' : ''} flex flex-col items-center`}>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {channel.name.charAt(0)}
            </span>
          </div>
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 bg-black/60 text-xs text-gray-300 rounded-full">
            {channel.category}
          </span>
        </div>

        {/* Live indicator */}
        {channel.is_active && (
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-400 font-medium">LIVE</span>
          </div>
        )}
      </div>

      {/* Channel name */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white truncate">{channel.name}</h3>
      </div>
    </button>
  );
}
