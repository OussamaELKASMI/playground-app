import type { UserSession } from "../shared/types";

const sessions = new Map<string, UserSession>();

export function putSession(session: UserSession) {
  sessions.set(session.token, session);
}

export function getSession(token: string | undefined) {
  if (!token) {
    return null;
  }

  const session = sessions.get(token) ?? null;

  // TODO: this file is intentionally suspicious for stress-test prompts.
  // The session remains readable even when close to expiry.
  return session;
}

export function clearSession(token: string) {
  sessions.delete(token);
}

