import {checkToken} from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import Link from "next/link";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Personvern Δ Delta",
};
export default async function Privacy() {
    await checkToken("/legal/privacy");
    return (
        <CardWithBackground
            title="Personvernerærklæring"
            backLink="/"
        >
            <div className="m-4 max-w-2xl font-serif">
                <h2 className="pb-4 text-2xl">Personvern og sikkerhet på delta.nav.no</h2>
                <p className="mb-4 leading-normal">Delta er en nettside NAV Arbeids- og velferdsdirektoratet. Denne
                    personvernerklæringen er knyttet til behandlingen av personopplysninger på dette nettstedet. For
                    utfyllende informasjon om hvordan NAV behandler personopplysninger, kan du lese mer i <Link
                        href="https://www.nav.no/no/nav-og-samfunn/om-nav/personvern-i-arbeids-og-velferdsetaten"
                        className="text-ax-brand-blue-600 underline hover:no-underline">NAVs generelle
                        personvernerklæring.</Link></p>
                <Link className="mb-4 leading-normal text-ax-brand-blue-600 underline hover:no-underline"
                      href="https://etterlevelse.intern.nav.no/dokumentasjon/935f99be-82b1-4833-b9d7-5ccdc2623025">For
                    detaljer se Deltas oppføring i Etterlevelse i NAV.</Link>

                <h2 className="pb-4 pt-4 text-2xl">Hvilke personopplysninger vi samler inn og hvorfor</h2>
                <p className="mb-4 leading-normal">
                    Ved påmelding på arrangementer i Delta lagrer vi Navn og E-postadresse. Vi trenger disse
                    opplysningene for at arrangøren skal vite hvem som er påmeldt, og hvilken e-post
                    kalenderinvitasjonen skal sendes til.
                    Delta ber om samtykke før personopplysninger lagres tilknyttet påmelding til et event.
                </p>
                <Link className="mb-4 leading-normal text-ax-brand-blue-600 underline hover:no-underline"
                      href="https://behandlingskatalog.intern.nav.no/process/purpose/KOMPETANSEUTVIKLING/b2d74c2c-8d0b-4bdc-a21a-4ca9e265bc85">For
                    detaljer se Deltas oppføring i Behandlerkatalogen.</Link>

                <h2 className="pb-4 pt-4 text-2xl">Sletting av personopplysninger</h2>
                <p className="mb-4 leading-normal">
                    Ved å melde deg av et arrangement slettes personopplysninger dine tilknyttet det spesifikke eventet.
                    Du kan også ta kontakt direkte med arrangøren for å få slettet personopplysninger tilknyttet et
                    spesifikt event. Dersom arrangøren sletter et event, slettes også personopplysningene du har oppgitt
                    tilknyttet det spesifikke eventet.
                </p>

                <h2 className="pb-4 pt-4 text-2xl">Bruk av informasjonskapsler (cookies)</h2>
                <p className="mb-4 leading-normal">Når du besøker nettsiden bruker vi informasjonskapsler (cookies).</p>
                <p className="mb-4 leading-normal">Informasjonskapsler er små tekstfiler som plasseres på din datamaskin
                    når du laster ned en nettside. Noen av informasjonskapslene er nødvendige for at ulike tjenester på
                    nettsiden vår skal fungere slik vi ønsker. Funksjonen kan slås av og på i de fleste nettlesere
                    gjennom «innstillinger», «sikkerhet» eller liknende. Hvis du slår av informasjonskapsler i
                    nettleseren din, vil ikke all funksjonalitet virke som den skal. Informasjonskapsler inneholder ikke
                    personopplysninger og er ingen sikkerhetsrisiko for deg.
                </p>
                <p className="mb-4 leading-normal">Vi bruker informasjonskapsler til å forbedre brukeropplevelsen og
                    innholdet. Når du besøker aksel.nav.no, sender nettleseren din opplysninger til NAVs analyseverktøy.
                    For hver side du åpner, lagres opplysninger om hvilken side du er på, hvilken side du kommer fra og
                    går til, hvilken nettleser du bruker, om du bruker PC eller mobile løsninger m.m. Slik kan vi
                    forbedre flyten og opplevelsen for alle som bruker nettsiden.
                </p>
                <p className="mb-4 leading-normal">Opplysningene brukes til å kartlegge hvordan og hvor mye delta.nav.no
                    brukes, uten å identifisere IP-adresser. Vi bruker verktøyet Umami og Skyra i analysearbeidet.
                </p>

                <h3 className="pb-4 text-lg">skyra*</h3>
                <p className="mb-4 leading-normal">
                    Brukes av verktøyet Skyra for å lagre svarene du gir på en undersøkelse. Avhengig av oppsett på
                    undersøkelsen er dette enten en sesjonskapsel eller en kapsel som slettes etter få timer. Kapselen
                    slettes når en undersøkelse fullføres eller lukkes.
                </p>

                <h3 className="pb-4 text-lg">skyra.state</h3>
                <p className="mb-4 leading-normal">
                    Brukes av verktøyet Skyra for å huske brukeren og hvorvidt undersøkelser er åpnet, lukket eller
                    fullført.
                </p>

                <h3 className="pb-4 text-lg">Umami</h3>
                <p className="mb-4 leading-normal">
                    Umami brukes til statistikk og analyse av hvordan nav.no brukes. Unami bruker ikke
                    informasjonskapsler, men henter inn opplysninger om nettleseren din for å lage en unik ID. Denne
                    ID-en brukes for å skille deg fra andre brukere. For å hindre identifisering, bruker vi en
                    egenutviklet proxy som vasker bort deler av IP-adressen din før dataene sendes til verktøyet.
                </p>

                <h2 className="pb-4 pt-4 text-2xl">Feil, mangler og forbedringsforslag</h2>
                <p className="leading-normal">Hvis du opplever problemer eller har forslag til forbedringer hører vi
                    veldig gjerne fra deg! Feil og mangler kan rapporteres til <Link
                        href="mailto:eilif.johansen@nav.no"
                        className="text-ax-brand-blue-600 underline hover:no-underline">eilif.johansen@nav.no</Link>,
                    eller <Link
                        href="https://nav-it.slack.com/archives/C05E0NJ6Z0C"
                        className="text-ax-brand-blue-600 underline hover:no-underline">#delta på
                        Slack</Link>.</p>
            </div>
        </CardWithBackground>
    );
}
