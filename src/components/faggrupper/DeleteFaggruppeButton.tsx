"use client"
import { useState } from 'react';
import { Button, ConfirmationPanel } from '@navikt/ds-react';
import { TrashIcon } from '@navikt/aksel-icons';
import { useRouter } from 'next/navigation';

export default function DeleteFaggruppeButton({ faggruppeId }: { faggruppeId: string }) {
    const router = useRouter();
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/faggrupper/${faggruppeId}`, {
                method: 'DELETE',
            });
            if (response.status === 403) throw new Error('Du har ikke tilgang til å slette denne faggruppen.');
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error ?? 'Noe gikk galt');
            }
            router.push('/faggrupper');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Noe gikk galt');
            setLoading(false);
        }
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
