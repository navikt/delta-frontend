import { BodyShort } from "@navikt/ds-react";
import CardWithBackground from "@/components/cardWithBackground";
import SimulatedProgressBar from "@/components/SimulatedProgressBar";

export default function MimretidLoading() {
  return (
    <CardWithBackground title="Mimretid" subtitle="Henter mimretid...">
      <div className="flex flex-col items-center justify-center py-20 space-y-4 w-full max-w-xl mx-auto">
        <div className="w-3/4">
          <SimulatedProgressBar seconds={12} label="Laster mimretid" />
        </div>
        <BodyShort size="large">Samler arrangementene dine for valgt år.</BodyShort>
      </div>
    </CardWithBackground>
  );
}
