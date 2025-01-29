"use client"
import { useEffect, useState } from 'react';
import { Search, Heading, Detail, Skeleton} from "@navikt/ds-react";
import Link from 'next/link';

interface Group {
    group_id: string;
    name: string;
    description: string;
    meeting_frequency: string;
    default_meeting_start: string;
    default_meeting_end: string;
    slack_channel_url: string;
}

export default function FaggruppeListe() {
    const Groups = () => {
        const [groups, setGroups] = useState<Group[]>([]);
        const [loading, setLoading] = useState(true);
        const [searchQuery, setSearchQuery] = useState('');

        useEffect(() => {
            const fetchGroups = async () => {
                try {
                    const response = await fetch('/api/hentfaggrupper');
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data: Group[] = await response.json();
                    setGroups(data);
                } catch (error) {
                    console.error('Failed to fetch groups:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchGroups();
        }, []);

        const filteredGroups = groups.filter((group) => {
            const normalizedQuery = searchQuery ? searchQuery.toLowerCase() : '';
            return group.name ? group.name.toLowerCase().includes(normalizedQuery) : false;
        });

        const sortedGroups = filteredGroups.sort((a, b) => a.name.localeCompare(b.name));

        return (
            <div className="flex flex-col w-full">
                <div className="flex flex-col-reverse gap-2 items-start md:flex-row justify-between w-full md:items-center px-4">
                    <Search
                        label="Søk etter grupper"
                        variant="simple"
                        value={searchQuery}
                        size="small"
                        className="border-[#000] w-full md:w-auto pb-10 pt-4"
                        onChange={(e) => {
                            setSearchQuery(e);
                        }}
                    />
                </div>

                 {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pb-4">
                        <Skeleton width="100%" height="3rem" />
                        <Skeleton width="100%" height="3rem" />
                        <Skeleton width="100%" height="3rem" />
                        <Skeleton width="100%" height="3rem" />
                    </div>
                )}

                {!loading && (
                    <>
                        <p className="px-4 pb-4">
                            {sortedGroups.length} {sortedGroups.length == 1 ? (<>gruppe</>) : (<>grupper</>)}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pb-4">
                            {sortedGroups.map((group) => (
                                <Link key={group.group_id} href={`/faggrupper2/${group.group_id}`}>
                                    <div
                                        className="flex flex-col h-full p-4 border rounded-xl text-text-default border-gray-300 transition-all hover:-translate-y-1 hover:scale-105 hover:text-surface-action-selected-hover hover:border-border-action event-card">
                                        <Heading level="2" size="small">{group.name}</Heading>
                                        <div className="flex pt-2 flex-col gap-2 h-full">
                                            {group.meeting_frequency && (
                                                <Detail className="leading-normal">
                                                    Møtefrekvens: {group.meeting_frequency}
                                                </Detail>
                                            )}
                                            {group.default_meeting_start && group.default_meeting_end && (
                                                <Detail className="leading-normal">
                                                    Tid: {group.default_meeting_start} - {group.default_meeting_end}
                                                </Detail>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return <Groups />;
}