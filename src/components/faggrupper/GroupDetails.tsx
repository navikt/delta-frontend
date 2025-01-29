"use client"
import { useEffect, useState } from 'react';
import { Detail } from "@navikt/ds-react";
import { PersonGroupIcon, CalendarIcon, ClockIcon } from "@navikt/aksel-icons";
import CardWithBackground from "@/components/cardWithBackground";
import EditArticleModal from "@/components/faggrupper/editarticlemodal";

interface Group {
    name: string;
    description: string;
    meeting_frequency?: string;
    default_meeting_start?: string;
    default_meeting_end?: string;
}

export default function GroupDetails({ id }: { id: string }) {
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const response = await fetch(`/api/hentfaggruppe/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch group');
                }
                const data = await response.json();
                setGroup(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGroup();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!group) {
        return <div>Group not found</div>;
    }

    return (
        <CardWithBackground
            title=""
            backLink="/faggrupper2"
            backText={"Faggrupper"}
        >
            <div className="prose mx-4 mt-4 mb-2">
                <h1 className="pb-1">{group.name}</h1>
                {group.meeting_frequency && (
                    <Detail className="leading-normal">
                        <span className="flex items-center gap-1">
                            <CalendarIcon title="person" /> {group.meeting_frequency}
                        </span>
                    </Detail>
                )}
                {group.default_meeting_start && (
                    <Detail className="leading-normal">
                        <span className="flex items-center gap-1">
                            <ClockIcon aria-label="tid" /> 
                            {`${group.default_meeting_start} - ${group.default_meeting_end}`}
                        </span>
                    </Detail>
                )}
                <article>{group.description}</article>
            </div>
            <EditArticleModal articlepath={id} />
        </CardWithBackground>
    );
}
