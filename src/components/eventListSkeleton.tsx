import { Skeleton } from "@navikt/ds-react";

export default function EventListSkeleton() {
  return (
    <div className="w-full p-4">
      <div className="grid grid-cols-1 ax-md:grid-cols-3 gap-4">
        <Skeleton variant="rounded" height={220} />
        <Skeleton variant="rounded" height={220} />
        <Skeleton variant="rounded" height={220} />
        <Skeleton variant="rounded" height={220} />
        <Skeleton variant="rounded" height={220} />
        <Skeleton variant="rounded" height={220} />
      </div>
    </div>
  );
}
