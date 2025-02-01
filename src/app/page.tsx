import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFilters";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Delta Δ Nav',
};

export default async function Home(context: any) {
  await checkToken("/");

  return (
    <CardWithBackground
        title="Arrangementer"
        newEvent
    >
      <EventFilters selectCategory searchName homeTabs ctaLink joinedLink selectTimeRadio />
    </CardWithBackground>
  );
}