import "server-only";
import { BackendError, backendFetch } from "@/api/backend";
import type { Faggruppe } from "@/types/faggruppe";

export async function getFaggrupper(): Promise<Faggruppe[]> {
  return (await backendFetch("/api/faggrupper")).json();
}

// Returns null when the group does not exist; other failures throw.
export async function getFaggruppe(id: string): Promise<Faggruppe | null> {
  try {
    return await (await backendFetch(`/api/faggrupper/${encodeURIComponent(id)}`)).json();
  } catch (error) {
    if (error instanceof BackendError && error.status === 404) return null;
    throw error;
  }
}

// Returns null when ownership could not be determined.
export async function getIsFaggruppeOwner(id: string): Promise<boolean | null> {
  try {
    const data = await (await backendFetch(`/api/faggrupper/${encodeURIComponent(id)}/eier`)).json();
    return data.isOwner ?? false;
  } catch {
    return null;
  }
}
