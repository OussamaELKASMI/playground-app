import { requireSession } from "../auth";
import { createTask, listTasks } from "../tasks-db";
import {
  assertJsonContentType,
  parsePostTaskBody,
  validateCreateTaskBody
} from "../validate-create-task-body";

export function getTasks(headers: Record<string, string | undefined>) {
  requireSession(headers);
  return listTasks();
}

export function postTask(
  headers: Record<string, string | undefined>,
  body: unknown
) {
  const session = requireSession(headers);
  assertJsonContentType(headers);
  const record = parsePostTaskBody(body);
  const payload = validateCreateTaskBody(record);

  return createTask({
    title: payload.title,
    description: payload.description,
    ownerId: session.userId
  });
}

