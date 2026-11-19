import CardWithBackground from "@/components/cardWithBackground";
import { Loader } from "@navikt/ds-react";

export default function Loading() {
  return (
    <CardWithBackground title="Delta">
      <div className="flex flex-col items-center justify-center py-20 space-y-4 w-full max-w-xl mx-auto">
        <Loader size="2xlarge" title="Laster statistikk" />
        <p className="text-lg">Henter statistikk.</p>
      </div>
    </CardWithBackground>
  );
}
