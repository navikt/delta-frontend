import { DeltaEvent } from "@/components/createEvent/createEvent";

export default async function Events() {
  const response = await fetch("https://delta-backend.intern.dev.nav.no/event", {next: {revalidate: 0}});

  const events:(DeltaEvent & {id:number})[] = await response.json();
  
  return (
    <div>
      {events.map((event) => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
