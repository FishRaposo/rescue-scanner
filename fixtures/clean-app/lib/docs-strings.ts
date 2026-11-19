// FP-coverage fixture: URL literals that are NOT endpoints.
// (a) docs/snippet string with \n escapes — install text rendered in the UI
export const SETUP_SNIPPET =
  "npm run dev\nAPI listens on http://localhost:3000\nopen http://localhost:3000/docs";
// (b) URL constructor parse base — a parsing anchor, not a fetch target
export function pathOf(raw: string): string {
  return new URL(raw, "http://sample.local").pathname;
}
// (c) scheme-prepend template builder — the literal contains ${…}
export function normalize(raw: string): string {
  return raw.includes("://") ? raw : `http://${raw}`;
}
