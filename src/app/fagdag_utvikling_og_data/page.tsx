import CardWithBackground from "@/components/cardWithBackground";
import { fagdagUtviklingOgDataConfig } from "@/components/festival/festivalConfig";
import FestivalEventsSection from "@/components/festival/festivalEventsSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fagdag Utvikling og Data Δ Delta",
  description: "Påmeldingsapp",
};

export default async function FagdagUtviklingOgDataPage() {

  return (
    <div className="flex flex-col w-full pb-10 colorful_fagdag_utvikling_og_data">
      <div className="w-full">
        <CardWithBackground
          newEvent
          title="Fagdag Utvikling og Data"
          backLink="/"
          titleColor="#021841"
        >
          <FestivalEventsSection config={fagdagUtviklingOgDataConfig} />
        </CardWithBackground>
      </div>
    </div>
  );
}
