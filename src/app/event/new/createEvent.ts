"use server";

import { getDeltaBackendAccessToken } from "@/auth/token";
import { backendUrl } from "@/toggles/utils";
import type { CreateDeltaEvent } from "@/types/event";

export async function createEvent(formData: FormData) {
  const accessToken = await getDeltaBackendAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (accessToken !== null) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${backendUrl()}/admin/event`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      title: getFormDataString(formData, "title"),
      description: getFormDataString(formData, "description"),
      startTime: getFormDataString(formData, "startTime"),
      endTime: getFormDataString(formData, "endTime"),
    } satisfies CreateDeltaEvent),
  });

  console.log(response.status);
}

function getFormDataString(formData: FormData, key: string): string {
  return formData.get(key)?.toString() ?? "";
}
