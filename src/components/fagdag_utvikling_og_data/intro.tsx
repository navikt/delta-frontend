"use client";
import {Accordion} from "@navikt/ds-react";
import Link from "next/link";

export default function Intro() {
    return (
        <>
            <Accordion className="mb-0">
                <Accordion.Item>
                    <Accordion.Header>
                        Hvordan navigere i programmet?
                    </Accordion.Header>
                    <Accordion.Content>
                        <div className="prose">
                            <p>Du får oversikt over hva som skjer på de ulike dagene ved å klikke på datoene
                                under.</p>
                            <p>Dersom du er interessert i et foredrag kan du klikke deg inn for å få mer
                                informasjon
                                om hva foredraget handler om og hvem som står på scenen.</p>
                        </div>
                    </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item>
                    <Accordion.Header>
                        Hvordan melde meg på aktiviteter?
                    </Accordion.Header>
                    <Accordion.Content>
                        <div className="prose">
                            <p>Du kan bruke «Bli med»-knappen som du finner øverst
                                til høyre
                                hjørne på hvert arrangement for å melde deg på. Da vil du automatisk få tilsendt en
                                kalenderinvitasjon
                                til din innboks. I tillegg vil du enkelt kunne holde oversikten over dine
                                påmeldinger under «Mine påmeldinger» her på Delta.</p>
                        </div>
                    </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item>
                    <Accordion.Header>
                        Spørsmål? Kontakt komitéen
                    </Accordion.Header>
                    <Accordion.Content>
                        <div className="prose">
                            <p>Kontakt komitéen på <Link
                                href="mailto:uu@nav.no"
                                className="text-deepblue-500 underline hover:no-underline">uu@nav.no</Link>,
                                eller <Link
                                    href="https://nav-it.slack.com/archives/C0387QZ64M6"
                                    className="text-deepblue-500 underline hover:no-underline">#mangfold-i-mai
                                    (Slack)</Link>.</p>

                            <p>For detaljer <Link
                                href="https://mangfoldimai.no/mangfold-i-mai/"
                                className="text-deepblue-500 underline hover:no-underline">mangfoldimai.no</Link>.</p>

                        </div>
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion>
        </>
    );
}
