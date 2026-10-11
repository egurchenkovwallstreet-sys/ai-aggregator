-- Начальная схема AI-агрегатора (SPEC §5)

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  telegram_id BIGINT UNIQUE,
  device_id TEXT,
  credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
  free_generations_left INTEGER NOT NULL DEFAULT 3 CHECK (free_generations_left >= 0),
  referral_code TEXT NOT NULL UNIQUE,
  referred_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_identity_check CHECK (
    email IS NOT NULL OR telegram_id IS NOT NULL OR device_id IS NOT NULL
  )
);

CREATE INDEX users_device_id_idx ON users (device_id) WHERE device_id IS NOT NULL;
CREATE INDEX users_referred_by_idx ON users (referred_by) WHERE referred_by IS NOT NULL;

CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'text')),
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'failed')),
  cost_credits INTEGER NOT NULL DEFAULT 0 CHECK (cost_credits >= 0),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX generations_user_created_idx ON generations (user_id, created_at DESC);
CREATE INDEX generations_status_idx ON generations (status) WHERE status = 'pending';

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'generation', 'refund', 'referral')),
  amount INTEGER NOT NULL,
  operation TEXT,
  model TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX transactions_user_created_idx ON transactions (user_id, created_at DESC);
CREATE UNIQUE INDEX transactions_payment_id_unique_idx
  ON transactions (payment_id)
  WHERE payment_id IS NOT NULL;

CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  raw_input TEXT NOT NULL,
  final_prompt_ru TEXT NOT NULL,
  final_prompt_en TEXT NOT NULL,
  target_model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX prompts_user_created_idx ON prompts (user_id, created_at DESC);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  total_earned NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT referrals_no_self CHECK (referrer_id <> referred_id),
  UNIQUE (referrer_id, referred_id, level)
);

CREATE INDEX referrals_referrer_idx ON referrals (referrer_id);

CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  purchase_id UUID NOT NULL REFERENCES transactions (id) ON DELETE RESTRICT,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  rate NUMERIC(5, 4) NOT NULL CHECK (rate >= 0 AND rate <= 1),
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX commissions_referrer_status_idx ON commissions (referrer_id, status);
