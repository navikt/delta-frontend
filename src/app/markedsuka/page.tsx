import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import "@/components/fagfestival/fagfestival.css";

import { Metadata } from "next";
import FagfestivalEvents from "@/components/fagfestival/fagfestivalEvents";
import type { OverviewSearchParams } from "@/service/overviewState";

export const metadata: Metadata = {
  title: "markedsuka Δ Delta",
  description: "Påmeldingsapp",
};

export default async function Fagfestival({ searchParams }: { searchParams: Promise<OverviewSearchParams> }) {
  await checkToken("/markedsuka");

  return (
    <CardWithBackground
      title="Markedsuka"
    >
      <FagfestivalEvents
        searchParams={searchParams}
        category="markedsuka"
        month="jan"
        slug="markedsuka"
        showProgramOverviewCheckbox={false}
        combineDays
      />
    </CardWithBackground>
  );
}
