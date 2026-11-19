import { createClient, MockAdapter } from "@shared/api";
import { mockRoutes } from "./mock-routes";

/**
 * Rescue Scanner has no live API: the report renders a committed fixture
 * scan, so the client always uses the mock adapter. `isDemo` only controls
 * the sample-data badge (true on the Pages export via NEXT_PUBLIC_DEMO_MODE,
 * also true locally — the data is fixture data either way).
 */
export const api = createClient(new MockAdapter(mockRoutes, { latencyMs: 40 }));
export const isDemo = true;
