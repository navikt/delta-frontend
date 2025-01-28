import { checkToken } from "@/auth/token";
import CardWithBackground from '@/components/cardWithBackground';
import Link from "next/link";
// Server component using server-side rendering (SSR)
export default async function NewArticlesPage() {
    await checkToken("/faggrupper/ny");

    return (
        <div className="flex flex-col w-full">
            <div className="w-full">
                <CardWithBackground
                    title="Opprett ny faggruppe"
                    backLink="/faggrupper"
                >
                    <div className="mx-4 my-4">
                    <h2 className="text-2xl  font-bold text-deepblue-500 mb-4">A) Vi gjør det sammen 😃</h2>
                    <Link target="_blank" href="https://forms.office.com/e/LyKPTdaRw5"
                          className="text-deepblue-500 underline hover:no-underline">
                        Skjema for å opprette ny faggruppe.
                    </Link>

                    <p className="mt-8">
                        Fyll inn skjemaet med følgende informasjon:
                    </p>
                    <ul className="list-disc list-inside mt-4">
                        <li>Navn på faggruppe</li>
                        <li className="pt-1">Beskrivelse</li>
                        <li className="pt-1">Lenke til gruppen, f.eks. på Slack, Teams etc.</li>
                    </ul>

                    <h2 className="text-2xl  mt-8 mb-4 font-bold text-deepblue-500">B) Gjør det selv 🛠️</h2>
                    <Link href="https://github.com/navikt/delta-frontend/tree/main/public/faggrupper"
                          className="text-deepblue-500 underline hover:no-underline">
                          Legg til faggruppe på Github.
                    </Link>
                    </div>
                </CardWithBackground>
            </div>
        </div>
    );
}

