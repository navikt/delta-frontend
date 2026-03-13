"use client"
import { useState } from 'react';
import { Button, TextField } from '@navikt/ds-react';
import { TrashIcon } from '@navikt/aksel-icons';
import { useRouter } from 'next/navigation';

interface Eier {
    epost: string;
    navn: string | null;
}

interface Props {
    faggruppeId: string;
    eiere: Eier[];
    isAdmin: boolean;
}

export default function ManageEiereForm({ faggruppeId, eiere, isAdmin }: Props) {
    const router = useRouter();
    const [currentEiere, setCurrentEiere] = useState<Eier[]>(eiere);
    const [nyEpost, setNyEpost] = useState('');
    const [addLoading, setAddLoading] = useState(false);
    const [removeLoading, setRemoveLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nyEpost.trim()) return;
        setAddLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/faggrupper/${faggruppeId}/eiere`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ epost: nyEpost.trim() }),
            });
            if (response.status === 403) throw new Error('Du har ikke tilgang til å administrere eiere.');
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error ?? 'Noe gikk galt');
            }
            const nyEier: Eier = await response.json();
            setCurrentEiere(prev => [...prev, nyEier]);
            setNyEpost('');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Noe gikk galt');
        } finally {
            setAddLoading(false);
        }
    };

    const handleRemove = async (epost: string) => {
        setRemoveLoading(epost);
        setError(null);

        try {
            const response = await fetch(`/api/faggrupper/${faggruppeId}/eiere`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ epost }),
            });
            if (response.status === 403) throw new Error('Du har ikke tilgang til å administrere eiere.');
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error ?? 'Noe gikk galt');
            }
            setCurrentEiere(prev => prev.filter((e) => e.epost !== epost));
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Noe gikk galt');
        } finally {
            setRemoveLoading(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {currentEiere.length === 0 && (
                    <p className="text-ax-neutral-600 text-sm">Ingen eiere registrert.</p>
                )}
                {currentEiere.map((eier) => (
                    <div key={eier.epost} className="flex items-center justify-between gap-2 p-2 border rounded">
                        <div>
                            {eier.navn && <span className="font-medium">{eier.navn}</span>}
                            <span className="text-sm text-ax-neutral-700 ml-1">{eier.epost}</span>
                        </div>
                        <Button
                            variant="tertiary-neutral"
                            size="small"
                            icon={<TrashIcon aria-hidden />}
                            loading={removeLoading === eier.epost}
                            onClick={() => handleRemove(eier.epost)}
                            aria-label={`Fjern ${eier.epost} som eier`}
                        />
                    </div>
                ))}
            </div>

            <form onSubmit={handleAdd} className="flex gap-2 items-end">
                <TextField
                    label="Legg til eier (NAV-epost)"
                    type="email"
                    value={nyEpost}
                    onChange={(e) => setNyEpost(e.target.value)}
                    placeholder="fornavn.etternavn@nav.no"
                    className="flex-1"
                />
                <Button variant="secondary" type="submit" loading={addLoading}>
                    Legg til
                </Button>
            </form>

            {error && <p className="text-ax-danger-700 text-sm">{error}</p>}

            {isAdmin && (
                <p className="text-sm text-ax-neutral-600 italic">
                    Du ser dette som administrator og kan administrere eiere for alle faggrupper.
                </p>
            )}
        </div>
    );
}
