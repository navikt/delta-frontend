import EventList from "@/components/eventList";
import { backendUrl } from "@/toggles/utils";
import { DeltaEvent } from "@/types/event";

export default async function Home() {
  
  var events: DeltaEvent[] = [];
  // TODO: fiks meg når vi får backend opp å kjøre lokalt!
  if(backendUrl() === "http://delta-backend") { 
    const response = await fetch(`${backendUrl()}/event`, {
       next: { revalidate: 0 },
    });

    events = await response.json();
  } else {
    events = [
      {
        title: "hallo",
        description: "hallo!",
        id: 1,
        ownerEmail: "kent.daleng@nav.no",
        startTime: "2023-07-07T12:36:00Z",
        endTime: "2023-07-07T15:30:00Z"
      },
      {
        title: "hallo en gang til",
        description: "hallo!",
        id: 2,
        ownerEmail: "kent.daleng@nav.no",
        startTime: "2023-07-07T12:36:00Z",
        endTime: "2023-07-07T15:30:00Z"
      },
      {
        title: "hallo enda en gang",
        description: "hallo!",
        id: 3,
        ownerEmail: "kent.daleng@nav.no",
        startTime: "2023-07-07T12:36:00Z",
        endTime: "2023-07-07T12:36:00Z"
      },
      {
        title: "hallo en siste gang",
        description: "hallo!",
        id: 4,
        ownerEmail: "kent.daleng@nav.no",
        startTime: "2023-07-07T12:36:00Z",
        endTime: "2024-07-09T15:30"
      }
    ]
  }

  return (
    <main className="flex flex-grow">
      <section className="w-screen flex-grow flex justify-center items-center">
        <EventList events={events} />
      </section>
    </main>
  );
}
