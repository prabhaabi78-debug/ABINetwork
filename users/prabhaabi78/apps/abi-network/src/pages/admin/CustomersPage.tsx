import { useEffect, useState } from 'react';
import { supabase, Profile } from '../../lib/supabase';
import AdminLayout from '../../components/AdminLayout';
import {
  Search,
  UserPlus,
  Edit2,
  Shield,
  ShieldOff,
  UserX,
  Save,
  X,
  Users,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

type CustomerStatus = 'active' | 'suspended' | 'deactivated';

interface CustomerWithSub extends Profile {
  subscription?: {
    id: string;
    plan_name: string;
    expiry_date: string;
    status: string;
  } | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'customer' as const,
    status: 'active' as CustomerStatus,
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchCustomers() {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*, subscriptions(id, plan_name, expiry_date, status)')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (!error && profiles) {
      setCustomers(profiles.map((p: any) => ({
        ...p,
        subscription: p.subscriptions?.[0] || null,
      })));
    }
    setLoading(false);
  }

  function resetForm() {
    setForm({ email: '', password: '', full_name: '', phone: '', role: 'customer', status: 'active' });
    setEditingId(null);
    setShowForm(false);
  }

  async function createCustomer(e: React.FormEvent) {
    e.preventDefault();

    // Create auth user via Supabase admin would require edge function
    // For now, we insert the profile directly (the SQL schema handles this)
    const { error } = await supabase.from('profiles').insert({
      email: form.email,
      full_name: form.full_name,
      phone: form.phone || null,
      role: form.role,
      status: form.status,
    });

    if (error) {
      setToast({ type: 'error', message: error.message });
      return;
    }
    setToast({ type: 'success', message: 'Customer created. They should set their password via reset.' });
    resetForm();
    fetchCustomers();
  }

  async function updateStatus(id: string, status: CustomerStatus) {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
    if (error) { setToast({ type: 'error', message: error.message }); return; }
    setToast({ type: 'success', message: `Customer ${status}` });
    fetchCustomers();
  }

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    suspended: 'bg-yellow-500/20 text-yellow-400',
    deactivated: 'bg-red-500/20 text-red-400',
  };

  return (
    <AdminLayout>
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
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-gray-400 mt-1">Manage customer accounts and access</p>
        </div>
        <button
          onClick={() => { setShowForm(true); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-[#0f1425] border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Add Customer</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={createCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required
                className="w-full px-3 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500" placeholder="Customer name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                className="w-full px-3 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500" placeholder="customer@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Initial Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as CustomerStatus })}
                className="w-full px-3 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                <Save className="w-4 h-4" /> Create Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
          className="w-full pl-11 pr-4 py-2.5 bg-[#0f1425] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
      </div>

      {/* Customer list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#0f1425] border border-gray-800 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="w-32 h-4 bg-gray-700 rounded mb-2" />
                  <div className="w-48 h-3 bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No customers found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(customer => (
            <div key={customer.id} className="bg-[#0f1425] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 font-semibold">{customer.full_name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-white">{customer.full_name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${statusColor[customer.status]}`}>{customer.status}</span>
                  {customer.subscription && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      customer.subscription.status === 'active' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {customer.subscription.plan_name} • Exp: {new Date(customer.subscription.expiry_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{customer.email} {customer.phone ? `• ${customer.phone}` : ''}</p>
              </div>
              <div className="flex items-center gap-1">
                {customer.status !== 'active' && (
                  <button onClick={() => updateStatus(customer.id, 'active')} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors" title="Activate">
                    <Shield className="w-4 h-4" />
                  </button>
                )}
                {customer.status !== 'suspended' && (
                  <button onClick={() => updateStatus(customer.id, 'suspended')} className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors" title="Suspend">
                    <ShieldOff className="w-4 h-4" />
                  </button>
                )}
                {customer.status !== 'deactivated' && (
                  <button onClick={() => updateStatus(customer.id, 'deactivated')} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Deactivate">
                    <UserX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
