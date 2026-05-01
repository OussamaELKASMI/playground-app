export type TaskStatus = "todo" | "in_progress" | "done";

/** JSON body returned for failed API requests (4xx/5xx). */
export type ApiErrorDetail = {
  path: string;
  message: string;
};

/** Machine-readable codes clients can branch on; keep in sync with server throws. */
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_JSON"
  | "INVALID_BODY"
  | "UNAUTHORIZED"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "PAYLOAD_TOO_LARGE";

export type ApiErrorBody = {
  /** Short human-readable summary for logs and simple UIs. */
  error: string;
  code: ApiErrorCode;
  /** Field-level issues; omitted when a single global error is enough. */
  details?: ApiErrorDetail[];
};

/** Client-allowed fields for POST /api/tasks (validated on the server). */
export type CreateTaskRequest = {
  title: string;
  description?: string;
};

export type UserSession = {
  userId: string;
  email: string;
  token: string;
  expiresAt: number;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  ownerId: string;
};

