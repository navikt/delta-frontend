import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import "./fagfestival.css";

import { Metadata } from "next";
import Intro from "@/components/fagfestival/intro";
import FagfestivalEvents from "@/components/fagfestival/fagfestivalEvents";

export const metadata: Metadata = {
  title: "FAGFST Δ Delta",
  description: "Påmeldingsapp",
};

export default async function Fagfestival() {
  await checkToken("/fagfest");

  return (
    <>
      <div className="flex flex-col w-full bg-fagfestival  pb-10 ">
        <div className="w-full">
          <CardWithBackground
            title="FAGFEST 2024"
            titleColor="#ec38a7"
            className="bg-fagfestival"
            backLink="/"
          >
            <div className="m-4  font-serif">
              <Intro />
            </div>
          </CardWithBackground>
        </div>

        <div className="w-full -mt-28">
          <CardWithBackground className="bg-fagfestival" newEvent>
            <FagfestivalEvents />
          </CardWithBackground>
        </div>
      </div>
    </>
  );
}
