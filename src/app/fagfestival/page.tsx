import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import CardWithBackgroundFagfestival from "@/components/fagfestival/cardWithBackground";
import EventFilters from "@/components/fagfestival/eventFilters";
import {getAllCategories, getEvents} from "@/service/eventActions";

import { Metadata } from "next";
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
            <div className="flex flex-col w-full">
                <div className="w-full">
                    <CardWithBackgroundFagfestival
                        color="bg-blue-200"
                        title="Felles fagfestival 🎉"
                        backLink="/"
                    >
                        <div className="m-4 max-w-2xl font-serif">
                            <h2 className="pb-4 text-2xl">Felles fagfestival for direktoratet 23.-25. april</h2>
                            <p className="leading-normal">
                                På denne siden finner du programmet og kan melde deg på aktiviteter.</p>
                        </div>
                    </CardWithBackgroundFagfestival>
                </div>

                <div className="w-full -mt-28">
                    <CardWithBackgroundFagfestival
                        color="bg-blue-200"
                        title=""
                        newEvent
                    >
                        <EventFilters categories={allCategories} homeTabs />
                    </CardWithBackgroundFagfestival>
                </div>
            </div>
        </>
    );
}