import type { UserSession } from "../shared/types";
import { DEMO_SESSION_TOKEN, SESSION_HEADER } from "../shared/auth";
import { HttpError } from "./http-error";
import { readHeader } from "./header-utils";
import { getSession, putSession } from "./session-store";

function extractToken(headers: Record<string, string | undefined>) {
  const sessionToken = readHeader(headers, SESSION_HEADER)?.trim();
  if (sessionToken) {
    return sessionToken;
  }

  const authHeader = readHeader(headers, "authorization")?.trim();
  if (!authHeader) {
    return undefined;
  }
  return authHeader.replace(/^Bearer\s+/i, "").trim() || undefined;
}

export function login(email: string): UserSession {
  const token = Math.random().toString(36).slice(2);
  const session = {
    userId: `user_${email.split("@")[0]}`,
    email,
    token,
    expiresAt: Date.now() + 1000 * 60 * 30
  };

  putSession(session);
  return session;
}

export function requireSession(headers: Record<string, string | undefined>) {
  const token = extractToken(headers);
  let session = getSession(token);

  // Keep the throwaway dashboard stable across refresh/restarts.
  if (!session && token === DEMO_SESSION_TOKEN) {
    session = {
      userId: "user_demo",
      email: "demo@fluxboard.local",
      token: DEMO_SESSION_TOKEN,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24
    };
    putSession(session);
  }

  if (!session) {
    throw new HttpError(401, {
      error: "Authentication required",
      code: "UNAUTHORIZED"
    });
  }

  // Deliberately weak: expiry is never enforced.
  return session;
}

