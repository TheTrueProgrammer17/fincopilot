-- Supabase Database Schema for FinCopilot
-- This file is idempotent and can be safely run multiple times.

-- ==========================================
-- 1. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. TABLES
-- ==========================================

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT,
  -- Removed NOT NULL to support immediate empty profile creation without mandatory initial values
  monthly_income NUMERIC DEFAULT 0,
  rent NUMERIC DEFAULT 0,
  food NUMERIC DEFAULT 0,
  transport NUMERIC DEFAULT 0,
  entertainment NUMERIC DEFAULT 0,
  other_expenses NUMERIC DEFAULT 0,
  savings NUMERIC DEFAULT 0,
  has_loan BOOLEAN DEFAULT false,
  loan_amount NUMERIC DEFAULT 0,
  emi NUMERIC DEFAULT 0,
  goal TEXT,
  health_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CHATS TABLE (For Gemini Copilot history persistence)
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  -- Using UNIQUE on user_id ensures each user has exactly one persisted chat history row for upserts
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. RLS POLICIES
-- ==========================================

-- PROFILES POLICIES
-- Authenticated users can only read and manage their own profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
CREATE POLICY "Users can create own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" 
  ON public.profiles FOR DELETE 
  USING (auth.uid() = user_id);

-- TRANSACTIONS POLICIES
-- Authenticated users can only read and manage their own transactions
DROP POLICY IF EXISTS "Users can manage own transactions" ON public.transactions;
CREATE POLICY "Users can manage own transactions" 
  ON public.transactions FOR ALL 
  USING (auth.uid() = user_id);

-- CHATS POLICIES
-- Authenticated users can only read and manage their own chat history
DROP POLICY IF EXISTS "Users can manage own chats" ON public.chats;
CREATE POLICY "Users can manage own chats" 
  ON public.chats FOR ALL 
  USING (auth.uid() = user_id);
