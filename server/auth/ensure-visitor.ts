import "server-only";

import { cookies } from "next/headers";

import {
  createDeviceId,
  DEVICE_COOKIE,
  getDeviceCookieOptions,
  isValidDeviceId,
} from "@/lib/auth/device-cookie";

import { createSession, getSessionUserId } from "./session";
import { findOrCreateUserByDeviceId } from "./users";

/**
 * Гость без входа: cookie device_id + пользователь в БД + JWT-сессия.
 * Уже авторизованных (email/Telegram) не трогаем.
 */
export async function ensureVisitorUser(): Promise<void> {
  if (await getSessionUserId()) {
    return;
  }

  const jar = await cookies();
  let deviceId = jar.get(DEVICE_COOKIE)?.value?.trim();

  if (!deviceId || !isValidDeviceId(deviceId)) {
    deviceId = createDeviceId();
    jar.set(DEVICE_COOKIE, deviceId, getDeviceCookieOptions());
  }

  const user = await findOrCreateUserByDeviceId(deviceId);
  await createSession(user.id, {
    deviceId: user.deviceId,
    email: user.email,
    telegramId: user.telegramId,
  });
}
