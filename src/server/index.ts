import { login } from "./auth";
import { isHttpError } from "./http-error";
import { getTasks, postTask } from "./routes/tasks";
import { SESSION_HEADER } from "../shared/auth";

function main() {
  const session = login("oussama@example.com");

  const tasks = getTasks({
    [SESSION_HEADER]: session.token
  });

  console.log("Loaded tasks:", tasks.length);

  try {
    const created = postTask(
      {
        [SESSION_HEADER]: session.token
      },
      {
        title: "Document the rough edges",
        description: "A fake task created by the throwaway fixture."
      }
    );
    console.log("Created task:", created.id);
  } catch (err) {
    if (isHttpError(err)) {
      console.error("API error:", err.statusCode, JSON.stringify(err.body, null, 2));
    } else {
      throw err;
    }
  }
}

main();

