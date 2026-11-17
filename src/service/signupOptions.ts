import type { DeltaEvent, SignupOption, SignupOptionRequest } from "@/types/event";

export const MAX_SIGNUP_OPTIONS = 10;
export const MIN_SIGNUP_OPTIONS = 2;
const MAX_LABEL_LENGTH = 100;
const MAX_LIMIT = 9999;

export function signupOptionsOf(event: Pick<DeltaEvent, "signupOptions">): SignupOption[] {
  return event.signupOptions ?? [];
}

export function hasSignupOptions(event: Pick<DeltaEvent, "signupOptions">): boolean {
  return signupOptionsOf(event).length > 0;
}

/** Whether any wait list can exist, at event level or in one of the options. */
export function usesWaitlist(event: Pick<DeltaEvent, "signupOptions" | "waitlistEnabled">): boolean {
  return !!event.waitlistEnabled || signupOptionsOf(event).some((option) => option.waitlistEnabled);
}

/** Free places in an option, or null when it has no organizer-configured limit. */
export function remainingSeats(option: SignupOption): number | null {
  if (option.participantLimit <= 0) return null;
  return Math.max(0, option.participantLimit - option.allocatedSeats);
}

export function isOptionFull(option: SignupOption): boolean {
  return remainingSeats(option) === 0;
}

/** Whether a new registration in the option has to go through its wait list. */
export function requiresWaitlist(option: SignupOption): boolean {
  return option.waitlistEnabled && (isOptionFull(option) || option.waitlistCount > 0);
}

export function optionById(options: SignupOption[], id?: string | null): SignupOption | undefined {
  return id ? options.find((option) => option.id === id) : undefined;
}

/** Short capacity status, for example "12 av 30 plasser" or "40 påmeldt". */
export function optionCapacityText(option: SignupOption): string {
  if (option.participantLimit <= 0) return `${option.allocatedSeats} påmeldt`;
  return `${option.allocatedSeats} av ${option.participantLimit} plasser`;
}

/** Describes what happens if the person chooses the option. */
export function optionAvailabilityText(option: SignupOption): string {
  const remaining = remainingSeats(option);
  if (remaining === null) return "Ingen begrensning på antall plasser";
  if (requiresWaitlist(option)) {
    const queue = option.waitlistCount === 1 ? "1 står" : `${option.waitlistCount} står`;
    return remaining === 0
      ? `Fullt. Du kan stå på venteliste (${queue} i kø).`
      : `${queue} på venteliste. Du kan stå på venteliste.`;
  }
  if (remaining === 0) return "Fullt";
  return `${remaining} ${remaining === 1 ? "ledig plass" : "ledige plasser"} av ${option.participantLimit}`;
}

/** Form state for one option row; limit is the raw text input, blank meaning no limit. */
export type SignupOptionDraft = {
  id: string;
  label: string;
  limit: string;
  waitlistEnabled: boolean;
};

export type SignupOptionDraftErrors = {
  rows: Record<string, { label?: string; limit?: string }>;
  group?: string;
};

export function draftsFromOptions(options: SignupOption[]): SignupOptionDraft[] {
  return options.map((option) => ({
    id: option.id,
    label: option.label,
    limit: option.participantLimit > 0 ? String(option.participantLimit) : "",
    waitlistEnabled: option.waitlistEnabled,
  }));
}

export function newDraft(id: string, label = ""): SignupOptionDraft {
  return { id, label, limit: "", waitlistEnabled: false };
}

function parseLimit(limit: string): number | null {
  const trimmed = limit.trim();
  if (trimmed === "") return 0;
  if (!/^[0-9]+$/.test(trimmed)) return null;
  const value = Number.parseInt(trimmed, 10);
  return value >= 1 && value <= MAX_LIMIT ? value : null;
}

/** [minimum] is 2 when converting an event and 1 for an event that already has options. */
export function validateSignupOptionDrafts(
  drafts: SignupOptionDraft[],
  minimum = MIN_SIGNUP_OPTIONS,
): SignupOptionDraftErrors | null {
  const rows: SignupOptionDraftErrors["rows"] = {};
  const seen = new Set<string>();
  for (const draft of drafts) {
    const label = draft.label.trim();
    const errors: { label?: string; limit?: string } = {};
    if (!label) errors.label = "Du må gi alternativet et navn";
    else if (label.length > MAX_LABEL_LENGTH) errors.label = `Navnet kan ha maks ${MAX_LABEL_LENGTH} tegn`;
    else if (seen.has(label.toLowerCase())) errors.label = "To alternativer kan ikke ha samme navn";
    seen.add(label.toLowerCase());
    const limit = parseLimit(draft.limit);
    if (limit === null) errors.limit = `Må være mellom 1 og ${MAX_LIMIT}, eller tomt`;
    else if (draft.waitlistEnabled && limit === 0) errors.limit = "Venteliste krever et maksimalt antall plasser";
    if (errors.label || errors.limit) rows[draft.id] = errors;
  }
  const group = drafts.length < minimum
    ? minimum === 1 ? "Behold minst ett alternativ" : `Legg til minst ${minimum} alternativer`
    : drafts.length > MAX_SIGNUP_OPTIONS
      ? `Du kan ha maks ${MAX_SIGNUP_OPTIONS} alternativer`
      : undefined;
  return Object.keys(rows).length || group ? { rows, group } : null;
}

export function toSignupOptionRequests(drafts: SignupOptionDraft[]): SignupOptionRequest[] {
  return drafts.map((draft) => {
    const participantLimit = parseLimit(draft.limit) ?? 0;
    return {
      id: draft.id,
      label: draft.label.trim(),
      participantLimit,
      waitlistEnabled: participantLimit > 0 && draft.waitlistEnabled,
    };
  });
}
