import { getAuthlessApi } from "@/api/instance";
import { checkToken } from "@/auth/token";
import type { DeltaEvent } from "@/types/event";

export default async function Events() {
  await checkToken("/event");
  const api = getAuthlessApi();
  const events: DeltaEvent[] = (await api.get("/event")).data;

  return (
    <div>
      {events.map((event) => (
        <div key={event.id}>
          {event.title}, {event.ownerEmail}, {event.startTime}
        </div>
      ))}
    </div>
  );
}
