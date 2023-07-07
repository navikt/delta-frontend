import EventList from "@/components/eventList";
import { backendUrl } from "@/toggles/utils";
import { DeltaEvent } from "@/types/event";

export default async function Home() {
  
  const response = await fetch(`${backendUrl()}/event`, {
    next: { revalidate: 0 },
  });

  const events: DeltaEvent[] = await response.json();


  return (
    <main className="flex flex-grow">
      <section className="w-screen flex-grow flex justify-center items-center">
        <EventList events={events} />
      </section>
    </main>
  );
}
