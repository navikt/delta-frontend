import { backendUrl } from "@/toggles/utils";

export default async function Events() {
  const response = await fetch(`${backendUrl()}/admin/event`, {
    next: { revalidate: 0 },
  });

  const response_forReal: any = await response.json();

  return (
    <pre>
        {JSON.stringify(response_forReal)}
    </pre>
  );
}
