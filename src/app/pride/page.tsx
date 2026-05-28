import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import "./fagfestival.css";

import { Metadata } from "next";
import FagfestivalEvents from "@/components/fagfestival/fagfestivalEvents";

export const metadata: Metadata = {
  title: "PRID Δ Delta",
  description: "Påmeldingsapp",
};

export default async function Fagfestival() {
  await checkToken("/pride");

  return (
    <>
      <div className="flex flex-col w-full colorful pb-10 -mb-4">
        <div className="w-full relative z-20">
          <CardWithBackground
            title="PRIDE"
            titleColor="#021841"
            className="bg-fagfestival"
            newEvent
          >
            <FagfestivalEvents
              category="pride"
              activeDays={["11", "17", "27"]}
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
