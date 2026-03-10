import { checkToken, getDeltaBackendAccessToken, getUser, isFaggruppeAdmin } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EditFaggruppeForm from "@/components/faggrupper/EditFaggruppeForm";
import ManageEiereForm from "@/components/faggrupper/ManageEiereForm";
import { FaggruppeType } from "@/components/faggrupper/FaggruppeFormFields";
import { redirect } from "next/navigation";

interface Group {
    id: string;
    navn: string;
    undertittel?: string;
    beskrivelse?: string;
    malgruppe?: string;
    type?: FaggruppeType;
    tidspunkt?: string;
    starttid?: string;
    sluttid?: string;
    eiere?: { navn: string | null; epost: string }[];
}

// @ts-ignore
export default async function RedigerFaggrupePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await checkToken(`/faggrupper/${id}/rediger`);

    const token = await getDeltaBackendAccessToken();
    const apiUrl = process.env.NODE_ENV === 'production'
        ? `http://delta-backend/api/faggrupper/${id}`
        : `http://localhost:8080/api/faggrupper/${id}`;

    const [groupResponse, user, isAdmin] = await Promise.all([
        fetch(apiUrl, {
            headers: { Authorization: `Bearer ${token ?? 'placeholder-token'}` },
            cache: 'no-store',
        }),
        getUser(),
        isFaggruppeAdmin(),
    ]);

    if (!groupResponse.ok) {
        redirect('/faggrupper');
    }

    const group: Group = await groupResponse.json();

    const isOwner = group.eiere?.some(
        (e) => e.epost.toLowerCase() === user.email.toLowerCase()
    ) ?? false;

    if (!isOwner && !isAdmin && process.env.NODE_ENV !== 'development') {
        redirect(`/faggrupper/${id}`);
    }

    return (
        <>
            <head>
                <title>Rediger faggruppe Δ Delta</title>
            </head>
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
            </div>
        </>
    );
}
