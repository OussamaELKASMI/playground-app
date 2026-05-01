import * as fs from "node:fs";
import * as path from "node:path";
import type { UserSession } from "../shared/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

const sessions = new Map<string, UserSession>();

function mergeFromDisk(): void {
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return;
    }
    for (const row of parsed) {
      if (
        row &&
        typeof row === "object" &&
        "token" in row &&
        typeof (row as UserSession).token === "string"
      ) {
        const s = row as UserSession;
        sessions.set(s.token, s);
      }
    }
  } catch {
    // Missing or unreadable file — keep current in-memory map.
  }
}

function persistToDisk(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const arr = [...sessions.values()];
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(arr, null, 2), "utf8");
  } catch {
    // best-effort; sessions still work for this process lifetime
  }
}

mergeFromDisk();

export function putSession(session: UserSession) {
  sessions.set(session.token, session);
  persistToDisk();
}

export function getSession(token: string | undefined) {
  if (!token) {
    return null;
  }

  let session = sessions.get(token) ?? null;
  if (!session) {
    // Reload after restarts, other workers on the same host, or first write from another process.
    mergeFromDisk();
    session = sessions.get(token) ?? null;
  }

  return session;
}

export function clearSession(token: string) {
  sessions.delete(token);
  persistToDisk();
}
