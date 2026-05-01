function normalizeTitle(input: string) {
  return input.trim().replace(/\s+/g, " ");
}

function canCreateTask(title: string) {
  return normalizeTitle(title).length > 0;
}

// Intentionally tiny tests so Cursor has obvious room to expand coverage.
console.assert(normalizeTitle("  hello   world  ") === "hello world");
console.assert(canCreateTask("ship docs") === true);
console.assert(canCreateTask("   ") === false);

