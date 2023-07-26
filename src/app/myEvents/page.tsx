import CardWithBackground from "@/components/cardWithBackground";
import EventList from "@/components/eventList";
import { getEvents } from "@/service/eventActions";
import { DeltaEvent } from "@/types/event";

export default async function MyEvents() {
  var events: DeltaEvent[] = await getEvents({ onlyMine: true });

  return (
    <CardWithBackground color="bg-blue-200" title="Mine arrangementer">
      <EventList events={events} loading={false}></EventList>
    </CardWithBackground>
  );
}
