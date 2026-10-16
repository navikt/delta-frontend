import { getFaggrupper } from "@/service/faggruppeQueries";
import { unstable_rethrow } from "next/navigation";
import CardWithBackground from '@/components/cardWithBackground';
import SearchArticles from '@/components/faggrupper/SearchArticles';
import Link from "next/link";

export default async function ArticlesPage() {
    let articles: {
        title: string;
        when?: string;
        audience?: string;
        starttime?: string;
        endtime?: string;
        href: string;
    }[] = [];

    try {
        const groups = await getFaggrupper();
        articles = groups.map((group) => ({
            title: group.navn,
            when: group.tidspunkt,
            audience: group.malgruppe,
            starttime: group.starttid,
            endtime: group.sluttid,
            href: `/faggrupper/${group.id}`,
        }));
    } catch (error) {
        unstable_rethrow(error);
        console.error('Failed to fetch faggrupper');
    }

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
                        <SearchArticles articles={articles}/>
                        <div className="px-4 mb-5 pt-5">
                            <Link href="/faggrupper/ny" className="text-ax-brand-blue-600 underline hover:no-underline">
                                Opprett ny faggruppe eller møteplass
                            </Link>
                        </div>
                    </CardWithBackground>
                </div>
            </div>
        </>
    );
}