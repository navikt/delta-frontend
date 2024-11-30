import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFilters";
import { Metadata } from "next";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Delta Δ Nav",
  description: "Påmeldingsapp",
};

export default async function Home(context: any) {
  await checkToken("/");

  return (
      <>
        <Head>
          <title>Delta Δ Nav</title>
        </Head>
        <CardWithBackground
            title="Arrangementer"
            newEvent
        >
          <EventFilters selectCategory searchName homeTabs ctaLink joinedLink selectTimeRadio />
        </CardWithBackground>
      </>
  );
}