import { getAuthlessApi } from "@/api/instance";
import EventList from "@/components/eventList";
import { DeltaEvent } from "@/types/event";

export default async function Home() {
  const api = getAuthlessApi();
  var events: DeltaEvent[] = (await api.get("/event")).data;

  return (
    <main className="flex flex-grow">
      <section className="w-screen flex-grow flex justify-center items-center">
        <EventList events={events} />
      </section>
    </main>
  );
}
