"use client";
import {ExpansionCard, Accordion } from "@navikt/ds-react";

export default function Intro() {
  return (
      <>
        <Accordion>
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
                <p>Du kan  bruke «Bli med»-knappen som du finner øverst
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
        </Accordion>
        </>
  );
}
