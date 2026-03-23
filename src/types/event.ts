export type RecurrenceFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY";

export type EventEditScope = "SINGLE" | "UPCOMING";

export type RecurrenceRequest = {
  frequency: RecurrenceFrequency;
  untilDate: string; // yyyy-MM-dd
};

export type RecurringSeriesSummary = {
  seriesId: string;
  frequency: RecurrenceFrequency;
  untilDate: string; // yyyy-MM-dd
  editableScopes: EventEditScope[];
};

export type CreateDeltaEvent = {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  public: boolean;
  participantLimit: number;
  signupDeadline?: string;
  sendNotificationEmail?: boolean;
  recurrence?: RecurrenceRequest;
  editScope?: EventEditScope;
};

export type FullDeltaEvent = {
  event: DeltaEvent;
  participants: DeltaParticipant[];
  hosts: DeltaParticipant[];
  categories: Category[];
  recurringSeries?: RecurringSeriesSummary;
};

export type DeltaEvent = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  public: boolean;
  participantLimit: number;
  signupDeadline?: string;
};

export type TemplateDeltaEvent = {
  title: string;
  description: string;
  location: string;
  public: boolean;
  participantLimit: number;
};

export enum EditTypeEnum {
  NEW,
  EDIT,
  TEMPLATE,
}

export type DeltaParticipant = {
  email: string;
  name: string;
};

export type ChangeDeltaParticipant = {
  email: string;
  type: "PARTICIPANT" | "HOST";
};

export type Category = {
  id: number;
  name: string;
};

export type FilterOption = "vis-tidligere" | "vis-programoversikt";

export enum TimeSelector {
  PAST,
  FUTURE,
}
