"use client"
import { useEffect, useState } from 'react';
import {Detail, Heading, BodyLong, List} from "@navikt/ds-react";
import { PersonGroupIcon, CalendarIcon, ClockIcon } from "@navikt/aksel-icons";
import CardWithBackground from "@/components/cardWithBackground";

interface Group {
    slack_channel_name: string;
    slack_channel_url: string;
    has_private_slack: boolean;
    name: string;
    description: string;
    meeting_frequency?: string;
    default_meeting_start?: string;
    default_meeting_end?: string;
    owners: {
        name: string;
        email: string;
        role: string;
    }[];
}

export default function GroupDetails({ id }: { id: string }) {
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchGroup = async () => {
            try {
                const response = await fetch(`/api/hentfaggruppe/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch group');
                }
                const data = await response.json();
                setGroup(data);
                console.log(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGroup();
    }, [id]);

    if (loading) {
        return null;
    }

    if (!group) {
        return null;
    }

    return (
        <CardWithBackground
            title=""
            backLink="/grupper"
            backText={"Grupper"}
        >
            <div className="prose mx-4 mt-4 pb-10 mb-2">
                <h1 className="pb-1">{group.name}</h1>
                {group.meeting_frequency ? (
                    <Detail className="leading-normal">
                        <span className="flex items-center gap-1">
                            <CalendarIcon title="person"/> {group.meeting_frequency}
                        </span>
                                    </Detail>
                                ) : (
                                    <Detail className="leading-normal">
                        <span className="flex items-center gap-1">
                            <CalendarIcon title="person"/> Tidspunkt annonseres
                        </span>
                                    </Detail>
                )}
                {group.default_meeting_start && (
                    <Detail className="leading-normal">
                        <span className="flex items-center gap-1">
                            <ClockIcon aria-label="tid"/>
                            {`${group.default_meeting_start} - ${group.default_meeting_end}`}
                        </span>
                    </Detail>
                )}
                <Heading size="medium" as="h2">
                    Kontaktpersoner
                </Heading>
                <BodyLong className="whitespace-pre-line break-words max-w-prose">
                <List as="ul">
                    {group.owners && group.owners.map((owner, index) => {
                        // Handle reversed names (e.g., "Person, Test" -> "Test Person")
                        const formattedName = owner.name
                            .split(',')                           // Split on comma if present
                            .map(part => part.trim())            // Remove whitespace
                            .reverse()                           // Reverse parts to get correct order
                            .join(' ')                           // Join with space
                            .split(' ')                          // Split into words
                            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())  // Capitalize each word
                            .join(' ');
                            
                        return (
                            <List.Item key={index} className="mb-2">
                                <a href={`mailto:${owner.email}`} className="text-deepblue-500 hover:underline">
                                    {formattedName}
                                </a>
                            </List.Item>
                        );
                    })}
                </List>
                </BodyLong>
                
                <Heading size="medium" as="h2">
                    Detaljer
                </Heading>
                <BodyLong className="whitespace-pre-line break-words max-w-prose">
                    {group.description}
                </BodyLong>


                {group.has_private_slack ? (
                    <>
                        <Heading size="medium" as="h2">
                            Gruppekanal
                        </Heading>
                        <BodyLong className="whitespace-pre-line break-words max-w-prose">
                            <a href={group.slack_channel_url} target="_blank" rel="noopener noreferrer">
                                {group.slack_channel_name}
                            </a>
                        </BodyLong>
                    </>
                ) : null}
            </div>
        </CardWithBackground>
    );
}
