import CardWithBackground from "@/components/cardWithBackground";
import { fagtorsdagConfig } from "@/components/festival/festivalConfig";
import FestivalEventsSection from "@/components/festival/festivalEventsSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fagtorsdag Δ Delta",
  description: "Påmeldingsapp",
};

export default async function FagtorsdagPage() {

  return (
    <div className="flex flex-col w-full pb-10 colorful_fagtorsdag">
      <div className="w-full">
        <CardWithBackground
          newEvent
          title="Fagtorsdag"
          backLink="/"
          titleColor="#021841"
        >
          <FestivalEventsSection config={fagtorsdagConfig} />
        </CardWithBackground>
      </div>
    </div>
  );
}

