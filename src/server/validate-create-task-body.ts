import type { ApiErrorDetail, CreateTaskRequest } from "../shared/types";
import { HttpError } from "./http-error";

const ALLOWED_KEYS = new Set(["title", "description"]);
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;

function validationError(message: string, details: ApiErrorDetail[]): never {
  throw new HttpError(400, {
    error: message,
    code: "VALIDATION_ERROR",
    details
  });
}

export function validateCreateTaskBody(raw: unknown): CreateTaskRequest {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    validationError("Invalid request body", [
      { path: "body", message: "Expected a JSON object" }
    ]);
  }

  const body = raw as Record<string, unknown>;
  for (const key of Object.keys(body)) {
    if (!ALLOWED_KEYS.has(key)) {
      validationError("Unknown or disallowed field in request body", [
        {
          path: key,
          message: `Only ${Array.from(ALLOWED_KEYS).join(", ")} are allowed`
        }
      ]);
    }
  }

  if (!("title" in body)) {
    validationError("Validation failed", [
      { path: "title", message: "Required field missing" }
    ]);
  }

  const titleRaw = body.title;
  if (typeof titleRaw !== "string") {
    validationError("Validation failed", [
      { path: "title", message: "Must be a string" }
    ]);
  }
  const title = titleRaw.trim();
  if (title.length === 0) {
    validationError("Validation failed", [
      { path: "title", message: "Cannot be empty or whitespace only" }
    ]);
  }
  if (title.length > MAX_TITLE_LENGTH) {
    validationError("Validation failed", [
      {
        path: "title",
        message: `Must be at most ${MAX_TITLE_LENGTH} characters`
      }
    ]);
  }

  let description: string | undefined;
  if ("description" in body && body.description !== undefined) {
    const descRaw = body.description;
    if (typeof descRaw !== "string") {
      validationError("Validation failed", [
        { path: "description", message: "Must be a string when provided" }
      ]);
    }
    const desc = descRaw.trim();
    if (desc.length > MAX_DESCRIPTION_LENGTH) {
      validationError("Validation failed", [
        {
          path: "description",
          message: `Must be at most ${MAX_DESCRIPTION_LENGTH} characters`
        }
      ]);
    }
    if (desc.length > 0) {
      description = desc;
    }
  }

  return description !== undefined ? { title, description } : { title };
}
