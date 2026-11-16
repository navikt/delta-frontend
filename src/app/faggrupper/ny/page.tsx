import { checkToken } from "@/auth/token";
import CardWithBackground from '@/components/cardWithBackground';
import NewFaggruppeForm from "@/components/faggrupper/NewFaggruppeForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Opprett ny faggruppe Δ Delta" };

export default async function NewFaggruppePage() {
    await checkToken();

    return (
        <div className="flex flex-col w-full">
            <div className="w-full">
                <CardWithBackground
                    title="Opprett ny faggruppe"
                    backLink="/faggrupper"
                  backText="Faggrupper"
                >
                    <div className="mx-4 my-4">
                        <NewFaggruppeForm />
                    </div>
                </CardWithBackground>
            </div>
        </div>
    );
}

