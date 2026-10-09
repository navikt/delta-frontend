"use client";

import CardWithBackground from "@/components/cardWithBackground";
import { BodyLong, Button, VStack } from "@navikt/ds-react";

export default function AdminError() {
  return (
    <CardWithBackground title="Administrasjon" compactHeader>
      <VStack gap="space-24" align="start">
        <BodyLong role="alert">
          Kunne ikke hente statistikken. Prøv å laste inn siden på nytt.
        </BodyLong>
        <Button onClick={() => window.location.reload()}>Last inn på nytt</Button>
      </VStack>
    </CardWithBackground>
  );
}
