"use server";

import { getAccessToken } from "@/auth/token";
import { backendUrl } from "@/toggles/utils";

export type DeltaEvent = {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
};

export async function createEvent(formData: FormData) {
  const accessToken = await getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (accessToken !== null) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${backendUrl()}/event`, {
    method: "PUT",
    headers,
    //TODO:det her er ikke bra nok
    body: JSON.stringify({
      title: formData.get("title")?.toString() ?? "",
      description: formData.get("description")?.toString() ?? "",
      startTime: formData.get("startTime")?.toString() ?? "",
      endTime: formData.get("endTime")?.toString() ?? "",
    } satisfies DeltaEvent),
  });

  console.log(response.status);
}
