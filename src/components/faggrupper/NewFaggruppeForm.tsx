"use client"
import { useState } from 'react';
import { Button, TextField, Select, Textarea } from '@navikt/ds-react';
import { useRouter } from 'next/navigation';

export default function NewFaggruppeForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        navn: '',
        undertittel: '',
        beskrivelse: '',
        malgruppe: '',
        type: 'faggruppe',
        tidspunkt: '',
        starttid: '',
        sluttid: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const submitData = {
                ...formData,
                starttid: formData.starttid || null,
                sluttid: formData.sluttid || null,
                tidspunkt: formData.tidspunkt || null,
                undertittel: formData.undertittel || null,
                malgruppe: formData.malgruppe || null,
            };

            const response = await fetch('/api/faggrupper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
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

            <Button variant="primary" type="submit" loading={loading}>
                Opprett faggruppe
            </Button>
        </form>
    );
}
