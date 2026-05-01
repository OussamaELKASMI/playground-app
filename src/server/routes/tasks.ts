import { requireSession } from "../auth";
import { createTask, listTasks } from "../tasks-db";
import { validateCreateTaskBody } from "../validate-create-task-body";

export function getTasks(headers: Record<string, string | undefined>) {
  requireSession(headers);
  return listTasks();
}

export function postTask(
  headers: Record<string, string | undefined>,
  body: unknown
) {
  const session = requireSession(headers);
  const payload = validateCreateTaskBody(body);

  return createTask({
    title: payload.title,
    description: payload.description,
    ownerId: session.userId
  });
}

