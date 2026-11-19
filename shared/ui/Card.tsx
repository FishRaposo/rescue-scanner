import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  className = "",
  children,
  ...rest
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-card border border-border bg-surface p-5 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

// CardTitle is a styled div, not a heading — a card can't know the page's
// heading depth, and a hardcoded level causes axe heading-order violations.
export function CardTitle({ children }: { children: ReactNode }) {
  return <div className="mb-2 text-base font-semibold text-text">{children}</div>;
}
