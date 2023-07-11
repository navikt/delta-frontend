"use server";

import { getUser } from "@/auth/token";
import { backendUrl } from "@/toggles/utils";

export async function joinEvent(formData: FormData) {
  const user = getUser();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const response = await fetch(`${backendUrl()}/event/${formData.get("id")}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: user.email,
    }),
  });
  console.log(response);
}
