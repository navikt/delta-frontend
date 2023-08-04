import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFilters";
import { getEvents } from "@/service/eventActions";

export default async function MyEvents() {
  const events = await getEvents({ onlyMine: true });

  return (
    <CardWithBackground
      color="bg-blue-200"
      title="Mine arrangementer"
      backLink="/"
    >
      <EventList fullEvents={events} loading={false}></EventList>
    </CardWithBackground>
  );
}
