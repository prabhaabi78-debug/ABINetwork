import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/AdminLayout';
import { Tv, Users, CreditCard, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

interface Stats {
  totalChannels: number;
  activeChannels: number;
  totalCustomers: number;
  activeCustomers: number;
  activeSubscriptions: number;
  expiringSoon: number;
  expiredSubscriptions: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [
        channelsRes,
        profilesRes,
        subsRes,
        paymentsRes,
      ] = await Promise.all([
        supabase.from('channels').select('id, is_active'),
        supabase.from('profiles').select('id, status, role').eq('role', 'customer'),
        supabase.from('subscriptions').select('id, status, expiry_date'),
        supabase.from('payments').select('amount'),
      ]);

      const channels = channelsRes.data || [];
      const customers = profilesRes.data || [];
      const subscriptions = subsRes.data || [];
      const payments = paymentsRes.data || [];

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      setStats({
        totalChannels: channels.length,
        activeChannels: channels.filter(c => c.is_active).length,
        totalCustomers: customers.length,
        activeCustomers: customers.filter(c => c.status === 'active').length,
        activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
        expiringSoon: subscriptions.filter(s => {
          const exp = new Date(s.expiry_date);
          return s.status === 'active' && exp <= thirtyDaysFromNow && exp > now;
        }).length,
        expiredSubscriptions: subscriptions.filter(s => s.status === 'expired').length,
        totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
    setLoading(false);
  }

  const statCards = stats ? [
    { label: 'Total Channels', value: stats.totalChannels, sub: `${stats.activeChannels} active`, icon: Tv, color: 'blue' },
    { label: 'Customers', value: stats.totalCustomers, sub: `${stats.activeCustomers} active`, icon: Users, color: 'green' },
    { label: 'Active Subscriptions', value: stats.activeSubscriptions, sub: `${stats.expiringSoon} expiring soon`, icon: CreditCard, color: 'purple' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, sub: `${stats.expiredSubscriptions} expired`, icon: TrendingUp, color: 'amber' },
  ] : [];

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400',
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">ABI NETWORK overview and key metrics</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[#0f1425] border border-gray-800 rounded-xl p-6 animate-pulse">
              <div className="w-10 h-10 bg-gray-700 rounded-lg mb-4" />
              <div className="w-20 h-6 bg-gray-700 rounded mb-2" />
              <div className="w-32 h-4 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <div
                key={card.label}
                className={`bg-gradient-to-br ${colorMap[card.color]} border rounded-xl p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <card.icon className="w-6 h-6" />
                  <Activity className="w-4 h-4 opacity-50" />
                </div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-sm opacity-70 mt-1">{card.sub}</p>
                <p className="text-xs opacity-50 mt-2">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="bg-[#0f1425] border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href="/admin/channels"
                className="flex items-center gap-3 p-4 bg-[#1a1f35] border border-gray-700 rounded-lg hover:border-blue-500/50 transition-colors"
              >
                <Tv className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">Manage Channels</p>
                  <p className="text-xs text-gray-400">Add, edit, or import channels</p>
                </div>
              </a>
              <a
                href="/admin/customers"
                className="flex items-center gap-3 p-4 bg-[#1a1f35] border border-gray-700 rounded-lg hover:border-green-500/50 transition-colors"
              >
                <Users className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-white">Manage Customers</p>
                  <p className="text-xs text-gray-400">Activate or suspend accounts</p>
                </div>
              </a>
              <a
                href="/admin/subscriptions"
                className="flex items-center gap-3 p-4 bg-[#1a1f35] border border-gray-700 rounded-lg hover:border-purple-500/50 transition-colors"
              >
                <CreditCard className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Subscriptions</p>
                  <p className="text-xs text-gray-400">Track payments and expiry dates</p>
                </div>
              </a>
            </div>
          </div>

          {/* Supabase connection notice */}
          <div className="mt-6 flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-200 font-medium">Connect Supabase to see live data</p>
              <p className="text-xs text-yellow-400/70 mt-1">
                Replace the placeholder credentials in <code className="bg-yellow-500/10 px-1 rounded">src/lib/supabase.ts</code> with
                your Supabase project URL and anon key. Run the SQL schema from <code className="bg-yellow-500/10 px-1 rounded">supabase/schema.sql</code> to
                set up the database.
              </p>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
