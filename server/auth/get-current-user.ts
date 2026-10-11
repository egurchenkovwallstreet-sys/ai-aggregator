import "server-only";

import { getSessionUserId } from "./session";
import { getUserById, type AuthUser } from "./users";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const userId = await getSessionUserId();
  if (!userId) {
    return null;
  }
  return getUserById(userId);
}
