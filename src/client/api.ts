import { DEMO_SESSION_TOKEN, SESSION_HEADER } from "../shared/auth";
import type { ApiErrorBody, CreateTaskRequest } from "../shared/types";

const SESSION_STORAGE_KEY = "fluxboard.sessionToken";

export function getStoredSessionToken() {
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  const token = raw?.trim();
  if (token) {
    return token;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, DEMO_SESSION_TOKEN);
  return DEMO_SESSION_TOKEN;
}

function persistSessionToken(token: string) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, token);
}

async function responseLooksUnauthorized(response: Response): Promise<boolean> {
  if (response.status === 401 || response.status === 403) {
    return true;
  }
  if (response.status !== 400) {
    return false;
  }
  const ct = response.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return false;
  }
  try {
    const data = (await response.clone().json()) as { code?: string };
    return data.code === "UNAUTHORIZED";
  } catch {
    return false;
  }
}

async function requestWithSessionRecovery(
  input: string,
  init: RequestInit = {}
) {
  const storedToken = getStoredSessionToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${storedToken}`);
  headers.set(SESSION_HEADER, storedToken);

  let response = await fetch(input, {
    ...init,
    credentials: "include",
    headers
  });

  // After a restart or another worker, the server may not recognize the browser token.
  // Always normalize to the well-known demo token and retry once so refresh stays stable
  // (including when localStorage already held the demo token but the first request failed).
  if (await responseLooksUnauthorized(response)) {
    persistSessionToken(DEMO_SESSION_TOKEN);
    headers.set("Authorization", `Bearer ${DEMO_SESSION_TOKEN}`);
    headers.set(SESSION_HEADER, DEMO_SESSION_TOKEN);
    response = await fetch(input, {
      ...init,
      credentials: "include",
      headers
    });
  }

  return response;
}

function formatApiErrorMessage(body: ApiErrorBody): string {
  if (body.details?.length) {
    const detailText = body.details
      .map((d) => `${d.path}: ${d.message}`)
      .join("; ");
    return `${body.error} (${detailText})`;
  }
  return body.error;
}

async function readApiError(response: Response, fallback: string): Promise<string> {
  const text = await response.text();
  if (!text) {
    return `${fallback} (HTTP ${response.status})`;
  }
  try {
    const parsed = JSON.parse(text) as ApiErrorBody;
    if (parsed && typeof parsed.error === "string") {
      return formatApiErrorMessage(parsed);
    }
  } catch {
    /* use raw text */
  }
  return text;
}

export async function fetchTasks() {
  const response = await requestWithSessionRecovery("/api/tasks", {
    credentials: "include",
    headers: {}
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Failed to load tasks"));
  }

  return response.json();
}

export async function createTask(payload: CreateTaskRequest) {
  const response = await requestWithSessionRecovery("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Failed to create task"));
  }

  return response.json();
}

