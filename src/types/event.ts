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
  waitlistEnabled?: boolean;
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
  /** Feature toggled, SHARED events only. Omit to keep the current options. */
  signupOptions?: SignupOptionRequest[];
};

/** An organizer-defined way to attend (for example physically or digitally) with its own capacity. */
export type SignupOption = {
  id: string;
  label: string;
  /** 0 means no limit other than the calendar attendee ceiling. */
  participantLimit: number;
  waitlistEnabled: boolean;
  /** Registrations and open invitations in this option. Hosts never count. */
  allocatedSeats: number;
  waitlistCount: number;
};

export type SignupOptionRequest = {
  /** Existing option to update, or a client-generated id for a new option. */
  id?: string;
  label: string;
  participantLimit: number;
  waitlistEnabled: boolean;
};

export type RoomStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export type InviteMode = "PER_PARTICIPANT" | "SHARED";

export type CalendarSyncStatus = "PENDING" | "SYNCED" | "FAILED";

export type InvitationStatus = "INVITED" | "REGISTERED" | "DECLINED" | "FORWARDED";

export type Invitation = {
  email: string;
  name: string;
  status: InvitationStatus;
  signupOptionId?: string | null;
};

export type InviteeRequest = { email: string; signupOptionId?: string };

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
  waitlistEnabled?: boolean;
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
  /** Empty or missing for events without signup options. */
  signupOptions?: SignupOption[];
};

export type TemplateDeltaEvent = {
  title: string;
  description: string;
  location: string;
  public: boolean;
  participantLimit: number;
  waitlistEnabled?: boolean;
};

export type WaitlistState = {
  enabled: boolean;
  count: number;
  position: number | null;
  registered: boolean;
  open: boolean;
  /** The caller's option when registered or queued on an event with signup options. */
  signupOptionId?: string | null;
};

export type WaitlistEntry = { email: string; name: string; position: number; signupOptionId?: string | null };
// hosts is optional until the backend that returns it is deployed.
export type MyWaitlistEvent = {
  event: DeltaEvent;
  position: number;
  open: boolean;
  hosts?: DeltaParticipant[];
  /** The option the caller queues for; the position is counted within that option. */
  signupOptionId?: string | null;
};

export enum EditTypeEnum {
  NEW,
  EDIT,
  TEMPLATE,
}

export type DeltaParticipant = {
  email: string;
  name: string;
  /** Null for hosts and for events without signup options. */
  signupOptionId?: string | null;
};

export type ChangeDeltaParticipant = {
  email: string;
  type: "PARTICIPANT" | "HOST";
  signupOptionId?: string;
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
