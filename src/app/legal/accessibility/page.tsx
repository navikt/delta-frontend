import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFilters";
import { getEvents } from "@/service/eventActions";
import Link from "next/link";

export default async function Accessibility() {
  await checkToken("/legal/accessibility");
  const events = await getEvents({ onlyMine: true });

  return (
    <CardWithBackground
      color="bg-blue-200"
      title="Tilgjengelighetserklæring"
      backLink="/"
    >
      <div className="m-4 max-w-2xl font-serif">
        <h2 className="pb-4 text-2xl">Tilgjengelighetserklæring for Delta</h2>
        <p className="mb-4 leading-normal">NAVs påmeldingsløsning for interne arrangementer (Delta) skal være tilgjengelig for alle. Det betyr at vi har som mål å følge lovpålagte krav til universell utforming. Vår ambisjon er i tillegg at du skal ha en god brukeropplevelse enten du bruker hjelpeteknologi (for eksempel skjermleser) eller ikke.</p>

        <p className="mb-4 leading-normal">Alle virksomheter i offentlig sektor skal ha en tilgjengelighetserklæring. WCAG 2.1 på nivå AA er lovpålagt i Norge. Erklæringen beskriver hvert suksesskriterium i WCAG, og om nettstedet imøtekommer disse kravene.</p>

        <Link className="mb-4 leading-normal text-deepblue-500 underline hover:no-underline" href="https://uustatus.no/nb/erklaringer/publisert/eccc5189-b976-4970-bbf8-b5bcf52a4b10">Tilgjengelighetserklæring for delta.nav.no.</Link>

        <h2 className="pb-4 pt-4 text-2xl">Feil, mangler og forbedringsforslag</h2>
        <p className="leading-normal">Hvis du opplever problemer eller har forslag til forbedringer hører vi veldig gjerne fra deg! Feil og mangler kan rapporteres til eilif.johansen@nav.no, eller #delta på Slack.</p>
      </div>
    </CardWithBackground>
  );
}



