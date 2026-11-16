"use client"
import {useState} from 'react';
import {HStack, LinkCard, Search, VStack} from "@navikt/ds-react";
import {CalendarIcon, PersonGroupIcon, ClockIcon} from "@navikt/aksel-icons";

interface Article {
    title: string;
    when?: string;
    audience?: string;
    starttime?: string;
    endtime?: string;
    href: string;
}

export default function SearchArticles({articles}: { articles: Article[] }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredArticles = articles.filter((article) => {
        const normalizedQuery = searchQuery ? searchQuery.toLowerCase() : '';
        // Only search by title (remove other conditions)
        return article.title ? article.title.toLowerCase().includes(normalizedQuery) : false;
    });

    // Sort articles alphabetically by title
    const sortedArticles = filteredArticles.sort((a, b) => a.title.localeCompare(b.title));

    return (
        <div className="flex flex-col w-full">
            <div
                className="flex flex-col-reverse gap-2 items-start ax-md:flex-row justify-between w-full ax-md:items-center px-4">
                <Search
                    label="Søk etter grupper"
                    variant="simple"
                    value={searchQuery}
                    size="small"
                    className="w-full ax-md:w-auto"
                    onChange={(e) => {
                        setSearchQuery(e);
                    }}
                />
            </div>

            <p className="px-4 pb-4">{sortedArticles.length} {sortedArticles.length == 1 ? (<>gruppe</>) : (<>grupper</>)}</p>

            <div className="grid grid-cols-1 ax-md:grid-cols-3 gap-4 px-4 pb-4">
                {sortedArticles.map((article) => (
                    <LinkCard key={article.title} arrow={false} size="small" className="h-full">
                        <LinkCard.Title as="h2">
                            <LinkCard.Anchor href={article.href}>{article.title}</LinkCard.Anchor>
                        </LinkCard.Title>
                        {(article.when || article.starttime || article.audience) && (
                            <LinkCard.Description>
                                <VStack as="span" gap="space-8">
                                    {article.when && (
                                        <HStack as="span" gap="space-4" align="center">
                                            <CalendarIcon aria-hidden /> {article.when}
                                        </HStack>
                                    )}
                                    {article.starttime && (
                                        <HStack as="span" gap="space-4" align="center">
                                            <ClockIcon aria-label="tid" /> {article.starttime && `${article.starttime}`} {article.endtime && `-  ${article.endtime}`}
                                        </HStack>
                                    )}
                                    {article.audience && (
                                        <HStack as="span" gap="space-4" align="center">
                                            <PersonGroupIcon aria-hidden /> Målgruppe: {article.audience}
                                        </HStack>
                                    )}
                                </VStack>
                            </LinkCard.Description>
                        )}
                    </LinkCard>
                ))}
            </div>
        </div>
    );
}