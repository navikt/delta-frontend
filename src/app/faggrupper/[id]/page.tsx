import { getUser, isFaggruppeAdmin } from "@/auth/token";
import { getFaggruppe, getIsFaggruppeOwner } from "@/service/faggruppeQueries";
import CardWithBackground from "@/components/cardWithBackground";
import { Detail } from "@navikt/ds-react";
import { PersonGroupIcon, CalendarIcon, ClockIcon } from "@navikt/aksel-icons";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { ButtonNextLink } from "@/components/nextLinks";
import { PencilIcon } from "@navikt/aksel-icons";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Faggruppe Δ Delta" };

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
                                <CalendarIcon aria-hidden /> {group.tidspunkt}
                            </span>
                        </Detail>
                    )}
                    {group.starttid && group.sluttid && (
                        <Detail className="leading-normal">
                            <span className="flex items-center gap-1">
                                <ClockIcon aria-hidden />
                                {`${formatTime(group.starttid)} - ${formatTime(group.sluttid)}`}
                            </span>
                        </Detail>
                    )}
                    {group.malgruppe && (
                        <Detail className="leading-normal">
                            <span className="flex items-center gap-1">
                                <PersonGroupIcon aria-hidden /> Målgruppe: {group.malgruppe}
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
                        <ButtonNextLink
                            href={`/faggrupper/${id}/rediger`}
                            variant="secondary"
                            size="small"
                            icon={<PencilIcon aria-hidden />}
                        >
                            Rediger
                        </ButtonNextLink>
                    </div>
                )}
        </CardWithBackground>
    );
}
