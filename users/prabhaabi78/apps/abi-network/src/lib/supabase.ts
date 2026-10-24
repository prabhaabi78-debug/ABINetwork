import { createClient } from '@supabase/supabase-js';

// ============================================================
// ABI NETWORK — Supabase Configuration
// ============================================================
// Replace these with your actual Supabase project credentials
// from Settings → API in your Supabase dashboard.
// ============================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-real-project-id.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-real-key...';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Type helpers for our schema
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'admin' | 'customer';
  status: 'active' | 'suspended' | 'deactivated';
  created_at: string;
}

export interface Channel {
  id: string;
  name: string;
  logo_url: string | null;
  category: string;
  stream_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  customer_id: string;
  plan_name: string;
  start_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'cancelled';
  payment_id: string | null;
  created_at: string;
  profiles?: Profile;
}

export interface Payment {
  id: string;
  customer_id: string;
  amount: number;
  method: string;
  reference: string | null;
  paid_at: string;
  notes: string | null;
  created_at: string;
  profiles?: Profile;
}
