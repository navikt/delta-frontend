"use server";

import { getAuthApi } from "@/api/instance";
import { redirect } from "next/navigation";

export async function createEvent(formData: FormData) {
  const api = await getAuthApi();
  const response = await api.put("/admin/event", {
    title: getFormDataString(formData, "title"),
    description: getFormDataString(formData, "description"),
    startTime: getFormDataString(formData, "startTime"),
    endTime: getFormDataString(formData, "endTime"),
  });
  redirect(`/event/${response.data.id}`);
}

function getFormDataString(formData: FormData, key: string): string {
  return formData.get(key)?.toString() ?? "";
}
