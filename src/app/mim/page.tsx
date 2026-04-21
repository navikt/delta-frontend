import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import "./fagfestival.css";

import { Metadata } from "next";
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
          <CardWithBackground
            title="Mangfold i mai"
            titleColor="#021841"
            className="bg-fagfestival"
            newEvent
          >
            <FagfestivalEvents
              category="mim"
              activeDays={["20", "21"]}
              month="mai"
              slug="mim"
            />
          </CardWithBackground>
        </div>
      </div>
    </>
  );
}
