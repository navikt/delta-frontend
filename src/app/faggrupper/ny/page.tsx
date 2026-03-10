import { checkToken } from "@/auth/token";
import CardWithBackground from '@/components/cardWithBackground';
import NewFaggruppeForm from "@/components/faggrupper/NewFaggruppeForm";

export default async function NewFaggruppePage() {
    await checkToken("/faggrupper/ny");

    return (
        <div className="flex flex-col w-full">
            <div className="w-full">
                <CardWithBackground
                    title="Opprett ny faggruppe"
                    backLink="/faggrupper"
                >
                    <div className="mx-4 my-4">
                        <NewFaggruppeForm />
                    </div>
                </CardWithBackground>
            </div>
        </div>
    );
}

