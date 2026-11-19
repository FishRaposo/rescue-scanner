import type { ReactNode } from "react";

export function CodeBlock({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <figure className="overflow-hidden rounded-card border border-border bg-bg">
      {label ? (
        <figcaption className="border-b border-border px-4 py-2 text-xs text-muted">
          {label}
        </figcaption>
      ) : null}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-text">
        <code>{children}</code>
      </pre>
    </figure>
  );
}
