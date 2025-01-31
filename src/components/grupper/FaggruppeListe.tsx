"use client"
import { useEffect, useState, useRef } from 'react';
import { Search, Heading, Detail, Skeleton} from "@navikt/ds-react";
import Link from 'next/link';
import {CalendarIcon, ClockIcon} from "@navikt/aksel-icons";

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
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchGroups = async () => {
        // Cancel any ongoing fetch
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new AbortController for this fetch
        abortControllerRef.current = new AbortController();

        setLoading(true);
        try {
            const response = await fetch('/api/hentfaggrupper', {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                signal: abortControllerRef.current.signal
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data: Group[] = await response.json();
            if (!abortControllerRef.current.signal.aborted) {
                setGroups(data);
                console.log('Fetched groups:', data);
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                // Ignore abort errors
                return;
            }
            console.error('Failed to fetch groups:', error);
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchGroups();
        
        return () => {
            // Cleanup: abort any ongoing fetch when component unmounts
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []); // Empty dependency array ensures this runs only once

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

            {!loading && groups.length > 0 && (
                <>
                    <p className="px-4 pb-4">
                        {sortedGroups.length} {sortedGroups.length === 1 ? 'gruppe' : 'grupper'}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pb-4">
                        {sortedGroups.map((group) => (
                            <Link key={group.group_id} href={`/grupper/${group.group_id}`}>
                                <div
                                    className="flex flex-col h-full p-4 border rounded-xl text-text-default border-gray-300 transition-all hover:-translate-y-1 hover:scale-105 hover:text-surface-action-selected-hover hover:border-border-action event-card">
                                    <Heading level="2" size="small">{group.name}</Heading>
                                    <div className="flex pt-2 flex-col gap-2 h-full">
                                        {group.meeting_frequency ? (
                                            <>
                                            <Detail className="leading-normal">
                                                <span className="flex items-center gap-1">
                                                    <CalendarIcon title="person"/>  {group.meeting_frequency}
                                                </span>
                                            </Detail>
                                            {group.default_meeting_start && group.default_meeting_end && (
                                                <Detail className="leading-normal">
                                                    <span className="flex items-center gap-1">
                                                        <ClockIcon aria-label="tid"/> {group.default_meeting_start} - {group.default_meeting_end}
                                                    </span>
                                                </Detail>
                                            )}
                                            </>
                                        ) : (
                                            <Detail className="leading-normal">
                                                <span className="flex items-center gap-1">
                                                    <CalendarIcon title="person"/> Tidspunkt annonseres
                                                </span>
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
}