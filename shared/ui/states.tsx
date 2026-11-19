import type { ReactNode } from "react";
import { ApiError } from "../api/adapter";

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="rounded-card border border-dashed border-border p-8 text-center">
      <p className="font-medium text-text">{title}</p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

export function ErrorState({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  const isApi = error instanceof ApiError;
  const code = isApi ? error.code : "unexpected_error";
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div role="alert" className="rounded-card border border-danger/40 bg-surface p-5">
      <p className="font-medium text-danger">Something failed ({code})</p>
      <p className="mt-1 text-sm text-text">{message}</p>
      {retry ? (
        <button
          type="button"
          onClick={retry}
          className="mt-3 min-h-[44px] rounded-card border border-border px-4 text-sm text-text hover:border-muted"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="p-6 text-center text-muted">
      <span aria-hidden="true" className="mr-2 inline-block animate-pulse">
        ●
      </span>
      {label}…
    </div>
  );
}

export function SampleDataBadge({ note }: { note?: ReactNode }) {
  return (
    <span
      data-sample-label="true"
      className="inline-flex items-center gap-1 rounded-full border border-warning/50 bg-elev px-3 py-1 text-xs font-semibold text-warning"
    >
      Sample data{note ? <span className="font-normal text-muted"> — {note}</span> : null}
    </span>
  );
}
