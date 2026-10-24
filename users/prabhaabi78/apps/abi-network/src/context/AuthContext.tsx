import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { MOCK_CUSTOMERS } from '../lib/mockData';
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    const saved = localStorage.getItem('abi_network_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.user && parsed.profile) {
          setUser(parsed.user);
          setProfile(parsed.profile);
        }
      } catch (e) {
        console.error('Failed to parse session:', e);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }

    if (email === 'prabhaabi78@gmail.com') {
      const demoUser = { id: 'admin-1', email } as User;
      setUser(demoUser);
      setProfile(DEMO_ADMIN);
      setSession({ user: demoUser } as Session);
      localStorage.setItem('abi_network_session', JSON.stringify({ user: { id: 'admin-1', email }, profile: DEMO_ADMIN }));
      return { error: null };
    }

    const customer = MOCK_CUSTOMERS.find(c => c.email === email);
    if (customer) {
      if (customer.status !== 'active') {
        return { error: `Account is ${customer.status}` };
      }
      const demoUser = { id: customer.id, email } as User;
      setUser(demoUser);
      setProfile(customer);
      setSession({ user: demoUser } as Session);
      localStorage.setItem('abi_network_session', JSON.stringify({ user: { id: customer.id, email }, profile: customer }));
      return { error: null };
    }

    return { error: 'Invalid email or password. Try prabhaabi78@gmail.com' };
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.removeItem('abi_network_session');
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    console.log('Password reset requested for:', email);
    return { error: null };
  }, []);

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
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
