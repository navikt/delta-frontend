import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import "@/components/fagfestival/fagfestival.css";

import { Metadata } from "next";
import FagfestivalEvents from "@/components/fagfestival/fagfestivalEvents";
import type { OverviewSearchParams } from "@/service/overviewState";

export const metadata: Metadata = {
  title: "Mangfold i mai Δ Delta",
  description: "Påmeldingsapp",
};

export default async function Fagfestival({ searchParams }: { searchParams: Promise<OverviewSearchParams> }) {
  await checkToken("/fagfest");

  return (
    <CardWithBackground
      title="Mangfold i mai"
    >
      <FagfestivalEvents
        searchParams={searchParams}
        category="mim"
        activeDays={["20", "21"]}
        month="mai"
        slug="mim"
      />
    </CardWithBackground>
  );
}
