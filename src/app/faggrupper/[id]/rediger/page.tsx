import { getUser, isFaggruppeAdmin } from "@/auth/token";
import { getFaggruppe } from "@/service/faggruppeQueries";
import CardWithBackground from "@/components/cardWithBackground";
import EditFaggruppeForm from "@/components/faggrupper/EditFaggruppeForm";
import ManageEiereForm from "@/components/faggrupper/ManageEiereForm";
import DeleteFaggruppeButton from "@/components/faggrupper/DeleteFaggruppeButton";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rediger faggruppe Δ Delta" };

export default async function RedigerFaggrupePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [group, user, isAdmin] = await Promise.all([
        getFaggruppe(id),
        getUser(),
        isFaggruppeAdmin(),
    ]);

    if (!group) {
        redirect('/faggrupper');
    }

    const isOwner = group.eiere?.some(
        (e) => e.epost.toLowerCase() === user.email.toLowerCase()
    ) ?? false;

    if (!isOwner && !isAdmin && process.env.NODE_ENV !== 'development') {
        redirect(`/faggrupper/${id}`);
    }

    return (
            <div className="flex flex-col w-full">
                <div className="w-full">
                    <CardWithBackground
                        title="Rediger faggruppe"
                        backLink={`/faggrupper/${id}`}
                    >
                        <div className="mx-4 my-4">
                            <EditFaggruppeForm group={group} />
                        </div>
                    </CardWithBackground>
                </div>
                {(isOwner || isAdmin) && (
                    <div className="w-full mt-4">
                        <CardWithBackground
                            title="Administrer eiere"
                            backLink={`/faggrupper/${id}`}
                        >
                            <div className="mx-4 my-4">
                                <ManageEiereForm
                                    faggruppeId={id}
                                    eiere={group.eiere ?? []}
                                    isAdmin={isAdmin}
                                />
                            </div>
                        </CardWithBackground>
                    </div>
                )}
                {(isOwner || isAdmin) && (
                    <div className="w-full mt-4">
                        <CardWithBackground
                            title="Faresone"
                            backLink={`/faggrupper/${id}`}
                        >
                            <div className="mx-4 my-4">
                                <DeleteFaggruppeButton faggruppeId={id} />
                            </div>
                        </CardWithBackground>
                    </div>
                )}
            </div>
    );
}
