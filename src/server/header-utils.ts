export function readHeader(
  headers: Record<string, string | undefined>,
  name: string
): string | undefined {
  return headers[name] ?? headers[name.toLowerCase()] ?? headers[name.toUpperCase()];
}
