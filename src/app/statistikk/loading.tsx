import CardWithBackground from "@/components/cardWithBackground";
import { Loader } from "@navikt/ds-react";

export default function Loading() {
  return (
    <CardWithBackground title="Delta">
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader size="3xlarge" title="Laster statistikk..." />
        <p className="text-lg text-gray-600">Laster statistikk...</p>
      </div>
    </CardWithBackground>
  );
}
