"use client"
import { useState } from 'react';
import { Button, ConfirmationPanel } from '@navikt/ds-react';
import { TrashIcon } from '@navikt/aksel-icons';
import { useRouter } from 'next/navigation';
import { deleteFaggruppe } from '@/service/faggruppeActions';

export default function DeleteFaggruppeButton({ faggruppeId }: { faggruppeId: string }) {
    const router = useRouter();
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setLoading(true);
        setError(null);

        const result = await deleteFaggruppe(faggruppeId);
        if (!result.ok) {
            setError(result.message);
            setLoading(false);
            return;
        }
        router.push('/faggrupper');
    };

    if (!confirming) {
        return (
            <Button
                variant="danger"
                icon={<TrashIcon aria-hidden />}
                onClick={() => setConfirming(true)}
            >
                Slett faggruppe
            </Button>
        );
    }

    return (
        <div className="space-y-3">
            <ConfirmationPanel
                checked={false}
                label="Ja, jeg vil slette denne faggruppen permanent."
                onChange={(e) => e.target.checked && handleDelete()}
                error={error ?? undefined}
            >
                Er du sikker? Dette kan ikke angres.
            </ConfirmationPanel>
            <Button
                variant="tertiary"
                type="button"
                onClick={() => setConfirming(false)}
                disabled={loading}
            >
                Avbryt
            </Button>
        </div>
    );
}
