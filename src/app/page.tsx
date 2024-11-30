import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFilters";

export default async function Home(context: any) {
  await checkToken("/");

  return (
      <>
        <head>
          <title>Delta Δ Nav</title>
        </head>
        <CardWithBackground
            title="Arrangementer"
            newEvent
        >
          <EventFilters selectCategory searchName homeTabs ctaLink joinedLink selectTimeRadio />
        </CardWithBackground>
      </>
  );
}