import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { MOCK_CHANNELS, MOCK_CUSTOMERS, MOCK_SUBSCRIPTIONS, MOCK_PAYMENTS } from '../lib/mockData';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'admin' | 'customer';
  status: 'active' | 'suspended' | 'deactivated';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  isAdmin: boolean;
  canAccess: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo admin account
const DEMO_ADMIN: Profile = {
  id: 'admin-1',
  email: 'prabhaabi78@gmail.com',
  full_name: 'Prabha',
  phone: null,
  role: 'admin',
  status: 'active',
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const saved = localStorage.getItem('abi_network_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user);
        setProfile(parsed.profile);
      } catch {}
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    // Demo login - accepts any password with 6+ chars
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }

    // Admin login
    if (email === 'prabhaabi78@gmail.com') {
      const demoUser = { id: 'admin-1', email } as User;
      setUser(demoUser);
      setProfile(DEMO_ADMIN);
      setSession({ user: demoUser } as Session);
      localStorage.setItem('abi_network_session', JSON.stringify({ user: demoUser, profile: DEMO_ADMIN }));
      return { error: null };
    }

    // Customer login (demo)
    const customer = MOCK_CUSTOMERS.find(c => c.email === email);
    if (customer) {
      if (customer.status !== 'active') {
        return { error: `Account is ${customer.status}` };
      }
      const demoUser = { id: customer.id, email } as User;
      setUser(demoUser);
      setProfile(customer);
      setSession({ user: demoUser } as Session);
      localStorage.setItem('abi_network_session', JSON.stringify({ user: demoUser, profile: customer }));
      return { error: null };
    }

    return { error: 'Invalid email or password. Try prabhaabi78@gmail.com' };
  }

  async function logout() {
    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.removeItem('abi_network_session');
  }

  async function resetPassword(email: string) {
    // Demo: just show success
    console.log('Password reset requested for:', email);
    return { error: null };
  }

  const isAdmin = profile?.role === 'admin';
  const canAccess = profile?.status === 'active';

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, login, logout, resetPassword, isAdmin, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
