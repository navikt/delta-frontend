import { checkToken, getDeltaBackendAccessToken } from "@/auth/token";
import CardWithBackground from '@/components/cardWithBackground';
import SearchArticles from '@/components/faggrupper/SearchArticles';
import Link from "next/link";

export default async function ArticlesPage() {
    await checkToken("/faggrupper");

    const token = await getDeltaBackendAccessToken();
    const apiUrl = process.env.NODE_ENV === 'production'
        ? 'http://delta-backend/api/faggrupper'
        : 'http://localhost:8080/api/faggrupper';

    let articles: {
        title: string;
        when?: string;
        audience?: string;
        starttime?: string;
        endtime?: string;
        href: string;
    }[] = [];

    try {
        const response = await fetch(apiUrl, {
            headers: { Authorization: `Bearer ${token ?? 'placeholder-token'}` },
            cache: 'no-store',
        });
        if (response.ok) {
            const groups = await response.json();
            articles = groups.map((group: {
                id: string;
                navn: string;
                tidspunkt?: string;
                malgruppe?: string;
                starttid?: string;
                sluttid?: string;
            }) => ({
                title: group.navn,
                when: group.tidspunkt,
                audience: group.malgruppe,
                starttime: group.starttid,
                endtime: group.sluttid,
                href: `/faggrupper/${group.id}`,
            }));
        }
    } catch (error) {
        console.error('Failed to fetch faggrupper:', error);
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