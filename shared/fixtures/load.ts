import type { Scenario } from "./types";

export class ScenarioFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScenarioFormatError";
  }
}

function fail(field: string): never {
  throw new ScenarioFormatError(`scenario file: missing or invalid '${field}'`);
}

/**
 * Parse and validate a scenario file. Loud on malformed input — a scenario
 * that cannot load fails the demo build, never silently renders empty.
 */
export function parseScenario(text: string): Scenario {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new ScenarioFormatError("scenario file: not valid JSON");
  }
  const s = raw as Partial<Scenario>;
  if (typeof s.scenario !== "string" || s.scenario.length === 0) fail("scenario");
  if (typeof s.version !== "number") fail("version");
  if (typeof s.seed !== "number") fail("seed");
  if (typeof s.generated_at !== "string") fail("generated_at");
  if (typeof s.entities !== "object" || s.entities === null) fail("entities");
  for (const [name, list] of Object.entries(s.entities)) {
    if (!Array.isArray(list)) fail(`entities.${name}`);
    for (const item of list) {
      if (typeof item !== "object" || item === null || typeof item.id !== "string") {
        fail(`entities.${name}[].id`);
      }
    }
  }
  return s as Scenario;
}
