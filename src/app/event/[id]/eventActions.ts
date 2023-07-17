"use server";

import { getAuthApi } from "@/api/instance";

export async function joinEvent(formData: FormData) {
  const api = await getAuthApi();
  const response = await api.post(`/user/event/${formData.get("id")}`);
}

export async function leaveEvent(formData: FormData) {
  const api = await getAuthApi();
  const response = await api.delete(`/user/event/${formData.get("id")}`);
}

export async function deleteEvent(formDate: FormData) {
  const api = await getAuthApi();
  await api.delete(`/admin/event/${formDate.get("id")}`);
}
