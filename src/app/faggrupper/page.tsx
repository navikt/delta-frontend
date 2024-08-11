import { checkToken } from "@/auth/token";
import fs from 'fs';
import path from 'path';
import CardWithBackground from '@/components/cardWithBackground';
import SearchArticles from '@/components/faggrupper/SearchArticles';
import matter from "gray-matter";
import Link from "next/link";
// Server component using server-side rendering (SSR)
export default async function ArticlesPage() {
    await checkToken("/faggrupper");
    const articleDirectory = path.join(process.cwd(), 'public/faggrupper');
    const filenames = fs.readdirSync(articleDirectory);

    const articles = await Promise.all(
        filenames.map(async (filename) => {
            const filePath = path.join(articleDirectory, filename);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const { data: { title, when, audience, starttime, endtime } } = matter(fileContent); // Extract title from front matter

            return {
                title,
                when,
                audience,
                starttime,
                endtime,
                href: `/faggrupper/${filename.replace(/\.md$/, '')}`,
            };
        })
    );

    return (
        <div className="flex flex-col w-full">
            <div className="w-full">
                <CardWithBackground
                    title="Faggrupper og møteplasser"
                    backLink="/"
                >
                    <SearchArticles articles={articles}/>
                    <div className="px-4 mb-5 pt-5">
                        <Link href="/faggrupper/ny" className="text-deepblue-500 underline hover:no-underline">
                            Opprett ny faggruppe eller møteplass
                        </Link>
                    </div>
                </CardWithBackground>
            </div>
        </div>
    );
}