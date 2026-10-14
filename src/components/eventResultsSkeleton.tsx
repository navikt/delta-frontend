import { BodyShort, Skeleton } from "@navikt/ds-react";

export default function EventResultsSkeleton() {
  return (
    <div className="w-full p-4" aria-busy="true">
      <BodyShort role="status" className="pb-4">Laster arrangementer …</BodyShort>
      <div aria-hidden="true" className="grid grid-cols-1 ax-md:grid-cols-3 gap-4">
        {["first", "second", "third"].map(key =>
          <Skeleton key={key} variant="rounded" className="h-72 w-full" />,
        )}
      </div>
    </div>
  );
}
