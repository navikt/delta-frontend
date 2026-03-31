import { Skeleton } from "@navikt/ds-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center w-full max-w-[80rem] mx-auto px-4 py-8 gap-4">
      <Skeleton variant="rounded" width="100%" height={60} />
      <div className="grid grid-cols-1 ax-md:grid-cols-3 gap-4 w-full">
        <Skeleton variant="rounded" height={200} />
        <Skeleton variant="rounded" height={200} />
        <Skeleton variant="rounded" height={200} />
      </div>
    </div>
  );
}
