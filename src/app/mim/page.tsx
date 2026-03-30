import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import { mimConfig } from "@/components/festival/festivalConfig";
import FestivalEventsSection from "@/components/festival/festivalEventsSection";
import Intro from "@/components/mim/intro";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mangfold i mai Δ Delta",
  description: "Påmeldingsapp",
};

export default async function MimPage() {
  await checkToken("/mim");

  return (
    <div className="flex flex-col w-full pb-10 colorful">
      <div>
        <CardWithBackground
          title="Mangfold i mai"
          backLink="/"
          titleColor="#021841"
        >
          <div className="m-4 font-serif">
            <Intro />
          </div>
        </CardWithBackground>
      </div>

      <div className="w-full -mt-28">
        <CardWithBackground newEvent>
          <FestivalEventsSection config={mimConfig} />
        </CardWithBackground>
      </div>
    </div>
  );
}
