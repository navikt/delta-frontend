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
    <>
      <div className="flex flex-col w-full colorful pb-10 -mb-4">
        <div className="w-full relative z-20">
          <CardWithBackground
            title="Pride"
            titleColor="#021841"
            className="bg-fagfestival"
            newEvent
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
        </div>
      </div>
    </>
  );
}
