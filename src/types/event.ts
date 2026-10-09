export type RecurrenceFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY";

export type EditScope = "SINGLE" | "UPCOMING";

export type RecurrenceRequest = {
  frequency: RecurrenceFrequency;
  untilDate: string;
  signupDeadlineOffsetDays?: number;
};

export type RecurringSeriesSummary = {
  seriesId: string;
  frequency: RecurrenceFrequency;
  untilDate: string;
  editableScopes: EditScope[];
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
  invitees?: InviteeRequest[];
  recurrence?: RecurrenceRequest;
  editScope?: EditScope;
  /** Feature toggled. Must be sent together with roomName. Omit to keep current room. */
  roomEmail?: string;
  roomName?: string;
  /** Feature toggled. Only ever send true; omit to keep current value. */
  isOnlineMeeting?: boolean;
};

export type RoomStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export type InviteMode = "PER_PARTICIPANT" | "SHARED";

export type CalendarSyncStatus = "PENDING" | "SYNCED" | "FAILED";

export type InvitationStatus = "INVITED" | "REGISTERED" | "DECLINED" | "FORWARDED";

export type Invitation = {
  email: string;
  name: string;
  status: InvitationStatus;
};

export type InviteeRequest = { email: string };

export type DirectoryPerson = {
  id: string;
  name: string;
  email: string;
};

export type FullDeltaEvent = {
  event: DeltaEvent;
  participants: DeltaParticipant[];
  hosts: DeltaParticipant[];
  categories: Category[];
  recurringSeries?: RecurringSeriesSummary;
  invited?: Invitation[];
  calendarSyncError?: string | null;
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
  roomEmail?: string | null;
  roomName?: string | null;
  roomStatus?: RoomStatus | null;
  isOnlineMeeting?: boolean;
  teamsJoinUrl?: string | null;
  teamsConferenceId?: string | null;
  teamsDialIn?: string | null;
  inviteMode?: InviteMode;
  calendarSyncStatus?: CalendarSyncStatus | null;
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
