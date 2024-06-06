import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import "./fagfestival.css";

import { Metadata } from "next";
import Intro from "@/components/fagtorsdag/intro";
import FestivalEvents from "@/components/fagtorsdag/festivalEvents";

export const metadata: Metadata = {
  title: "Fagtorsdag Δ Delta",
  description: "Påmeldingsapp",
};

export default async function Fagfestival() {
  await checkToken("/fagtorsdag");

  return (
    <>
<div className="flex flex-col w-full  pb-10 colorful_fagtorsdag">
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
              title="Fagtorsdag"
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
