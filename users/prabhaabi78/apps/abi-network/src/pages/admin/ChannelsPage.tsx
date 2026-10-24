import { useEffect, useState } from 'react';
import { supabase, Channel } from '../../lib/supabase';
import AdminLayout from '../../components/AdminLayout';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  Save,
  X,
  Tv,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const CATEGORIES = ['Entertainment', 'News', 'Movies', 'Music', 'Sports', 'Kids', 'Devotional', 'Comedy'];

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    logo_url: '',
    category: 'Entertainment',
    stream_url: '',
    is_active: true,
    sort_order: 0,
  });

  // M3U import state
  const [m3uText, setM3uText] = useState('');

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchChannels() {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) setChannels(data as Channel[]);
    setLoading(false);
  }

  function resetForm() {
    setForm({ name: '', logo_url: '', category: 'Entertainment', stream_url: '', is_active: true, sort_order: 0 });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(channel: Channel) {
    setForm({
      name: channel.name,
      logo_url: channel.logo_url || '',
      category: channel.category,
      stream_url: channel.stream_url,
      is_active: channel.is_active,
      sort_order: channel.sort_order,
    });
    setEditingId(channel.id);
    setShowForm(true);
  }

  async function saveChannel(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, sort_order: Number(form.sort_order) };

    if (editingId) {
      const { error } = await supabase.from('channels').update(payload).eq('id', editingId);
      if (error) { setToast({ type: 'error', message: error.message }); return; }
      setToast({ type: 'success', message: 'Channel updated' });
    } else {
      const { error } = await supabase.from('channels').insert(payload);
      if (error) { setToast({ type: 'error', message: error.message }); return; }
      setToast({ type: 'success', message: 'Channel added' });
    }
    resetForm();
    fetchChannels();
  }

  async function deleteChannel(id: string) {
    if (!confirm('Delete this channel?')) return;
    const { error } = await supabase.from('channels').delete().eq('id', id);
    if (error) { setToast({ type: 'error', message: error.message }); return; }
    setToast({ type: 'success', message: 'Channel deleted' });
    fetchChannels();
  }

  async function toggleActive(channel: Channel) {
    const { error } = await supabase
      .from('channels')
      .update({ is_active: !channel.is_active })
      .eq('id', channel.id);
    if (!error) fetchChannels();
  }

  function parseM3U(text: string) {
    const lines = text.split('\n');
    const parsed: { name: string; url: string; group: string; logo: string }[] = [];
    let currentInfo = { name: '', group: '', logo: '' };

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#EXTINF:')) {
        const nameMatch = trimmed.match(/,(.+)$/);
        const groupMatch = trimmed.match(/group-title="([^"]*)"/);
        const logoMatch = trimmed.match(/tvg-logo="([^"]*)"/);
        currentInfo = {
          name: nameMatch?.[1]?.trim() || 'Unknown',
          group: groupMatch?.[1] || 'Entertainment',
          logo: logoMatch?.[1] || '',
        };
      } else if (trimmed && !trimmed.startsWith('#')) {
        parsed.push({ ...currentInfo, url: trimmed });
        currentInfo = { name: '', group: '', logo: '' };
      }
    }
    return parsed;
  }

  async function importM3U() {
    const parsed = parseM3U(m3uText);
    if (parsed.length === 0) {
      setToast({ type: 'error', message: 'No channels found in M3U file' });
      return;
    }

    const insertData = parsed.map((ch, i) => ({
      name: ch.name,
      logo_url: ch.logo || null,
      category: CATEGORIES.includes(ch.group) ? ch.group : 'Entertainment',
      stream_url: ch.url,
      is_active: true,
      sort_order: channels.length + i,
    }));

    const { error } = await supabase.from('channels').insert(insertData);
    if (error) {
      setToast({ type: 'error', message: error.message });
      return;
    }
    setToast({ type: 'success', message: `Imported ${parsed.length} channels` });
    setM3uText('');
    setShowImport(false);
    fetchChannels();
  }

  const filtered = channels.filter(ch =>
    ch.name.toLowerCase().includes(search.toLowerCase()) ||
    ch.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Channels</h1>
          <p className="text-gray-400 mt-1">Manage your Tamil TV channel lineup</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowImport(true); setShowForm(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import M3U
          </button>
          <button
            onClick={() => { setShowForm(true); setShowImport(false); setEditingId(null); setForm({ name: '', logo_url: '', category: 'Entertainment', stream_url: '', is_active: true, sort_order: channels.length }); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Channel
          </button>
        </div>
      </div>

      {/* Channel form */}
      {showForm && (
        <div className="bg-[#0f1425] border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit Channel' : 'Add Channel'}</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={saveChannel} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Channel Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., Sun TV HD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Logo URL</label>
              <input
                type="url"
                value={form.logo_url}
                onChange={e => setForm({ ...form, logo_url: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Stream URL</label>
              <input
                type="url"
                value={form.stream_url}
                onChange={e => setForm({ ...form, stream_url: e.target.value })}
                required
                className="w-full px-3 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="https://your-stream-url.m3u8"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 bg-[#1a1f35] text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm text-gray-300">Active</label>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Add Channel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* M3U Import */}
      {showImport && (
        <div className="bg-[#0f1425] border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Import M3U Playlist</h2>
            <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Paste your M3U playlist content below. Channels will be imported with their names, logos, groups, and stream URLs.
          </p>
          <textarea
            value={m3uText}
            onChange={e => setM3uText(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500 mb-4"
            placeholder={`#EXTM3U
#EXTINF:-1 tvg-logo="https://example.com/suntv.png" group-title="Entertainment",Sun TV HD
http://stream-url/suntv.m3u8
#EXTINF:-1 tvg-logo="https://example.com/zee.png" group-title="Entertainment",Zee Tamil HD
http://stream-url/zeetamil.m3u8`}
          />
          <div className="flex justify-end">
            <button
              onClick={importM3U}
              disabled={!m3uText.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              Import Channels
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search channels..."
          className="w-full pl-11 pr-4 py-2.5 bg-[#0f1425] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Channel list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#0f1425] border border-gray-800 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg" />
                <div className="flex-1">
                  <div className="w-32 h-4 bg-gray-700 rounded mb-2" />
                  <div className="w-20 h-3 bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Tv className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No channels found</p>
          <p className="text-gray-500 text-sm mt-1">Add channels or import an M3U playlist to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(channel => (
            <div
              key={channel.id}
              className="bg-[#0f1425] border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors"
            >
              {/* Logo */}
              <div className="w-12 h-12 bg-[#1a1f35] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {channel.logo_url ? (
                  <img src={channel.logo_url} alt="" className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <span className="text-lg font-bold text-gray-500">{channel.name.charAt(0)}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white truncate">{channel.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${channel.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {channel.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{channel.category} • Order: {channel.sort_order}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleActive(channel)}
                  className={`p-2 rounded-lg transition-colors ${channel.is_active ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:bg-gray-500/10'}`}
                  title={channel.is_active ? 'Deactivate' : 'Activate'}
                >
                  <div className={`w-2 h-2 rounded-full ${channel.is_active ? 'bg-green-400' : 'bg-gray-500'}`} />
                </button>
                <button
                  onClick={() => startEdit(channel)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteChannel(channel.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
