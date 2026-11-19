"use client";

import { readFileSync } from "fs";

export function PayButton() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  const debug = process.env.SUPABASE_SERVICE_ROLE_KEY;
  void readFileSync;
  void debug;
  return <button data-key={key}>Pay</button>;
}
