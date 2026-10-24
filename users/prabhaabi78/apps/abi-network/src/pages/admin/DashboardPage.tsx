import { useState } from 'react';
import { MOCK_CHANNELS, MOCK_CUSTOMERS, MOCK_SUBSCRIPTIONS, MOCK_PAYMENTS } from '../../lib/mockData';
import AdminLayout from '../../components/AdminLayout';
import { Tv, Users, CreditCard, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const stats = {
    totalChannels: MOCK_CHANNELS.length,
    activeChannels: MOCK_CHANNELS.filter(c => c.is_active).length,
    totalCustomers: MOCK_CUSTOMERS.length,
    activeCustomers: MOCK_CUSTOMERS.filter(c => c.status === 'active').length,
    activeSubscriptions: MOCK_SUBSCRIPTIONS.filter(s => s.status === 'active').length,
    expiringSoon: 0,
    expiredSubscriptions: MOCK_SUBSCRIPTIONS.filter(s => s.status === 'expired').length,
    totalRevenue: MOCK_PAYMENTS.reduce((sum, p) => sum + p.amount, 0),
  };

  const statCards = [
    { label: 'Total Channels', value: stats.totalChannels, sub: `${stats.activeChannels} active`, icon: Tv, color: 'blue' },
    { label: 'Customers', value: stats.totalCustomers, sub: `${stats.activeCustomers} active`, icon: Users, color: 'green' },
    { label: 'Active Subscriptions', value: stats.activeSubscriptions, sub: `${stats.expiringSoon} expiring soon`, icon: CreditCard, color: 'purple' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, sub: `${stats.expiredSubscriptions} expired`, icon: TrendingUp, color: 'amber' },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className={`bg-gradient-to-br ${colorMap[card.color]} border rounded-xl p-6`}>
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

      <div className="bg-[#0f1425] border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="/admin/channels" className="flex items-center gap-3 p-4 bg-[#1a1f35] border border-gray-700 rounded-lg hover:border-blue-500/50 transition-colors">
            <Tv className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-white">Manage Channels</p>
              <p className="text-xs text-gray-400">Add, edit, or import channels</p>
            </div>
          </a>
          <a href="/admin/customers" className="flex items-center gap-3 p-4 bg-[#1a1f35] border border-gray-700 rounded-lg hover:border-green-500/50 transition-colors">
            <Users className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-white">Manage Customers</p>
              <p className="text-xs text-gray-400">Activate or suspend accounts</p>
            </div>
          </a>
          <a href="/admin/subscriptions" className="flex items-center gap-3 p-4 bg-[#1a1f35] border border-gray-700 rounded-lg hover:border-purple-500/50 transition-colors">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-sm font-medium text-white">Subscriptions</p>
              <p className="text-xs text-gray-400">Track payments and expiry dates</p>
            </div>
          </a>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-200 font-medium">Demo Mode Active</p>
          <p className="text-xs text-blue-400/70 mt-1">
            This is showing mock data. Connect Supabase to manage real channels, customers, and subscriptions.
            See <code className="bg-blue-500/10 px-1 rounded">SETUP.md</code> for instructions.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}