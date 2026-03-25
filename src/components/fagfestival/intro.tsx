"use client";
import {Accordion} from "@navikt/ds-react";
import Link from "next/link";

export default function Intro() {
    return (
        <>
            <Accordion className="mb-0 fagfest-intro-accordion">
                <Accordion.Item>
                    <Accordion.Header>
                        Hvordan navigere i programmet?
                    </Accordion.Header>
                    <Accordion.Content>
                        <div className="prose">
                            <p>Du får oversikt over hva som skjer på de ulike dagene ved å klikke på datoene under. Innlegg og workshops er fordelt på dato, men tid og rom kommer senere.</p>
                            <p>Dersom du er interessert i et foredrag kan du klikke deg inn for å få mer informasjon om hva foredraget handler om og hvem som står på scenen.</p>
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
                            <p>Du kan selv melde deg på så mange faglige innlegg du ønsker. På alt innhold
                                (utenom
                                workshops) som foregår på fagfestivalen er det opp til hver enkelt å sikre
                                seg en
                                stol i rommet. Dersom alle sitteplasser skulle være tatt vil det være mulig
                                å
                                benytte seg av ståplasser, så fremst dette ikke er til hinder for selve
                                presentasjonen eller nødutganger.</p>
                            <p>Når det gjelder workshops vil det være et begrenset antall plasser på disse.
                                Her er
                                det «første-mann-til-mølla»-prinsippet som gjelder.</p>
                        </div>
                    </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item>
                    <Accordion.Header>
                        Spørsmål? Kontakt komitéen
                    </Accordion.Header>
                    <Accordion.Content>
                        <div className="prose">
                            <p>Kontakt komitéen på <Link href="mailto:fagfestival@nav.no" className="text-ax-brand-blue-600 underline hover:no-underline">fagfestival@nav.no</Link>, eller <Link href="https://nav-it.slack.com/archives/C0AC90UBT7X" className="text-ax-brand-blue-600 underline hover:no-underline">#fagfest-2026 (Slack)</Link>.</p>
                            <p>For detaljer <Link href="https://navno.sharepoint.com/sites/enhet-arbeids-og-velferdsdirektoratet/SitePages/Fagfest.aspx" className="text-ax-brand-blue-600 underline hover:no-underline">se fagfestivalens side på Navet</Link>.</p>
                            <p>Fagfesten samler Mind the Gap, Juridisk fagdag og husfesten til en felles kompetanseutviklingsfest for alle i direktoratet. Mulighetskonferansen går også parallelt med fagfesten, og vil være mulig å få med seg i våre lokaler.</p>
                            <p>Målet er å gi alle dere kompetansepåfyll og inspirasjon, og bidra til styrket samarbeidskultur. Vi vil at alle skal lære om andres fagområder og få til et bedre med tverrfaglig samarbeid i direktoratet.</p>
                        </div>
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion>
        </>
    );
}
