import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "danger" | "warning" | "accent";

const tones: Record<Tone, string> = {
  neutral: "bg-elev text-muted border-border",
  success: "bg-elev text-success border-success/40",
  danger: "bg-elev text-danger border-danger/40",
  warning: "bg-elev text-warning border-warning/40",
  accent: "bg-elev text-accent border-accent/40",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
