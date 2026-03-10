"use client"
import { useState } from 'react';
import { Button } from '@navikt/ds-react';
import { useRouter } from 'next/navigation';
import FaggruppeFormFields, { defaultFaggruppeFormData, FaggruppeFormData, toSubmitData } from './FaggruppeFormFields';

export default function NewFaggruppeForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FaggruppeFormData>(defaultFaggruppeFormData);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/faggrupper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toSubmitData(formData)),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error ?? 'Noe gikk galt');
            }

            const data = await response.json();
            router.refresh();
            router.push(`/faggrupper/${data.id}`);
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

            <Button variant="primary" type="submit" loading={loading}>
                Opprett faggruppe
            </Button>
        </form>
    );
}
