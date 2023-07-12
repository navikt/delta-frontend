"use server";

import { getAuthlessApi } from "@/api/instance";
import { getUser } from "@/auth/token";

export async function joinEvent(formData: FormData) {
  const user = getUser();
  const api = getAuthlessApi();
  const response = await api.post(`/event/${formData.get("id")}`, {
    email: user.email,
  });
  console.log(response.status);
}
