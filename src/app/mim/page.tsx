import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import "./fagfestival.css";

import { Metadata } from "next";
import { Heading } from "@navikt/ds-react";
import FagfestivalEvents from "@/components/fagfestival/fagfestivalEvents";

export const metadata: Metadata = {
  title: "Mangfold i mai Δ Delta",
  description: "Påmeldingsapp",
};

export default async function Fagfestival() {
  await checkToken("/fagfest");

  return (
    <>
      <div className="flex flex-col w-full colorful pb-10 -mb-4">
        <div className="w-full relative z-20">
          <div className="mt-8 mb-6 px-4 ax-sm:px-12 max-w-[80rem] mx-auto w-full">
            <Heading level="1" size="xlarge" style={{ color: "#021841" }}>
              Mangfold i mai
            </Heading>
          </div>
        </div>

        <div className="w-full -mt-28 relative z-10">
          <CardWithBackground className="bg-fagfestival" newEvent>
            <FagfestivalEvents
              category="mim"
              activeDays={["20", "21"]}
              month="mai"
            />
          </CardWithBackground>
        </div>
      </div>
    </>
  );
}
