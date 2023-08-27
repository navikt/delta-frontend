import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFilters";
import { getEvents } from "@/service/eventActions";

export default async function Privacy() {
  await checkToken("/legal/privacy");
  const events = await getEvents({ onlyMine: true });

  return (
      <CardWithBackground
          color="bg-blue-200"
          title="Personvernerærklæring"
          backLink="/"
      >
          <div className="m-4 max-w-2xl">
              <h2 className="pb-4 text-2xl">Personvern og sikkerhet på delta.nav.no</h2>
              <p className="mb-4">Delta er en nettside NAV Arbeids- og velferdsdirektoratet. Denne personvernerklæringen er knyttet til behandlingen av personopplysninger på dette nettstedet. </p>

              <p>Personvernererklæring for delta.nav.no er under arbeid.</p>

              <h2 className="pb-4 pt-4 text-2xl">Feil, mangler og forbedringsforslag</h2>
              <p>Hvis du opplever problemer eller har forslag til forbedringer hører vi veldig gjerne fra deg! Feil og mangler kan rapporteres til eilif.johansen@nav.no, eller #delta på Slack.</p>
          </div>
      </CardWithBackground>
  );
}
