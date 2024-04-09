import { checkToken } from "@/auth/token";
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
            <div className="flex flex-col w-full" >
                <div className="w-full">
                    <CardWithBackgroundFagfestival
                        color="bg-blue-200"
                        title="Fagfestival 2024"
                        backLink="/"
                    >
                        <div className="m-4 max-w-2xl font-serif">
                            <h2 className="pb-4 text-2xl">Hvordan navigere i programmet?</h2>
                            <div className="prose">
                                <p>Du får oversikt over hva som skjer på de ulike dagene ved å klikke på datoene
                                    under.</p>
                                <p>Dersom du er interessert i et foredrag kan du klikke deg inn for å få mer informasjon
                                    om hva foredraget handler om og hvem som står på scenen.</p>
                                <p>Når det gjelder workshops vil det være et begrenset antall plasser på disse. Her er
                                    det «første-mann-til-mølla»-prinsippet som gjelder.</p>
                                <p>Videre oppfordrer vi deg til å bruke «Bli med»-knappen som du finner øverst til høyre
                                    hjørne på hvert arrangement. Da vil du automatisk få tilsendt en kalenderinvitasjon
                                    til din innboks. I tillegg vil du enkelt kunne holde oversikten over dine
                                    påmeldinger under «Mine påmeldinger» her på Delta.</p>
                                <p>Du kan selv melde deg på så mange faglige innlegg du ønsker. På alt innhold (utenom
                                    workshops) som foregår på fagfestivalen er det opp til hver enkelt å sikre seg en
                                    stol i rommet. Dersom alle sitteplasser skulle være tatt vil det være mulig å
                                    benytte seg av ståplasser, så fremst dette ikke er til hinder for selve
                                    presentasjonen eller nødutganger.</p>
                            </div>
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