"use server";

import { getAuthApi } from "@/api/instance";

export async function joinEvent(formData: FormData) {
  const api = await getAuthApi();
  const response = await api.post(`/event/${formData.get("id")}`);
}

export async function leaveEvent(formData: FormData) {
  const api = await getAuthApi();
  const response = await api.delete(`/event/${formData.get("id")}`);
}
