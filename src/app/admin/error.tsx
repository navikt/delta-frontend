"use client";

import CardWithBackground from "@/components/cardWithBackground";
import { BodyLong, Button, VStack } from "@navikt/ds-react";

export default function AdminError({ retry }: { retry: () => void }) {
  return (
    <CardWithBackground title="Administrasjon" compactHeader>
      <VStack gap="space-24" align="start">
        <BodyLong role="alert">
          Kunne ikke hente administrasjonssiden. Prøv å laste inn siden på nytt.
        </BodyLong>
        <Button onClick={() => retry()}>Prøv igjen</Button>
      </VStack>
    </CardWithBackground>
  );
}
