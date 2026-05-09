# Supabase Setup Guide

This guide walks you through setting up Supabase for the portfolio snapshot feature.

## Table of Contents

1. [Create Supabase Account](#1-create-supabase-account)
2. [Create a New Project](#2-create-a-new-project)
3. [Set Up Database Schema](#3-set-up-database-schema)
4. [Configure Row Level Security](#4-configure-row-level-security)
5. [Get API Keys](#5-get-api-keys)
6. [Configure Environment Variables](#6-configure-environment-variables)
7. [Verify Setup](#7-verify-setup)

---

## 1. Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

---

## 2. Create a New Project

1. Click **New Project**
2. Fill in the details:
   - **Name**: `wen365` (or your preferred name)
   - **Database Password**: Generate a strong password and **save it somewhere secure**
   - **Region**: Choose the closest to your users (e.g., `West EU` for Europe)
   - **Pricing Plan**: Free tier is sufficient
3. Click **Create new project**
4. Wait 1-2 minutes for the project to be provisioned

---

## 3. Set Up Database Schema

### Option A: Using Supabase Dashboard (Recommended)

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy and paste the following SQL:

```sql
-- ============================================
-- PORTFOLIO SNAPSHOTS SCHEMA
-- ============================================

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- WALLETS TABLE
-- Stores registered wallet addresses for tracking
-- ============================================
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_snapshot_at TIMESTAMPTZ,

  -- Ensure address is lowercase for consistency
  CONSTRAINT address_lowercase CHECK (address = LOWER(address))
);

-- Index for fast lookups by address
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);

-- ============================================
-- PORTFOLIO SNAPSHOTS TABLE
-- Stores periodic snapshots of portfolio values
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_value DECIMAL(18, 2) NOT NULL,

  -- Store token breakdown as JSONB for flexibility
  -- Format: [{ "symbol": "ETH", "address": "0x...", "balance": 1.5, "value": 5000 }, ...]
  tokens JSONB,

  -- Prevent duplicate snapshots for same wallet at same time
  UNIQUE(wallet_id, timestamp)
);

-- Index for fast time-range queries per wallet
CREATE INDEX IF NOT EXISTS idx_snapshots_wallet_time
  ON portfolio_snapshots(wallet_id, timestamp DESC);

-- Index for cleanup queries (old snapshots)
CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp
  ON portfolio_snapshots(timestamp);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get or create a wallet by address
CREATE OR REPLACE FUNCTION get_or_create_wallet(wallet_address TEXT)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  wallet_id UUID;
BEGIN
  -- Try to find existing wallet
  SELECT id INTO wallet_id
  FROM wallets
  WHERE address = LOWER(wallet_address);

  -- If not found, create it
  IF wallet_id IS NULL THEN
    INSERT INTO wallets (address)
    VALUES (LOWER(wallet_address))
    RETURNING id INTO wallet_id;
  END IF;

  RETURN wallet_id;
END;
$$;

-- Delete old snapshots (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_snapshots(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM portfolio_snapshots
  WHERE timestamp < NOW() - (days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
```

4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned" for each statement

### Option B: Using Supabase CLI (Advanced)

If you prefer using the CLI:

```bash
# Install Supabase CLI (Homebrew recommended on macOS)
brew install supabase/tap/supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

---

## 4. Configure Row Level Security

Row Level Security (RLS) protects your data. For this use case, we'll use service role access (server-side only).

1. Go to **Authentication** > **Policies** in the dashboard
2. For both tables (`wallets` and `portfolio_snapshots`):
   - RLS is enabled by default
   - We won't add public policies since all access is server-side with service role key

**Important**: Never expose your `service_role` key to the client. Only use `anon` key on the frontend.

For this implementation, all database access happens server-side, so we use the `service_role` key which bypasses RLS.

---

## 5. Get API Keys

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll find:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon (public)**: Safe to use in browser (used by @nuxtjs/supabase)
   - **service_role (secret)**: **Keep this secret!** Used for server-side operations

Copy these values for the next step.

---

## 6. Configure Environment Variables

Add the following to your `.env` file:

```env
# Supabase Configuration (used by @nuxtjs/supabase)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key

# Cron Secret (generate a random string)
# Used to protect the snapshot cron endpoint
CRON_SECRET=your-random-secret-string-here
```

### Generate a Cron Secret

You can generate a secure random string:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using openssl
openssl rand -hex 32
```

---

## 7. Verify Setup

### Check Tables in Dashboard

1. Go to **Table Editor** in the sidebar
2. You should see:
   - `wallets` table
   - `portfolio_snapshots` table

### Test with SQL

1. Go to **SQL Editor**
2. Run a test query:

```sql
-- Test wallet creation
SELECT get_or_create_wallet('0x1234567890abcdef1234567890abcdef12345678');

-- Check it was created
SELECT * FROM wallets;

-- Clean up test data
DELETE FROM wallets WHERE address = '0x1234567890abcdef1234567890abcdef12345678';
```

---

## Next Steps

Once you've completed this setup:

1. The project uses `@nuxtjs/supabase` for integration.
2. Database types are configured in `nuxt.config.ts` to point to `server/types/database.ts`.
3. The CRON job is configured in `vercel.json` to run once daily (at midnight UTC).
4. The snapshot feature is ready to use!

---

## Free Tier Limits

Supabase free tier includes:

- **500 MB** database storage
- **2 GB** bandwidth / month
- **50,000** monthly active users
- **500 MB** file storage
- **Pauses after 1 week of inactivity**

For a portfolio project, this is more than sufficient. Just remember to wake up your project before demos!
