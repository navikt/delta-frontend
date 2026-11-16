import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import "@/components/fagfestival/fagfestival.css";

import { Metadata } from "next";
import FagfestivalEvents from "@/components/fagfestival/fagfestivalEvents";
import type { OverviewSearchParams } from "@/service/overviewState";

export const metadata: Metadata = {
  title: "Pride Δ Delta",
  description: "Påmeldingsapp",
};

export default async function Fagfestival({ searchParams }: { searchParams: Promise<OverviewSearchParams> }) {
  await checkToken("/pride");

  return (
    <CardWithBackground
      title="Pride"
    >
      <FagfestivalEvents
        searchParams={searchParams}
        category="pride"
        month="jun"
        slug="pride"
        showProgramOverviewCheckbox={false}
        combineDays
      />
    </CardWithBackground>
  );
}
