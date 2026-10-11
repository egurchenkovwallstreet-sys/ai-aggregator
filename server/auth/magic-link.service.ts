import "server-only";

import { sanitizeNextPath } from "@/lib/auth/safe-next-path";

import { getAppBaseUrl, getMagicLinkTtlSec } from "./config";
import { createOpaqueToken, hashToken } from "./token-hash";
import { findOrCreateUserByEmail } from "./users";
import { query } from "@/server/db";

export async function issueMagicLink(
  email: string,
  nextPath?: string | null,
): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const rawToken = createOpaqueToken();
  const tokenHash = hashToken(rawToken);
  const ttlSec = getMagicLinkTtlSec();

  await query(
    `INSERT INTO auth_magic_links (email, token_hash, expires_at)
     VALUES ($1, $2, NOW() + $3 * INTERVAL '1 second')`,
    [normalized, tokenHash, ttlSec],
  );

  const next = sanitizeNextPath(nextPath);
  const base = `${getAppBaseUrl()}/auth/callback?token=${encodeURIComponent(rawToken)}`;
  return next ? `${base}&next=${encodeURIComponent(next)}` : base;
}

export async function consumeMagicLink(
  rawToken: string,
): Promise<{ userId: string; email: string } | null> {
  const tokenHash = hashToken(rawToken.trim());

  const link = await query<{ email: string }>(
    `UPDATE auth_magic_links
     SET used_at = NOW()
     WHERE token_hash = $1
       AND used_at IS NULL
       AND expires_at > NOW()
     RETURNING email`,
    [tokenHash],
  );

  const email = link.rows[0]?.email;
  if (!email) {
    return null;
  }

  const user = await findOrCreateUserByEmail(email);
  return { userId: user.id, email };
}
