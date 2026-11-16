import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import "@/components/fagfestival/fagfestival.css";
import Image from "next/image";

import { Metadata } from "next";
import Intro from "@/components/fagfestival/intro";
import FagfestivalEvents from "@/components/fagfestival/fagfestivalEvents";
import type { OverviewSearchParams } from "@/service/overviewState";

export const metadata: Metadata = {
  title: "Fagfest Δ Delta",
  description: "Påmeldingsapp",
};

export default async function Fagfestival({ searchParams }: { searchParams: Promise<OverviewSearchParams> }) {
  await checkToken("/fagfest");

  return (
    <CardWithBackground
      titleNode={
        <h1>
          <Image
            src="/fagfest/Fagfest_Blue_Clean_Cropped.svg"
            alt="Fagfest 2026"
            width={520}
            height={170}
            className="w-[190px] ax-sm:w-[320px] h-auto block"
            priority
          />
        </h1>
      }
      backText="Arrangementer"
      backLink="/"
    >
      <div className="font-serif mb-6">
        <Intro />
      </div>
      <FagfestivalEvents
        searchParams={searchParams}
        category="fagfest"
        activeDays={["28", "29", "30"]}
        month="April"
        slug="fagfest"
      />
    </CardWithBackground>
  );
}
