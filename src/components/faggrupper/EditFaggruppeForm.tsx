"use client"
import { useState } from 'react';
import { Button, TextField, Select, Textarea } from '@navikt/ds-react';
import { useRouter } from 'next/navigation';

interface Group {
    id: string;
    navn: string;
    undertittel?: string;
    beskrivelse?: string;
    malgruppe?: string;
    type?: string;
    tidspunkt?: string;
    starttid?: string;
    sluttid?: string;
}

export default function EditFaggruppeForm({ group }: { group: Group }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        navn: group.navn ?? '',
        undertittel: group.undertittel ?? '',
        beskrivelse: group.beskrivelse ?? '',
        malgruppe: group.malgruppe ?? '',
        type: group.type ?? 'faggruppe',
        tidspunkt: group.tidspunkt ?? '',
        starttid: group.starttid?.slice(0, 5) ?? '',
        sluttid: group.sluttid?.slice(0, 5) ?? '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const submitData = {
                ...formData,
                beskrivelse: formData.beskrivelse || null,
                starttid: formData.starttid || null,
                sluttid: formData.sluttid || null,
                tidspunkt: formData.tidspunkt || null,
                undertittel: formData.undertittel || null,
                malgruppe: formData.malgruppe || null,
            };

            const response = await fetch(`/api/faggrupper/${group.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            });

            if (response.status === 403) {
                throw new Error('Du har ikke tilgang til å redigere denne faggruppen.');
            }

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
            <TextField
                label="Navn på faggruppe"
                required
                value={formData.navn}
                onChange={(e) => setFormData({ ...formData, navn: e.target.value })}
            />

            <Select
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
                <option value="faggruppe">Faggruppe</option>
                <option value="møteplass">Møteplass</option>
            </Select>

            <TextField
                label="Kortbeskrivelse / undertittel"
                description="Valgfritt. Støtter Markdown-formatering."
                value={formData.undertittel}
                onChange={(e) => setFormData({ ...formData, undertittel: e.target.value })}
            />

            <TextField
                label="Målgruppe"
                description='F.eks. "Åpen for alle" eller "Kun for utviklere"'
                value={formData.malgruppe}
                onChange={(e) => setFormData({ ...formData, malgruppe: e.target.value })}
            />

            <TextField
                label="Tidspunkt / møtefrekvens"
                description='F.eks. "Hver fagtorsdag" eller "En gang i måneden"'
                value={formData.tidspunkt}
                onChange={(e) => setFormData({ ...formData, tidspunkt: e.target.value })}
            />

            <div className="flex gap-4">
                <TextField
                    label="Møtestart"
                    type="time"
                    value={formData.starttid}
                    onChange={(e) => setFormData({ ...formData, starttid: e.target.value })}
                />
                <TextField
                    label="Møteslutt"
                    type="time"
                    value={formData.sluttid}
                    onChange={(e) => setFormData({ ...formData, sluttid: e.target.value })}
                />
            </div>

            <Textarea
                label="Beskrivelse"
                description="Støtter Markdown-formatering."
                value={formData.beskrivelse}
                onChange={(e) => setFormData({ ...formData, beskrivelse: e.target.value })}
                minRows={5}
            />

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
