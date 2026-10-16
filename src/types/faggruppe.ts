import type { FaggruppeType } from "@/components/faggrupper/FaggruppeFormFields";

export interface Faggruppe {
  id: string;
  navn: string;
  type?: FaggruppeType;
  undertittel?: string;
  beskrivelse?: string;
  malgruppe?: string;
  tidspunkt?: string;
  starttid?: string;
  sluttid?: string;
  eiere?: { navn: string | null; epost: string }[];
}

export type FaggruppeActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; status?: number; message: string };
