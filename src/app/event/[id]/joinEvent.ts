import { getUser } from "@/auth/token";
import { backendUrl } from "@/toggles/utils";

export async function joinEvent(id: string) {
  const user = getUser();
  const response = await fetch(`${backendUrl()}/event/${id}`, {
    method: "POST",
    body: JSON.stringify({ email: user.email }),
  });
}
