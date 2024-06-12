"use client"
import {useState} from 'react';
import Link from 'next/link';
import {Detail, Heading, Search} from "@navikt/ds-react";
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

    return (
        <div className="flex flex-col w-full">
            <div
                className="flex flex-col-reverse gap-2 items-start md:flex-row justify-between w-full md:items-center px-4">
                <Search
                    label="Søk etter faggrupper"
                    variant="simple"
                    value={searchQuery}
                    size="small"
                    className="border-[#000] w-full md:w-auto pb-10 pt-4"
                    onChange={(e) => {
                        setSearchQuery(e);
                    }}
                />
            </div>

            <p className="px-4 pb-4">{filteredArticles.length} {filteredArticles.length == 1 ? (<>faggruppe</>) : (<>faggrupper</>)}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pb-4">
                {filteredArticles.map((article) => (
                    <Link key={article.title} href={article.href}>
                        <div
                            className="flex flex-col h-full p-4 border rounded-xl text-text-default border-gray-300 transition-all hover:-translate-y-1 hover:scale-105 hover:text-surface-action-selected-hover hover:border-border-action event-card">
                            <Heading level="2" size="small">{article.title}</Heading>
                            <div className="flex pt-2 flex-col gap-2 h-full">
                                {article.when && (
                                    <Detail className="leading-normal">
                    <span className="flex items-center gap-1">
                      <CalendarIcon
                          title="person"/> {article.when}
                    </span>
                                    </Detail>
                                )}
                                {article.starttime && (
                                    <Detail className="leading-normal">
                    <span className="flex items-center gap-1">
                      <ClockIcon
                          aria-label="tid"/> {article.starttime && `${article.starttime}`} {article.endtime && `-  ${article.endtime}`}
                    </span>
                                    </Detail>
                                )}
                                {article.audience && (
                                    <Detail className="leading-normal">
                                        <span className="flex items-center gap-1">
                                          <PersonGroupIcon title="person"/> Målgruppe: {article.audience}
                                        </span>
                                    </Detail>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
