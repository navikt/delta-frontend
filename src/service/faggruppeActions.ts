"use server";

import { BackendError, backendFetch } from "@/api/backend";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import type { Faggruppe, FaggruppeActionResult } from "@/types/faggruppe";

type FaggruppeInput = Record<string, unknown>;

// Every action authenticates through backendFetch; the backend enforces owner/admin access and answers 403.
async function run<T>(
  forbiddenMessage: string,
  action: () => Promise<T>,
): Promise<FaggruppeActionResult<T>> {
  try {
    return { ok: true, data: await action() };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof BackendError) {
      console.error("Faggruppe action failed", { status: error.status });
      if (error.status === 401) {
        return { ok: false, status: 401, message: "Innloggingen er utløpt. Last siden på nytt." };
      }
      if (error.status === 403) {
        return { ok: false, status: 403, message: forbiddenMessage };
      }
      return { ok: false, status: error.status, message: error.responseMessage ?? "Noe gikk galt" };
    }
    console.error("Faggruppe action failed");
    return { ok: false, message: "Noe gikk galt" };
  }
}

export async function createFaggruppe(input: FaggruppeInput) {
  return run("Du har ikke tilgang til å opprette faggrupper.", async () => {
    const group: Faggruppe = await (
      await backendFetch("/api/faggrupper", { method: "POST", body: JSON.stringify(input) })
    ).json();
    revalidatePath("/faggrupper");
    return group;
  });
}

export async function updateFaggruppe(id: string, input: FaggruppeInput) {
  return run("Du har ikke tilgang til å redigere denne faggruppen.", async () => {
    await backendFetch(`/api/faggrupper/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    revalidatePath("/faggrupper");
    revalidatePath(`/faggrupper/${id}`);
    return null;
  });
}

export async function deleteFaggruppe(id: string) {
  return run("Du har ikke tilgang til å slette denne faggruppen.", async () => {
    await backendFetch(`/api/faggrupper/${encodeURIComponent(id)}`, { method: "DELETE" });
    revalidatePath("/faggrupper");
    return null;
  });
}

export async function addFaggruppeEier(id: string, epost: string) {
  return run("Du har ikke tilgang til å administrere eiere.", async () => {
    const eier: { epost: string; navn: string | null } = await (
      await backendFetch(`/api/faggrupper/${encodeURIComponent(id)}/eiere`, {
        method: "POST",
        body: JSON.stringify({ epost }),
      })
    ).json();
    revalidatePath(`/faggrupper/${id}`);
    return eier;
  });
}

export async function removeFaggruppeEier(id: string, epost: string) {
  return run("Du har ikke tilgang til å administrere eiere.", async () => {
    await backendFetch(
      `/api/faggrupper/${encodeURIComponent(id)}/eiere/${encodeURIComponent(epost)}`,
      { method: "DELETE" },
    );
    revalidatePath(`/faggrupper/${id}`);
    return null;
  });
}
