import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFilters";
import { getEvents } from "@/service/eventActions";
import Link from "next/link";

export default async function Privacy() {
  await checkToken("/legal/privacy");
  const events = await getEvents({ onlyMine: true });

  return (
      <CardWithBackground
          color="bg-blue-200"
          title="Personvernerærklæring"
          backLink="/"
      >
          <div className="m-4 max-w-2xl font-serif">
              <h2 className="pb-4 text-2xl">Personvern og sikkerhet på delta.nav.no</h2>
              <p className="mb-4 leading-normal">Delta er en nettside NAV Arbeids- og velferdsdirektoratet. Denne personvernerklæringen er knyttet til behandlingen av personopplysninger på dette nettstedet. For utfyllende informasjon om hvordan NAV behandler personopplysninger, kan du lese mer i <Link href="https://www.nav.no/no/nav-og-samfunn/om-nav/personvern-i-arbeids-og-velferdsetaten" className="text-deepblue-500 underline hover:no-underline">NAVs generelle personvernerklæring.</Link></p>


              <h2 className="pb-4 pt-4 text-2xl">Hvilke personopplysninger vi samler inn og hvorfor</h2>
              <p className="mb-4 leading-normal">
                  Ved påmelding på arrangementer i Delta lagrer vi Navn og E-postadresse. Vi trenger disse opplysningene for at arrangøren skal vite hvem som er påmeldt, og hvilken e-post kalenderinvitasjonen skal sendes til.
              Delta ber om samtykke før personopplysninger lagres tilknyttet påmelding til et event.
              </p>

              <h2 className="pb-4 pt-4 text-2xl">Sletting av personopplysninger</h2>
              <p className="mb-4 leading-normal">
                  Ved å melde deg av et arrangement slettes personopplysninger dine tilknyttet det spesifikke eventet. Du kan også ta kontakt direkte med arrangøren for å få slettet personopplysninger tilknyttet et spesifikt event. Dersom arrangøren sletter et event, slettes også personopplysningene du har oppgitt tilknyttet det spesifikke eventet.
              </p>

              <h2 className="pb-4 pt-4 text-2xl">Bruk av informasjonskapsler (cookies)</h2>

              <p className="mb-4 leading-normal">Når du besøker nettsiden bruker vi informasjonskapsler (cookies).</p>

              <p className="mb-4 leading-normal">Informasjonskapsler er små tekstfiler som plasseres på din datamaskin når du laster ned en nettside. Noen av informasjonskapslene er nødvendige for at ulike tjenester på nettsiden vår skal fungere slik vi ønsker. Funksjonen kan slås av og på i de fleste nettlesere gjennom «innstillinger», «sikkerhet» eller liknende. Hvis du slår av informasjonskapsler i nettleseren din, vil ikke all funksjonalitet virke som den skal. Informasjonskapsler inneholder ikke personopplysninger og er ingen sikkerhetsrisiko for deg.
              </p>
              <p className="mb-4 leading-normal">Vi bruker informasjonskapsler til å forbedre brukeropplevelsen og innholdet. Når du besøker aksel.nav.no, sender nettleseren din opplysninger til NAVs analyseverktøy. For hver side du åpner, lagres opplysninger om hvilken side du er på, hvilken side du kommer fra og går til, hvilken nettleser du bruker, om du bruker PC eller mobile løsninger m.m. Slik kan vi forbedre flyten og opplevelsen for alle som bruker nettsiden.
              </p>
              <p className="mb-4 leading-normal">Opplysningene brukes til å kartlegge hvordan og hvor mye delta.nav.no brukes, uten å identifisere IP-adresser. Vi bruker verktøyet Amplitude i analysearbeidet.
              </p>
              <h2 className="pb-4 pt-4 text-2xl">Feil, mangler og forbedringsforslag</h2>
              <p className="leading-normal">Hvis du opplever problemer eller har forslag til forbedringer hører vi veldig gjerne fra deg! Feil og mangler kan rapporteres til eilif.johansen@nav.no, eller #delta på Slack.</p>
          </div>
      </CardWithBackground>
  );
}
