import { useEffect, useMemo, useState } from "react";
import { createTask, fetchTasks } from "../api";

export function TaskBoard() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchTasks()
      .then((rows) => {
        setItems(rows);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const doneCount = useMemo(() => {
    return items.filter((item) => item.status === "done").length;
  }, [items]);

  async function handleQuickAdd() {
    await createTask({
      title: "New task from quick add",
      description: "This path has almost no UX feedback."
    });
  }

  return (
    <section>
      <header>
        <h2>Task Board</h2>
        <p>{doneCount} completed</p>
      </header>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <button onClick={handleQuickAdd}>Quick add</button>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong>
            <span>{item.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

