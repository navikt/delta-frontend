"use client"
import { useState } from 'react';
import { BodyShort, Button, ErrorMessage, TextField } from '@navikt/ds-react';
import { TrashIcon } from '@navikt/aksel-icons';
import { addFaggruppeEier, removeFaggruppeEier } from '@/service/faggruppeActions';
import { FAGGRUPPE_REQUEST_FAILED_MESSAGE } from '@/types/faggruppe';

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
            const result = await addFaggruppeEier(faggruppeId, nyEpost.trim());
            if (result.ok) {
                setCurrentEiere(prev => [...prev, result.data]);
                setNyEpost('');
            } else {
                setError(result.message);
            }
        } catch {
            setError(FAGGRUPPE_REQUEST_FAILED_MESSAGE);
        } finally {
            setAddLoading(false);
        }
    };

    const handleRemove = async (epost: string) => {
        setRemoveLoading(epost);
        setError(null);

        try {
            const result = await removeFaggruppeEier(faggruppeId, epost);
            if (result.ok) {
                setCurrentEiere(prev => prev.filter((e) => e.epost !== epost));
            } else {
                setError(result.message);
            }
        } catch {
            setError(FAGGRUPPE_REQUEST_FAILED_MESSAGE);
        } finally {
            setRemoveLoading(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {currentEiere.length === 0 && (
                    <BodyShort size="small" textColor="subtle">Ingen eiere registrert.</BodyShort>
                )}
                {currentEiere.map((eier) => (
                    <div key={eier.epost} className="flex items-center justify-between gap-2 p-2 border border-ax-border-neutral-subtle rounded-ax-8">
                        <div>
                            {eier.navn && <span className="font-medium">{eier.navn}</span>}
                            <BodyShort as="span" size="small" textColor="subtle" className="ml-1">{eier.epost}</BodyShort>
                        </div>
                        <Button
                            variant="tertiary"
                            data-color="neutral"
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

            <div role="alert">{error && <ErrorMessage size="small">{error}</ErrorMessage>}</div>

            {isAdmin && (
                <BodyShort size="small" textColor="subtle" className="italic">
                    Du ser dette som administrator og kan administrere eiere for alle faggrupper.
                </BodyShort>
            )}
        </div>
    );
}
