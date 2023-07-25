import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventListSwitcher from "@/components/eventListSwitcher";

export default async function Home(context: any) {
  await checkToken();

  return (
    <CardWithBackground color="bg-blue-200" title="Arrangementer" newEvent>
      <EventListSwitcher />
    </CardWithBackground>
  );
}
