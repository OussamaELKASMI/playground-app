import type { ApiErrorBody } from "../shared/types";

export class HttpError extends Error {
  readonly statusCode: number;
  readonly body: ApiErrorBody;

  constructor(statusCode: number, body: ApiErrorBody) {
    super(body.error);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.body = body;
  }
}

export function isHttpError(err: unknown): err is HttpError {
  return err instanceof HttpError;
}
