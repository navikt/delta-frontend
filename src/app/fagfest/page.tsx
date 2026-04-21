import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import "./fagfestival.css";
import Image from "next/image";

import { Metadata } from "next";
import Intro from "@/components/fagfestival/intro";
import FagfestivalEvents from "@/components/fagfestival/fagfestivalEvents";

export const metadata: Metadata = {
  title: "Fagfest Δ Delta",
  description: "Påmeldingsapp",
};

export default async function Fagfestival() {
  await checkToken("/fagfest");

  return (
    <>
      <div className="flex flex-col w-full bg-fagfestival pb-10 -mb-4">
        <div className="w-full relative z-20">
          <CardWithBackground
            compactHeader
            titleNode={
              <div className="pt-12 pb-10 ax-sm:pt-16 ax-sm:pb-12">
                <Image
                  src="/fagfest/Fagfest_Blue_Clean_Cropped.svg"
                  alt="Fagfest 2026"
                  width={520}
                  height={170}
                  className="w-[190px] ax-sm:w-[320px] h-auto block [filter:brightness(0)_invert(1)]"
                  priority
                />
              </div>
            }
            className="bg-fagfestival"
            backLink="/"
          >
            <div className="mx-3 mt-1 mb-0 font-serif">
              <Intro />
            </div>
          </CardWithBackground>
        </div>

        <div className="w-full -mt-28 relative z-10">
          <CardWithBackground className="bg-fagfestival" newEvent>
            <FagfestivalEvents
              category="fagfest"
              activeDays={["28", "29", "30"]}
              month="April"
              slug="fagfest"
            />
          </CardWithBackground>
        </div>
      </div>
    </>
  );
}
