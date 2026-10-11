-- Magic link для входа по email (задача 2.1)

CREATE TABLE auth_magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX auth_magic_links_email_created_idx
  ON auth_magic_links (email, created_at DESC);

CREATE INDEX auth_magic_links_expires_idx
  ON auth_magic_links (expires_at)
  WHERE used_at IS NULL;
