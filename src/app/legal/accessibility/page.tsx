import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFilters";
import { getEvents } from "@/service/eventActions";

export default async function Accessibility() {
  await checkToken("/legal/accessibility");
  const events = await getEvents({ onlyMine: true });

  return (
    <CardWithBackground
      color="bg-blue-200"
      title="Tilgjengelighetserklæring"
      backLink="/"
    >
      <div className="m-4 max-w-2xl">
        <h2 className="pb-4 text-2xl">Tilgjengelighetserklæring for Delta</h2>
        <p className="mb-4">NAVs påmeldingsløsning for interne arrangementer (Delta) skal være tilgjengelig for alle. Det betyr at vi har som mål å følge lovpålagte krav til universell utforming. Vår ambisjon er i tillegg at du skal ha en god brukeropplevelse enten du bruker hjelpeteknologi (for eksempel skjermleser) eller ikke.</p>

        <p className="mb-4">Alle virksomheter i offentlig sektor skal ha en tilgjengelighetserklæring. WCAG 2.1 på nivå AA er lovpålagt i Norge. Erklæringen beskriver hvert suksesskriterium i WCAG, og om nettstedet imøtekommer disse kravene.</p>

        <p>Tilgjengelighetserklæring for delta.nav.no er under arbeid.</p>

        <h2 className="pb-4 pt-4 text-2xl">Feil, mangler og forbedringsforslag</h2>
        <p>Hvis du opplever problemer eller har forslag til forbedringer hører vi veldig gjerne fra deg! Feil og mangler kan rapporteres til eilif.johansen@nav.no, eller #delta på Slack.</p>
      </div>
    </CardWithBackground>
  );
}



