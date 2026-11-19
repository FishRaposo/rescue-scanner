export const API_BASE = process.env.APP_BASE_URL;
export const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
// Env-backed local default — the correct pattern, must not be flagged.
export const NOTIFY_BASE = process.env.NOTIFY_BASE_URL ?? "http://localhost:4000";
