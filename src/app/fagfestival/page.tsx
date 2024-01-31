import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFilters";
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
                    <CardWithBackground
                        color="bg-blue-200"
                        title="Velkomen til felles fagfestival 🎉"
                        backLink="/"
                    >
                        <div className="m-4 max-w-2xl font-serif">
                            <h2 className="pb-4 text-2xl">Felles fagfestival for direktoratet!
                            </h2>
                            <p className="mb-4 leading-normal">23.-25. april arrangeres det fagfestival i Fyrstikkalléen.</p>
                            <p className="mb-4 leading-normal">
                                Elleville foredrag - grensesprengende workshops - sprø aktiviteter - tidenes fest</p>
                        </div>
                    </CardWithBackground>
                </div>

                <div className="w-full -mt-28">
                    <CardWithBackground
                        color="bg-blue-200"
                        title=""
                        newEvent
                    >
                        <EventFilters categories={allCategories} searchName homeTabs />
                    </CardWithBackground>
                </div>
            </div>
        </>
    );
}