import type { ApiErrorDetail, CreateTaskRequest } from "../shared/types";
import { HttpError } from "./http-error";
import { readHeader } from "./header-utils";

const ALLOWED_KEYS = new Set(["title", "description"]);
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_RAW_JSON_STRING_LENGTH = 65_536;

export function assertJsonContentType(
  headers: Record<string, string | undefined>
): void {
  const raw = readHeader(headers, "content-type");
  if (raw === undefined) {
    return;
  }
  const mime = raw.split(";")[0]?.trim().toLowerCase() ?? "";
  if (mime !== "application/json") {
    throw new HttpError(415, {
      error: "Task creation expects Content-Type: application/json",
      code: "UNSUPPORTED_MEDIA_TYPE",
      details: [
        {
          path: "Content-Type",
          message: `Expected application/json; received ${mime || "(empty)"}`
        }
      ]
    });
  }
}

function invalidJson(message: string, details: ApiErrorDetail[]): never {
  throw new HttpError(400, {
    error: message,
    code: "INVALID_JSON",
    details
  });
}

function validationFail(details: ApiErrorDetail[]): never {
  throw new HttpError(400, {
    error: "Request validation failed",
    code: "VALIDATION_ERROR",
    details
  });
}

/**
 * Accepts either a pre-parsed object (in-process callers) or a raw JSON string (HTTP adapters).
 */
export function parsePostTaskBody(body: unknown): Record<string, unknown> {
  if (body === undefined || body === null) {
    throw new HttpError(400, {
      error: "Request body is required",
      code: "INVALID_BODY",
      details: [
        { path: "body", message: "Send a JSON object with at least a title" }
      ]
    });
  }

  if (typeof body === "string") {
    const trimmed = body.trim();
    if (trimmed.length === 0) {
      throw new HttpError(400, {
        error: "Request body is empty",
        code: "INVALID_BODY",
        details: [{ path: "body", message: "Expected JSON, received empty body" }]
      });
    }
    if (trimmed.length > MAX_RAW_JSON_STRING_LENGTH) {
      throw new HttpError(413, {
        error: "JSON body is too large",
        code: "PAYLOAD_TOO_LARGE",
        details: [
          {
            path: "body",
            message: `Must be at most ${MAX_RAW_JSON_STRING_LENGTH} characters`
          }
        ]
      });
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      invalidJson("Request body is not valid JSON", [
        { path: "body", message: "Could not parse as JSON" }
      ]);
    }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new HttpError(400, {
        error: "JSON root value must be an object",
        code: "INVALID_JSON",
        details: [{ path: "body", message: "Expected a JSON object at the root" }]
      });
    }
    return parsed as Record<string, unknown>;
  }

  if (typeof body === "object" && !Array.isArray(body)) {
    return body as Record<string, unknown>;
  }

  throw new HttpError(400, {
    error: "Request body has the wrong shape",
    code: "INVALID_BODY",
    details: [{ path: "body", message: "Expected a JSON object" }]
  });
}

export function validateCreateTaskBody(raw: unknown): CreateTaskRequest {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    validationFail([
      {
        path: "body",
        message: "Expected a JSON object with title and optional description"
      }
    ]);
  }

  const body = raw as Record<string, unknown>;
  const details: ApiErrorDetail[] = [];

  for (const key of Object.keys(body)) {
    if (!ALLOWED_KEYS.has(key)) {
      details.push({
        path: key,
        message: `Unknown field; allowed: ${Array.from(ALLOWED_KEYS).join(", ")}`
      });
    }
  }

  let title: string | undefined;
  if (!("title" in body)) {
    details.push({ path: "title", message: "Required" });
  } else {
    const titleRaw = body.title;
    if (typeof titleRaw !== "string") {
      details.push({ path: "title", message: "Must be a string" });
    } else {
      const t = titleRaw.trim();
      if (t.length === 0) {
        details.push({
          path: "title",
          message: "Cannot be empty or whitespace only"
        });
      } else if (t.length > MAX_TITLE_LENGTH) {
        details.push({
          path: "title",
          message: `Must be at most ${MAX_TITLE_LENGTH} characters (after trimming)`
        });
      } else {
        title = t;
      }
    }
  }

  let description: string | undefined;
  if ("description" in body && body.description !== undefined) {
    const descRaw = body.description;
    if (descRaw === null) {
      details.push({
        path: "description",
        message: "Must be a string; omit the field if not needed"
      });
    } else if (typeof descRaw !== "string") {
      details.push({
        path: "description",
        message: "Must be a string when provided"
      });
    } else {
      const d = descRaw.trim();
      if (d.length > MAX_DESCRIPTION_LENGTH) {
        details.push({
          path: "description",
          message: `Must be at most ${MAX_DESCRIPTION_LENGTH} characters (after trimming)`
        });
      } else if (d.length > 0) {
        description = d;
      }
    }
  }

  if (details.length > 0) {
    validationFail(details);
  }

  if (title === undefined) {
    validationFail([{ path: "title", message: "Required" }]);
  }

  return description !== undefined ? { title, description } : { title };
}
