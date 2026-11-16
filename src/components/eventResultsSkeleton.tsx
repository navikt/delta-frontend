import { BodyShort, HGrid, Skeleton, VStack } from "@navikt/ds-react";

export const EVENT_GRID_COLUMNS = "repeat(auto-fill, minmax(18rem, 1fr))";

export default function EventResultsSkeleton() {
  return (
    <VStack gap="space-16" width="100%" aria-busy="true">
      <BodyShort role="status" textColor="subtle">Laster arrangementer …</BodyShort>
      <VStack gap="space-12" aria-hidden="true">
        <Skeleton variant="text" width="8rem" height="2rem" />
        <HGrid gap="space-16" columns={EVENT_GRID_COLUMNS}>
          {["first", "second", "third"].map(key =>
            <Skeleton key={key} variant="rounded" height="12rem" width="100%" />,
          )}
        </HGrid>
      </VStack>
    </VStack>
  );
}
