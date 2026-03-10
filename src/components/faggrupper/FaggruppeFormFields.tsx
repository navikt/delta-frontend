import { TextField, Textarea } from '@navikt/ds-react';

export type FaggruppeType = 'faggruppe';

export interface FaggruppeFormData {
    navn: string;
    type: FaggruppeType;
    undertittel: string;
    beskrivelse: string;
    malgruppe: string;
    tidspunkt: string;
    starttid: string;
    sluttid: string;
}

export const defaultFaggruppeFormData: FaggruppeFormData = {
    navn: '',
    type: 'faggruppe',
    undertittel: '',
    beskrivelse: '',
    malgruppe: '',
    tidspunkt: '',
    starttid: '',
    sluttid: '',
};

export function toSubmitData(formData: FaggruppeFormData) {
    return {
        ...formData,
        beskrivelse: formData.beskrivelse || null,
        undertittel: formData.undertittel || null,
        malgruppe: formData.malgruppe || null,
        tidspunkt: formData.tidspunkt || null,
        starttid: formData.starttid || null,
        sluttid: formData.sluttid || null,
    };
}

interface Props {
    formData: FaggruppeFormData;
    onChange: (data: FaggruppeFormData) => void;
}

export default function FaggruppeFormFields({ formData, onChange }: Props) {
    const set = (field: keyof FaggruppeFormData) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            onChange({ ...formData, [field]: e.target.value });

    return (
        <>
            <TextField
                label="Navn på faggruppe"
                required
                value={formData.navn}
                onChange={set('navn')}
            />

            <TextField
                label="Kortbeskrivelse / undertittel"
                description="Valgfritt. Støtter Markdown-formatering."
                value={formData.undertittel}
                onChange={set('undertittel')}
            />

            <TextField
                label="Målgruppe"
                description='F.eks. "Åpen for alle" eller "Kun for utviklere"'
                value={formData.malgruppe}
                onChange={set('malgruppe')}
            />

            <TextField
                label="Tidspunkt / møtefrekvens"
                description='F.eks. "Hver fagtorsdag" eller "En gang i måneden"'
                value={formData.tidspunkt}
                onChange={set('tidspunkt')}
            />

            <div className="flex gap-4">
                <TextField
                    label="Møtestart"
                    type="time"
                    value={formData.starttid}
                    onChange={set('starttid')}
                />
                <TextField
                    label="Møteslutt"
                    type="time"
                    value={formData.sluttid}
                    onChange={set('sluttid')}
                />
            </div>

            <Textarea
                label="Beskrivelse"
                description="Støtter Markdown-formatering."
                value={formData.beskrivelse}
                onChange={set('beskrivelse')}
                minRows={5}
            />
        </>
    );
}
