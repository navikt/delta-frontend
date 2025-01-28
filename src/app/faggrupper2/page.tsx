import { checkToken } from "@/auth/token";
import CardWithBackground from '@/components/cardWithBackground';
import FaggruppeListe from '@/components/faggrupper/FaggruppeListe';
import Link from "next/link";

// Server component using server-side rendering (SSR)
export default async function ArticlesPage() {
    await checkToken("/faggrupper2");

    return (
        <>
            <head>
                <title>Faggrupper Δ Delta</title>
            </head>
            <div className="flex flex-col w-full">
                <div className="w-full">
                    <CardWithBackground
                        title="Faggrupper og møteplasser"
                        backLink="/"
                    >
                        <FaggruppeListe />
                        <div className="px-4 mb-5 pt-5">
                            <Link href="/faggrupper/ny" className="text-deepblue-500 underline hover:no-underline">
                                Opprett ny faggruppe eller møteplass
                            </Link>
                        </div>
                    </CardWithBackground>
                </div>
            </div>
        </>
    );
}