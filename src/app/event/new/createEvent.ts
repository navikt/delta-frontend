"use server";

import { getAuthApi } from "@/api/instance";

export async function createEvent(formData: FormData) {
  const api = await getAuthApi();
  const response = await api.put("/admin/event", {
    title: getFormDataString(formData, "title"),
    description: getFormDataString(formData, "description"),
    startTime: getFormDataString(formData, "startTime"),
    endTime: getFormDataString(formData, "endTime"),
  });

  console.log(response.status);
}

function getFormDataString(formData: FormData, key: string): string {
  return formData.get(key)?.toString() ?? "";
}
