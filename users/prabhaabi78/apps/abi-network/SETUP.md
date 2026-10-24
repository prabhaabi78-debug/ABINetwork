# ABI NETWORK — Setup & Deployment Guide

## Overview

ABI NETWORK is a Tamil IPTV platform with:
- **Customer-facing TV viewer** — channel guide + HLS live streaming
- **Admin dashboard** — channel management, customer accounts, subscriptions
- **Supabase backend** — authentication + PostgreSQL database + Row Level Security

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up / sign in
2. Click **New Project**
3. Set a project name (e.g., `abi-network`), choose a password, and select a region close to your users
4. Wait for the project to initialize (~2 minutes)

---

## Step 2: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql` from this project
4. Paste it into the SQL Editor and click **Run**
5. You should see "Success. No rows returned" — the tables, RLS policies, and seed data are now created

---

## Step 3: Create Your Admin Account

1. Go to **Authentication → Users** in Supabase
2. Click **Add User → Create New User**
3. Enter your email and a strong password
4. Click **Create User**
5. Go back to **SQL Editor** and run:

```sql
update public.profiles
set role = 'admin', status = 'active', full_name = 'Your Name'
where email = 'your-admin-email@example.com';
```

Replace with your actual admin email.

---

## Step 4: Connect the App to Supabase

1. In Supabase, go to **Settings → API**
2. Copy two values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
3. In this project, open `src/lib/supabase.ts`
4. Replace the placeholder values:

```typescript
const SUPABASE_URL = 'https://YOUR_ACTUAL_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...your-actual-anon-key...';
```

Or set environment variables (recommended for deployment):
- `VITE_SUPABASE_URL` — your project URL
- `VITE_SUPABASE_ANON_KEY` — your anon key

---

## Step 5: Add Your Channel Stream URLs

### Option A: Via Admin Dashboard
1. Log in to the app as admin
2. Go to **Channels** → edit each channel → paste your stream URL
3. Or click **Import M3U** and paste your VLC playlist

### Option B: Via SQL
Run in Supabase SQL Editor:

```sql
update public.channels
set stream_url = 'https://your-actual-stream-url.m3u8'
where name = 'Sun TV HD';
```

### Option C: M3U Import
1. Open your VLC playlist file (.m3u or .m3u8) in a text editor
2. Copy the entire contents
3. In the admin dashboard, click **Import M3U**
4. Paste the content and click **Import Channels**

---

## Step 6: Add Customers

### Via Admin Dashboard
1. Go to **Customers → Add Customer**
2. Enter the customer's name, email, phone
3. Set initial status to **Active**

### Then create their auth account
1. Go to Supabase → **Authentication → Users → Add User → Create New User**
2. Use the same email and set a temporary password
3. The customer can reset their password using the "Forgot password" link on the login page

### Create their subscription
1. Go to **Subscriptions → Add Subscription**
2. Select the customer, choose a plan, set start and expiry dates
3. Record the payment if needed

---

## Step 7: Deploy

### Option A: Mako Preview (for testing)
The app is already running in the Mako preview. Share the preview URL with testers.

### Option B: Netlify / Vercel (for production)
1. Push this project to a GitHub repository
2. Connect it to [Netlify](https://netlify.com) or [Vercel](https://vercel.com)
3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Build command: `pnpm build`
5. Output directory: `dist`

### Option C: Any static host
Run `pnpm build` and upload the `dist/` folder to any static hosting service.

---

## Step 8: Android TV Support

The app is designed for Android TV remote navigation:
- All interactive elements have `focus-visible` styles
- Arrow keys navigate the channel grid
- Channel Up/Down buttons switch channels in the player
- Full-screen playback with auto-hiding controls
- The video player uses HLS.js which works in Android WebView

To deploy on Android TV:
1. Use a WebView wrapper app (e.g., [TV-Browser](https://github.com/nicbell/TV-Browser) or build your own)
2. Point the WebView to your deployed URL
3. The app handles remote navigation automatically

---

## Architecture Notes

### Security
- **Row Level Security (RLS)** is enabled on all tables
- Admins have full access; customers can only see their own data
- Active channels are readable by all authenticated users
- Disabled/suspended accounts are blocked at the app level
- Expired subscriptions are blocked at the app level

### Stream Formats Supported
- **HLS (.m3u8)** — primary format, works via HLS.js in all modern browsers
- **Native HLS** — Safari and some Android TV browsers support it natively
- **Note:** RTMP, RTSP, and other non-HTTP formats are NOT supported in browsers

### Database Schema
| Table | Purpose |
|-------|---------|
| `profiles` | User accounts (extends Supabase auth) |
| `channels` | TV channel lineup with stream URLs |
| `subscriptions` | Customer subscription plans and expiry |
| `payments` | Payment records |

---

## Troubleshooting

### "Stream unavailable" error
- Check that the stream URL is accessible (test in VLC first)
- Ensure the stream is HLS format (.m3u8)
- Some streams may require CORS headers — contact your stream provider

### Customer can't log in
- Verify the user exists in Supabase Authentication
- Check that their profile has `status = 'active'`
- Check that they have an active subscription

### Channels not showing
- Ensure channels have `is_active = true`
- Check RLS policies are applied (run the schema SQL again)

---

## Legal Notice

⚠️ **Important:** You are responsible for ensuring you have proper authorization to redistribute any TV channel streams used in this platform. This application is a playback framework — it plays whatever URLs you provide. Ensure compliance with:
- Broadcasting rights and licenses
- Content distribution agreements
- Local telecommunications regulations
- Copyright laws in your jurisdiction

---

## Support

For issues with:
- **The app code** — edit files in this project
- **Supabase** — [supabase.com/docs](https://supabase.com/docs)
- **HLS streaming** — [hlsjs.video](https://hlsjs.video)
