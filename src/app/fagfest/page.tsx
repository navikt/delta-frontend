import { checkToken } from "@/auth/token";
import CardWithBackgroundFagfestival from "@/components/fagfestival/cardWithBackground";
import EventFilters from "@/components/fagfestival/eventFilters";
import {getEvents} from "@/service/eventActions";

import { Metadata } from "next";
import Intro from "@/components/fagfestival/intro";
export const metadata: Metadata = {
    title: "FAGFST Δ Delta",
    description: "Påmeldingsapp",
};

export default async function Fagfestival() {
    await checkToken("/fagfest");
    const events = await getEvents({ onlyMine: true });
    return (
        <>
            <div className="flex flex-col w-full bg-fagfestival  pb-10" >
                <div className="w-full">
                    <CardWithBackgroundFagfestival
                        color="bg-blue-200"
                        title="FAGFEST 2024"
                        backLink="/"
                    >
                        <div className="m-4  font-serif">
                            <Intro />
                        </div>
                    </CardWithBackgroundFagfestival>
                </div>

                <div className="w-full -mt-28">
                    <CardWithBackgroundFagfestival
                        color="bg-blue-200"
                        title=""
                        newEvent
                    >
                        <EventFilters  searchName homeTabs/>
                    </CardWithBackgroundFagfestival>
                </div>
            </div>
        </>
    );
}