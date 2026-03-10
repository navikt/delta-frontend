"use client"
import { useState } from 'react';
import { Button } from '@navikt/ds-react';
import { useRouter } from 'next/navigation';
import FaggruppeFormFields, { FaggruppeFormData, FaggruppeType, toSubmitData } from './FaggruppeFormFields';

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
}

export default function EditFaggruppeForm({ group }: { group: Group }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FaggruppeFormData>({
        navn: group.navn ?? '',
        type: group.type ?? 'faggruppe',
        undertittel: group.undertittel ?? '',
        beskrivelse: group.beskrivelse ?? '',
        malgruppe: group.malgruppe ?? '',
        tidspunkt: group.tidspunkt ?? '',
        starttid: group.starttid?.slice(0, 5) ?? '',
        sluttid: group.sluttid?.slice(0, 5) ?? '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/faggrupper/${group.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toSubmitData(formData)),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error ?? 'Noe gikk galt');
            }

            router.refresh();
            router.push(`/faggrupper/${group.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Noe gikk galt');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FaggruppeFormFields formData={formData} onChange={setFormData} />

            {error && <p className="text-red-600">{error}</p>}

            <div className="flex gap-3">
                <Button variant="primary" type="submit" loading={loading}>
                    Lagre endringer
                </Button>
                <Button
                    variant="tertiary"
                    type="button"
                    onClick={() => router.push(`/faggrupper/${group.id}`)}
                >
                    Avbryt
                </Button>
            </div>
        </form>
    );
}
