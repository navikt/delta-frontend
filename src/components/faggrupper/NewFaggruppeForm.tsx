"use client"
import { useState } from 'react';
import { Button } from '@navikt/ds-react';
import { useRouter } from 'next/navigation';
import { createFaggruppe } from '@/service/faggruppeActions';
import { FAGGRUPPE_REQUEST_FAILED_MESSAGE } from '@/types/faggruppe';
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
            const result = await createFaggruppe(toSubmitData(formData));
            if (result.ok) {
                router.push(`/faggrupper/${result.data.id}`);
            } else {
                setError(result.message);
            }
        } catch {
            setError(FAGGRUPPE_REQUEST_FAILED_MESSAGE);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FaggruppeFormFields formData={formData} onChange={setFormData} />

            {error && <p className="text-ax-danger-700">{error}</p>}

            <Button variant="primary" type="submit" loading={loading}>
                Opprett faggruppe
            </Button>
        </form>
    );
}
