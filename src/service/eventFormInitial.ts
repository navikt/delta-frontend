import type { Category, DeltaEvent, EditTypeEnum, FullDeltaEvent, RecurringSeriesSummary, TemplateDeltaEvent } from "@/types/event";

export type InitialEventForm =
  | { mode: "new" }
  | { mode: "edit"; source: FullDeltaEvent }
  | { mode: "template"; source: FullDeltaEvent };

export type RichEvent =
  | { type: EditTypeEnum.NEW }
  | { type: EditTypeEnum.EDIT; event: DeltaEvent; recurringSeries?: RecurringSeriesSummary }
  | { type: EditTypeEnum.TEMPLATE; event: TemplateDeltaEvent };

export function eventFormIdentity(initial: InitialEventForm) {
  return initial.mode === "new" ? "new" : `${initial.mode}:${initial.source.event.id}`;
}

export function initializeEventForm(initial: InitialEventForm): {
  richEvent: RichEvent; selectedCategories: Category[]; existingAttendeeEmails: string[];
} {
  if (initial.mode === "new") return { richEvent: { type: 0 }, selectedCategories: [], existingAttendeeEmails: [] };
  if (!initial.source) throw new Error("Missing event form source");
  const source = initial.source;
  const richEvent: RichEvent = initial.mode === "edit"
    ? { type: 1, event: source.event, recurringSeries: source.recurringSeries }
    : { type: 2, event: {
      title: source.event.title, description: source.event.description,
      location: source.event.location, public: source.event.public, participantLimit: source.event.participantLimit,
    } };
  return {
    richEvent,
    selectedCategories: source.categories,
    existingAttendeeEmails: [
      ...source.hosts.map(person => person.email),
      ...source.participants.map(person => person.email),
      ...(source.invited ?? []).map(person => person.email),
    ],
  };
}
