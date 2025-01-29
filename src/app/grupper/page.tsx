import { checkToken } from "@/auth/token";
import CardWithBackground from '@/components/cardWithBackground';
import FaggruppeListe from '@/components/grupper/FaggruppeListe';
import Link from "next/link";

// Server component using server-side rendering (SSR)
export default async function ArticlesPage() {
    await checkToken("/grupper");

    return (
        <>
            <head>
                <title>Grupper Δ Delta</title>
            </head>
            <div className="flex flex-col w-full">
                <div className="w-full">
                    <CardWithBackground
                        title="Grupper"
                        backLink="/"
                    >
                        <FaggruppeListe />
                        <div className="px-4 mb-5 pt-5">
                            <Link href="/grupper/ny" className="text-deepblue-500 underline hover:no-underline">
                                Opprett ny gruppe
                            </Link>
                        </div>
                    </CardWithBackground>
                </div>
            </div>
        </>
    );
}