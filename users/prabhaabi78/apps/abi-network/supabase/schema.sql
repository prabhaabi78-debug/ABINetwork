-- ============================================================
-- ABI NETWORK — Tamil IPTV Platform
-- Supabase Database Schema
-- ============================================================
-- Run this in your Supabase SQL Editor to set up the database.
-- It creates tables, enables RLS, creates policies, and seeds
-- sample data for testing.
-- ============================================================

-- 1. PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  phone text,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  status text not null default 'active' check (status in ('active', 'suspended', 'deactivated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. CHANNELS TABLE
-- ============================================================
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  category text not null default 'Entertainment',
  stream_url text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. SUBSCRIPTIONS TABLE
-- ============================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete cascade not null,
  plan_name text not null default 'Monthly',
  start_date date not null,
  expiry_date date not null,
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  payment_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. PAYMENTS TABLE
-- ============================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric not null default 0,
  method text not null default 'UPI',
  reference text,
  paid_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

-- Link payment to subscription
alter table public.subscriptions
  add constraint fk_payment
  foreign key (payment_id) references public.payments(id)
  on delete set null;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.channels enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$ language sql security definer;

-- PROFILES policies
-- Admins: full access
-- Customers: read own profile only
create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Customers can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Customers can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- CHANNELS policies
-- Admins: full access
-- Customers: read active channels only
create policy "Admins can manage all channels"
  on public.channels for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Customers can read active channels"
  on public.channels for select
  using (is_active = true);

-- SUBSCRIPTIONS policies
-- Admins: full access
-- Customers: read own subscriptions only
create policy "Admins can manage all subscriptions"
  on public.subscriptions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Customers can read own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = customer_id);

-- PAYMENTS policies
-- Admins: full access
-- Customers: read own payments only
create policy "Admins can manage all payments"
  on public.payments for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Customers can read own payments"
  on public.payments for select
  using (auth.uid() = customer_id);

-- ============================================================
-- INDEXES (for performance)
-- ============================================================
create index if not exists idx_channels_active on public.channels(is_active);
create index if not exists idx_channels_sort on public.channels(sort_order);
create index if not exists idx_subscriptions_customer on public.subscriptions(customer_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_subscriptions_expiry on public.subscriptions(expiry_date);
create index if not exists idx_payments_customer on public.payments(customer_id);

-- ============================================================
-- SEED DATA (sample channels for testing)
-- ============================================================
-- These use placeholder stream URLs. Replace with your actual
-- authorized stream links from VLC.
-- ============================================================

insert into public.channels (name, logo_url, category, stream_url, is_active, sort_order) values
  ('Sun TV HD', NULL, 'Entertainment', 'https://example.com/streams/suntv_hd.m3u8', true, 1),
  ('Zee Tamil HD', NULL, 'Entertainment', 'https://example.com/streams/zeetamil_hd.m3u8', true, 2),
  ('Vijay TV HD', NULL, 'Entertainment', 'https://example.com/streams/vijaytv_hd.m3u8', true, 3),
  ('Jaya TV HD', NULL, 'Entertainment', 'https://example.com/streams/jayatv_hd.m3u8', true, 4),
  ('Polimer TV', NULL, 'Entertainment', 'https://example.com/streams/polimertv.m3u8', true, 5),
  ('Thanthi TV', NULL, 'News', 'https://example.com/streams/thanthitv.m3u8', true, 6),
  ('Puthiya Thalaimurai', NULL, 'News', 'https://example.com/streams/puthiyathalaimurai.m3u8', true, 7),
  ('Seithigal TV', NULL, 'News', 'https://example.com/streams/seithigaltv.m3u8', true, 8),
  ('Raj TV', NULL, 'Movies', 'https://example.com/streams/rajtv.m3u8', true, 9),
  ('KTV', NULL, 'Movies', 'https://example.com/streams/ktv.m3u8', true, 10),
  ('Sun Music HD', NULL, 'Music', 'https://example.com/streams/sunmusic_hd.m3u8', true, 11),
  ('Isaiaruvi', NULL, 'Music', 'https://example.com/streams/isaiaruvi.m3u8', true, 12),
  ('Chutti TV', NULL, 'Kids', 'https://example.com/streams/chuttitv.m3u8', true, 13),
  ('Sri Sankara', NULL, 'Devotional', 'https://example.com/streams/srisankara.m3u8', true, 14),
  ('Makkal TV', NULL, 'Entertainment', 'https://example.com/streams/makkaltv.m3u8', true, 15),
  ('Captain TV', NULL, 'Entertainment', 'https://example.com/streams/captaintv.m3u8', true, 16)
on conflict do nothing;

-- ============================================================
-- CREATE FIRST ADMIN USER
-- ============================================================
-- After running this schema, create your admin user in the
-- Supabase Dashboard → Authentication → Users.
-- Then run this to set the role:
--
-- update public.profiles
-- set role = 'admin', status = 'active'
-- where email = 'your-admin-email@example.com';
--
-- Or use the Supabase Dashboard SQL editor with the user's UUID.
-- ============================================================
