export type Features = {
  roomBooking: boolean;
  teamsMeeting: boolean;
  sharedCalendar: boolean;
  peopleSearch: boolean;
};

export const NO_FEATURES: Features = {
  roomBooking: false,
  teamsMeeting: false,
  sharedCalendar: false,
  peopleSearch: false,
};

export type RoomInfo = {
  displayName: string | null;
  emailAddress: string | null;
  capacity?: number | null;
  building?: string | null;
  floorLabel?: string | null;
  isWheelChairAccessible?: boolean | null;
};

export type RoomAvailability = {
  emailAddress: string;
  /** One char per slot: 0 free, 1 tentative, 2 busy, 3 out of office, 4 working elsewhere */
  availabilityView: string | null;
  error: string | null;
};

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; status?: number; message: string };
