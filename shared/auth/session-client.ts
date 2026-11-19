import type { ApiClient } from "../api/client";

/**
 * The UI never parses the signed session cookie — it asks the API who it is.
 * In demo mode the MockAdapter answers `/api/me` with the scenario's user, so
 * the same component path works in both modes.
 */
export interface ActorView {
  id: string;
  name: string;
  role: string;
  tenant_id: string | null;
}

export async function getActor(api: ApiClient): Promise<ActorView | null> {
  try {
    return await api.get<ActorView>("/api/me");
  } catch {
    return null;
  }
}
