import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import "./fagfestival.css";

import { Metadata } from "next";
import Intro from "@/components/fagdag_utvikling_og_data/intro";
import FestivalEvents from "@/components/fagdag_utvikling_og_data/festivalEvents";

export const metadata: Metadata = {
  title: "Fagdag Utvikling og Data D Δ Delta",
  description: "Påmeldingsapp",
};

export default async function Fagfestival() {
  await checkToken("/fagdag_utvikling_og_data");

  return (
    <>
<div className="flex flex-col w-full  pb-10 colorful_fagdag_utvikling_og_data">
  {/*      <div>
          <CardWithBackground
            title="Fagdag Utvikling og Data"
            backLink="/"
            titleColor={"#021841"}
          >
            <div className="m-4  font-serif">
              <Intro />
            </div>
          </CardWithBackground>
        </div>*/}

        <div className="w-full">
          <CardWithBackground
              newEvent
              title="Fagdag Utvikling og Data"
              backLink="/"
              titleColor={"#021841"}
          >
            <FestivalEvents />
          </CardWithBackground>
        </div>
      </div>
    </>
  );
}
