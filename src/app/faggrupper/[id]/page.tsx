import { checkToken } from "@/auth/token";
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark'; // Correct import
import html from 'remark-html';
import CardWithBackground from "@/components/cardWithBackground";

// Server component for fetching and processing article content
// @ts-ignore
export default async function ArticlePage({ params }) {
    await checkToken("/faggrupper/${params.id");
    const filePath = path.join(process.cwd(), `public/faggrupper/${params.id}.md`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { content, data: { title } } = matter(fileContent); // Extract title

    // @ts-ignore
    const processedContent = await remark().use(html).process(content);
    const htmlContent = processedContent.toString();

    return (
        <CardWithBackground
            color="bg-blue-200"
            title="" // Use extracted title
            backLink="/faggrupper"
            backText={"Faggrupper"}
        >
            <div className="prose mx-4 mt-4 mb-2">
                {/*<div className="pb-1">Faggruppe</div>*/}
                <article dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
        </CardWithBackground>
    );
}
