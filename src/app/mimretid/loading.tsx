import { BodyShort, Loader } from "@navikt/ds-react";
import CardWithBackground from "@/components/cardWithBackground";

export default function MimretidLoading() {
  return (
    <CardWithBackground title="Mimretid" subtitle="Henter mimretid...">
      <div className="flex flex-col items-center justify-center py-20 space-y-4 w-full max-w-xl mx-auto">
        <Loader size="2xlarge" title="Laster mimretid" />
        <BodyShort size="large">Henter arrangementene dine.</BodyShort>
      </div>
    </CardWithBackground>
  );
}
