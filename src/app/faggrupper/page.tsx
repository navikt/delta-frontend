import { checkToken } from "@/auth/token";
import fs from 'fs';
import path from 'path';
import CardWithBackground from '@/components/cardWithBackground';
import SearchArticles from '@/components/SearchArticles';
import matter from "gray-matter";
// Server component using server-side rendering (SSR)
export default async function ArticlesPage() {
    await checkToken("/faggrupperl");
    const articleDirectory = path.join(process.cwd(), 'public/articles-md');
    const filenames = fs.readdirSync(articleDirectory);

    const articles = await Promise.all(
        filenames.map(async (filename) => {
            const filePath = path.join(articleDirectory, filename);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const { data: { title, when, audience } } = matter(fileContent); // Extract title from front matter

            return {
                title,
                when,
                audience,
                href: `/faggrupper/${filename.replace(/\.md$/, '')}`,
            };
        })
    );

    return (
        <div className="flex flex-col w-full">
            <div className="w-full">
                <CardWithBackground
                    color="bg-blue-200"
                    title="Faggrupper"
                    backLink="/"
                >
                    <SearchArticles articles={articles} />
 {/*                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {articles.map((article) => (
                            <Link
                                href={article.href}
                                key={article.title}
                                className="flex flex-col h-full p-4 border rounded-xl text-text-default border-gray-300 transition-all hover:-translate-y-1 hover:scale-105 hover:text-surface-action-selected-hover hover:border-border-action event-card"
                            >
                                <Heading level="2" size="small">{article.title}</Heading>
                                <div className="flex pt-2 flex-col gap-2 h-full justify-between">
                                    {article.when && (
                                        <Detail className="leading-normal">
                                            <span className="flex items-center gap-1 pb-1">
                                                <CalendarIcon title="person"/>  {article.when}
                                            </span>
                                        </Detail>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>*/}
                </CardWithBackground>
            </div>
        </div>
);
}

