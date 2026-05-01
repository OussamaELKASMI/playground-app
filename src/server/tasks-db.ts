import type { CreateTaskInput, Task } from "../shared/types";

const taskRows: Task[] = [
  {
    id: "task_1",
    title: "Stabilize dashboard filters",
    description: "Filter state resets too easily.",
    status: "todo",
    ownerId: "user_oussama",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "task_2",
    title: "Improve task API validation",
    description: "Bad requests still sneak through.",
    status: "in_progress",
    ownerId: "user_oussama",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function listTasks() {
  return taskRows;
}

export function createTask(input: CreateTaskInput) {
  const task: Task = {
    id: `task_${taskRows.length + 1}`,
    title: input.title,
    description: input.description,
    status: "todo",
    ownerId: input.ownerId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  taskRows.push(task);
  return task;
}

