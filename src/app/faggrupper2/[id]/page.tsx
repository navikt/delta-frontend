import CardWithBackground from "@/components/cardWithBackground";
import EditArticleModal from "@/components/faggrupper/editarticlemodal";
import { Detail } from "@navikt/ds-react";
import { PersonGroupIcon, CalendarIcon, ClockIcon } from "@navikt/aksel-icons";

interface Props {
    params: {
        id: string
    }
}

export default async function ArticlePage({ params }: Props) {
    const response = await fetch(`http://localhost:3000/api/hentfaggruppe/${params.id}`, {
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch group');
    }
    const group = await response.json();

    if (!group) {
        return <div>Group not found</div>;
    }

    return (
        <>
            <head>
                <title>Faggruppe Δ Delta</title>
            </head>
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
                <EditArticleModal articlepath={params.id} />
            </CardWithBackground>
        </>
    );
}