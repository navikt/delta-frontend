import { checkToken } from "@/auth/token";
import CardWithBackground from '@/components/cardWithBackground';
import NewGroupForm from '@/components/faggrupper/NewGroupForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Opprett ny faggruppe Δ Delta',
};

export default async function NewGroupPage() {
    await checkToken("/faggrupper2/ny");

    return (
        <div className="flex flex-col w-full">
            <div className="w-full">
                <CardWithBackground
                    title="Opprett ny faggruppe"
                    backLink="/faggrupper2"
                >
                    <div className="mx-4 my-4">
                        <NewGroupForm />
                    </div>
                </CardWithBackground>
            </div>
        </div>
    );
}

