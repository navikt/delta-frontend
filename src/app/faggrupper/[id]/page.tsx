import { checkToken } from "@/auth/token";
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { JSDOM } from 'jsdom';
import CardWithBackground from "@/components/cardWithBackground";
import EditArticleModal from "@/components/faggrupper/editarticlemodal";
import { Detail } from "@navikt/ds-react";
import { PersonGroupIcon, CalendarIcon, ClockIcon } from "@navikt/aksel-icons";

// @ts-ignore
export default async function ArticlePage({ params }) {
    await checkToken(`/faggrupper/${params.id}`);
    const filePath = path.join(process.cwd(), `public/faggrupper/${params.id}.md`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { content, data: { title, subtitle, audience, when, starttime, endtime } } = matter(fileContent);

    const processedContent = await remark().use(html).process(content);
    const htmlContent = processedContent.toString();

    // Parse the HTML content and remove the first <h1> element
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    const firstH1 = document.querySelector('h1');
    if (firstH1) {
        firstH1.remove();
    }
    const modifiedHtmlContent = document.body.innerHTML;

    // Process subtitle to HTML
    const processedSubtitle = subtitle ? await remark().use(html).process(subtitle) : '';
    const subtitleHtml = processedSubtitle.toString();

    return (
        <CardWithBackground
            title=""
            backLink="/faggrupper"
            backText={"Faggrupper"}
        >
            <div className="prose mx-4 mt-4 mb-2">
                <h1 className="pb-1">{title}</h1>
                {subtitle && (
                    <p className="-mt-7 mb-10" dangerouslySetInnerHTML={{ __html: subtitleHtml }} />
                )}
                {when && (
                    <Detail className="leading-normal">
                        <span className="flex items-center gap-1">
                            <CalendarIcon title="person" /> {when}
                        </span>
                    </Detail>
                )}
                {starttime && endtime && (
                    <Detail className="leading-normal">
                        <span className="flex items-center gap-1">
                            <ClockIcon aria-label="tid" /> {`${starttime} - ${endtime}`}
                        </span>
                    </Detail>
                )}
                {audience && (
                    <Detail className="leading-normal">
                        <span className="flex items-center gap-1">
                            <PersonGroupIcon title="person" /> Målgruppe: {audience}
                        </span>
                    </Detail>
                )}
                <article dangerouslySetInnerHTML={{ __html: modifiedHtmlContent }} />
            </div>
            <EditArticleModal articlepath={params.id} />
        </CardWithBackground>
    );
}