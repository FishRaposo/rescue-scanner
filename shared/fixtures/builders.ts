import type { BuildContext, Entity } from "./types";

export const FIXED_NOW = "2026-01-01T00:00:00Z";

/**
 * A deterministic build context: ids increment per prefix from the seed, the
 * timestamp is fixed. Two contexts with the same seed produce identical
 * sequences — that property is tested.
 */
export function makeContext(seed = 1, now: string = FIXED_NOW): BuildContext {
  const counters = new Map<string, number>();
  return {
    seed,
    now,
    id(prefix: string): string {
      const next = (counters.get(prefix) ?? 0) + 1;
      counters.set(prefix, next);
      return `${prefix}-${String(next).padStart(4, "0")}`;
    },
  };
}

export type Attrs<T extends Entity> = Partial<Omit<T, "id">>;

/**
 * Build one entity deterministically: id from the context unless overridden,
 * other fields from `defaults(attrs)`.
 */
export function build<T extends Entity>(
  ctx: BuildContext,
  prefix: string,
  defaults: (ctx: BuildContext, attrs: Attrs<T>) => Omit<T, "id">,
  attrs: Attrs<T> = {},
): T {
  return { id: ctx.id(prefix), ...defaults(ctx, attrs) } as T;
}
