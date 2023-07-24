import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventListSwitcher from "@/components/eventListSwitcher";
import { getMyEvents, getEvents, getJoinedEvents } from "@/service/eventActions";

export default async function Home(context: any) {
  await checkToken();

  const all = await getEvents();
  const my = await getMyEvents();
  const joined = await getJoinedEvents();

  return (
    <CardWithBackground color="bg-blue-200" title="Arrangementer" newEvent>
      <EventListSwitcher all={all} my={my} joined={joined} />
    </CardWithBackground>
  );
}
