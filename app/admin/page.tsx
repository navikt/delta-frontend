import { backendUrl } from "@/toggles/utils";

export default async function Events() {
  const response = await fetch(`${backendUrl()}/admin/event`, {
    next: { revalidate: 0 },
  });

  const response_forReal: any = await response.text();

  return <pre>{response_forReal}</pre>;
}
