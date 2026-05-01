export type TaskStatus = "todo" | "in_progress" | "done";

/** JSON body returned for failed API requests (4xx/5xx). */
export type ApiErrorDetail = {
  path: string;
  message: string;
};

export type ApiErrorBody = {
  error: string;
  code: string;
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

