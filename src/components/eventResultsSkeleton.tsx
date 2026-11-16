import { BodyShort, HGrid, Skeleton, VStack } from "@navikt/ds-react";

// min() lets a card shrink below 18rem so the grid reflows at 320 CSS px (WCAG 1.4.10).
export const EVENT_GRID_COLUMNS = "repeat(auto-fill, minmax(min(18rem, 100%), 1fr))";

/** id of the results container that the overview view toggle controls. */
export const OVERVIEW_RESULTS_ID = "overview-results";
export const FESTIVAL_RESULTS_ID = "festival-results";

/** Pass `announce={false}` when the caller already renders a persistent ResultsStatus. */
export default function EventResultsSkeleton({ announce = true }: { announce?: boolean }) {
  return (
    <VStack gap="space-16" width="100%" aria-busy="true">
      <BodyShort role={announce ? "status" : undefined} textColor="subtle">Laster arrangementer …</BodyShort>
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
