import { checkToken } from "@/auth/token";
import CardWithBackgroundFagfestival from "@/components/fagfestival/cardWithBackground";
import EventFilters from "@/components/fagfestival/eventFilters";
import {getAllCategories, getEvents} from "@/service/eventActions";

import { Metadata } from "next";
import Intro from "@/components/fagfestival/intro";
export const metadata: Metadata = {
    title: "Fagfestival Δ Delta",
    description: "Påmeldingsapp",
};

export default async function Fagfestival() {
    await checkToken("/fagfestival");
    const events = await getEvents({ onlyMine: true });
    const allCategories = await getAllCategories();
    return (
        <>
            <div className="flex flex-col w-full" >
                <div className="w-full">
                    <CardWithBackgroundFagfestival
                        color="bg-blue-200"
                        title="Fagfestival 2024"
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
                        <EventFilters categories={allCategories} selectCategory searchName homeTabs/>
                    </CardWithBackgroundFagfestival>
                </div>
            </div>
        </>
    );
}