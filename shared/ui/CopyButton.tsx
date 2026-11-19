"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="min-h-[44px] rounded-card border border-border px-3 text-sm text-muted hover:text-text"
    >
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
