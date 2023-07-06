import { DeltaEvent } from "@/components/createEvent/createEvent";
import { backendUrl } from "@/toggles/utils";

export default async function Events() {
  const response = await fetch(`${backendUrl()}/event`, {
    next: { revalidate: 0 },
  });

  const events: DeltaEvent[] = await response.json();

  return (
    <div>
      {events.map((event) => (
        <div key={event.id}>
          {event.title}, {event.ownerEmail}
        </div>
      ))}
    </div>
  );
}
