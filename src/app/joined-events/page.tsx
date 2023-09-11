import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFilters";
import { getEvents } from "@/service/eventActions";

export default async function MyEvents() {
  await checkToken("/joined-events");
  const events = await getEvents({ onlyMine: true });

  return (
    <CardWithBackground
      color="bg-blue-200"
      title="Påmeldte arrangementer"
      backLink="/"
    >
      <EventFilters onlyJoined selectTime />
    </CardWithBackground>
  );
}
