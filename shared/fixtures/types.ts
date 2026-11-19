/**
 * The scenario format every demo fixture follows: one file, a fixed seed, a
 * fixed timestamp and named entity lists. Stable ids/timestamps come from the
 * builders, never from the clock or Math.random.
 */
export interface Entity {
  id: string;
  [key: string]: unknown;
}

export interface Scenario {
  /** Scenario name, e.g. "two-tenant-inbox". */
  scenario: string;
  version: number;
  /** Integer seed; same seed must regenerate identical output. */
  seed: number;
  /** Fixed ISO timestamp the scenario is dated to. */
  generated_at: string;
  entities: Record<string, Entity[]>;
}

/** Context handed to builders so ids/timestamps stay deterministic. */
export interface BuildContext {
  /** Next deterministic id for a prefix: `${prefix}-${0001}`… per prefix. */
  id: (prefix: string) => string;
  /** The scenario's fixed timestamp. */
  now: string;
  seed: number;
}
