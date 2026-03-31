import CardWithBackground from '@/components/cardWithBackground';
import NewGroupForm from '@/components/grupper/NewGroupForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Opprett ny gruppe Δ Delta',
};

export default async function NewGroupPage() {

    return (
        <div className="flex flex-col w-full">
            <div className="w-full">
                <CardWithBackground
                    title="Opprett ny gruppe"
                    backLink="/grupper"
                >
                    <div className="mx-4 my-4">
                        <NewGroupForm />
                    </div>
                </CardWithBackground>
            </div>
        </div>
    );
}

