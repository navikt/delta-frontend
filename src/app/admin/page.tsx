import CardWithBackground from "@/components/cardWithBackground";
import { getAdminStatistics } from "@/service/admin";
import type { InviteMode } from "@/types/event";
import { BodyLong, Heading, VStack } from "@navikt/ds-react";
import {
  Table, TableBody, TableDataCell, TableHeader, TableHeaderCell, TableRow,
} from "@navikt/ds-react/Table";
import { formatInTimeZone } from "date-fns-tz";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administrasjon Δ Delta",
  robots: { index: false, follow: false },
};

const labels: Record<InviteMode, string> = {
  PER_PARTICIPANT: "Eldre kalendermodell",
  SHARED: "Felles kalenderinvitasjon",
};

export default async function AdminPage() {
  const statistics = await getAdminStatistics();

  return (
    <CardWithBackground title="Administrasjon" compactHeader>
      <VStack gap="space-24">
        <section aria-labelledby="calendar-statistics">
          <Heading id="calendar-statistics" level="2" size="medium" spacing>
            Kalendermodeller
          </Heading>
          <BodyLong spacing>
            Følg overgangen fra én kalenderinvitasjon per deltaker til én felles
            invitasjon for hele arrangementet.
          </BodyLong>
          <div className="overflow-x-auto">
            <Table>
              <caption className="sr-only">Antall arrangementer per kalendermodell</caption>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell scope="col">Kalendermodell</TableHeaderCell>
                  <TableHeaderCell scope="col">Alle lagrede</TableHeaderCell>
                  <TableHeaderCell scope="col">Kommende og pågående</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statistics.eventTypes.map((type) => (
                  <TableRow key={type.inviteMode}>
                    <TableHeaderCell scope="row">{labels[type.inviteMode]}</TableHeaderCell>
                    <TableDataCell>{type.total.toLocaleString("nb-NO")}</TableDataCell>
                    <TableDataCell>{type.upcomingOrOngoing.toLocaleString("nb-NO")}</TableDataCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
        <BodyLong>
          Tallene inkluderer offentlige og private arrangementer. Hver forekomst
          i en gjentakende serie telles som ett arrangement. Kommende og pågående
          arrangementer har en sluttid som er senere enn tidspunktet tallene ble hentet.
        </BodyLong>
        <BodyLong>
          Når det ikke er flere kommende eller pågående arrangementer med den eldre
          kalendermodellen, gjenstår bare historiske arrangementer. Disse må også
          håndteres før vi kan fjerne all kode for den eldre modellen.
        </BodyLong>
        <BodyLong>
          Hentet {formatInTimeZone(statistics.generatedAt, "Europe/Oslo", "dd.MM.yyyy 'kl.' HH:mm:ss")}.
          {" "}Last inn siden på nytt for å hente oppdaterte tall.
        </BodyLong>
      </VStack>
    </CardWithBackground>
  );
}
