import { getUser, isFaggruppeAdmin } from "@/auth/token";
import { getFaggruppe, getIsFaggruppeOwner } from "@/service/faggruppeQueries";
import CardWithBackground from "@/components/cardWithBackground";
import { Detail } from "@navikt/ds-react";
import { PersonGroupIcon, CalendarIcon, ClockIcon } from "@navikt/aksel-icons";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Link from "next/link";
import { PencilIcon } from "@navikt/aksel-icons";

// @ts-ignore
export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [group, isOwnerFromBackend, user, isAdmin] = await Promise.all([
        getFaggruppe(id),
        getIsFaggruppeOwner(id),
        getUser(),
        isFaggruppeAdmin(),
    ]);

    if (!group) {
        return <div>Faggruppen ble ikke funnet.</div>;
    }

    const isOwner = isOwnerFromBackend
        ?? group.eiere?.some(e => e.epost.toLowerCase() === user.email.toLowerCase())
        ?? false;

    const formatTime = (time: string) => time.split(':').slice(0, 2).join(':');

    return (
        <>
            <head>
                <title>Faggruppe Δ Delta</title>
            </head>
            <CardWithBackground
                title=""
                backLink="/faggrupper"
                backText={"Faggrupper"}
            >
                <div className="prose mx-4 mt-4 mb-2">
                    <h1 className="pb-1">{group.navn}</h1>
                    {group.undertittel && (
                        <div className="-mt-7 mb-10">
                            <MarkdownRenderer>{group.undertittel}</MarkdownRenderer>
                        </div>
                    )}
                    {group.tidspunkt && (
                        <Detail className="leading-normal">
                            <span className="flex items-center gap-1">
                                <CalendarIcon title="person" /> {group.tidspunkt}
                            </span>
                        </Detail>
                    )}
                    {group.starttid && group.sluttid && (
                        <Detail className="leading-normal">
                            <span className="flex items-center gap-1">
                                <ClockIcon aria-label="tid" />
                                {`${formatTime(group.starttid)} - ${formatTime(group.sluttid)}`}
                            </span>
                        </Detail>
                    )}
                    {group.malgruppe && (
                        <Detail className="leading-normal">
                            <span className="flex items-center gap-1">
                                <PersonGroupIcon title="person" /> Målgruppe: {group.malgruppe}
                            </span>
                        </Detail>
                    )}
                    {group.beskrivelse && (
                        <article>
                            <MarkdownRenderer>{group.beskrivelse}</MarkdownRenderer>
                        </article>
                    )}
                </div>
                {(isOwner || isAdmin) && (
                    <div className="px-4 pb-10">
                        <Link
                            href={`/faggrupper/${id}/rediger`}
                            className="aksel-button aksel-button--small inline-flex items-center gap-1" data-variant="secondary"
                        >
                            <PencilIcon className="inline" title="rediger" fontSize="1.2rem" /> Rediger
                        </Link>
                    </div>
                )}
            </CardWithBackground>
        </>
    );
}
