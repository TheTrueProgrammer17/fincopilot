# 🟢 FinCopilot

An AI-powered financial decision assistant for young Indian adults. Built with React (Vite) + FastAPI + Google Gemini + Supabase.

---

## What It Does

| Feature | Description |
|---|---|
| **Authentication & Cloud Sync** | Persistent user accounts backed by Supabase Auth and PostgreSQL |
| **Financial Health Score** | Real-time score calculated dynamically from your transactions |
| **Decision Simulator** | See the financial impact of a purchase before you commit to it |
| **AI Copilot** | Chat with Gemini — personalized advice based on your actual spending |
| **Transaction Tracker** | Log income/expenses, view grouped history, and track spending breakdowns |

---

## Tech Stack

- **Frontend:** React, Vite, Framer Motion, Tailwind CSS (Custom Design System), Recharts
- **Backend:** FastAPI, Python, Uvicorn
- **AI Engine:** Google Gemini API
- **Database & Auth:** Supabase (PostgreSQL)

---

## Prerequisites

Make sure you have these installed:

- **Node.js** v18+ — [nodejs.org](https://nodejs.org)
- **Python** 3.9+ — [python.org](https://python.org)
- **pip** (comes with Python)
- A **Gemini API key** — get one free at [aistudio.google.com](https://aistudio.google.com/apikey)
- A **Supabase Account** — free tier at [supabase.com](https://supabase.com)

---

## Setup (First Time Only)

### 1. Supabase Setup
Create a new project on Supabase and run the following SQL in the SQL Editor to provision your tables:

```sql
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

-- Note: Ensure you disable "Confirm email" in Supabase Auth Providers for Hackathon MVP flow
```

### 2. Environment Variables

Create two `.env` files.

**Frontend (`/.env`):**
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (`/backend/.env`):**
```
GEMINI_API_KEY=your_actual_key_here
```

### 3. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cd ..
```

---

## Running the App

You need **two terminals** running at the same time.

### Terminal 1 — Backend (FastAPI)

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Terminal 2 — Frontend (React)

```bash
npm run dev
```

### Open the app

👉 **http://localhost:5173**

---

## App Flow

```
Landing Page → Login/Signup → Dashboard
```
*(If a user signs up for the first time, an empty profile is instantly created, granting them immediate dashboard access without forcing onboarding. They can complete their profile at any time).*

From the Dashboard you can navigate to:
- **Simulator** — test a financial decision (e.g., buy a bike)
- **Transactions** — log your income & expenses (synced to cloud)
- **Copilot** — chat with the AI advisor
- **Profile** — view or edit your financial data, or log out

---

## Project Structure

```
fincopilot/
├── src/
│   ├── pages/
│   │   ├── AuthPage.jsx        ← Supabase login/signup
│   │   ├── Dashboard.jsx       ← charts + health score
│   │   ├── Transactions.jsx    ← add/view transactions
│   │   ├── Simulator.jsx       ← purchase impact simulator
│   │   └── Copilot.jsx         ← AI chat
│   ├── context/
│   │   ├── AuthContext.jsx     ← Manages Supabase sessions
│   │   └── UserContext.jsx     ← Syncs profile/transactions with Supabase
│   ├── lib/
│   │   └── supabase.js         ← Supabase client initialization
│   └── utils/
│       └── helpers.js          ← score calculations
│
└── backend/
    ├── main.py                 ← FastAPI app + CORS
    ├── engine.py               ← financial math (EMI, scores)
    ├── gemini.py               ← Gemini AI prompts
    ├── models.py               ← Pydantic request/response models
    ├── .env                    ← GEMINI_API_KEY
    └── routes/
```

---

## Notes
- **Data Persistence:** All transactions, profiles, and chat histories are saved directly to your Supabase PostgreSQL database. LocalStorage is no longer used.
- **AI Features:** The Simulator explanation, Dashboard insights, and Copilot chat require the FastAPI backend to be running with a valid Gemini API key.
- **Error Handling:** If the backend is down, UI flows intelligently fallback (e.g., the Simulator relies on local calculations).
