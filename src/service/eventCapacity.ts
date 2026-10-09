import { DeltaParticipant, Invitation } from "@/types/event";

export type InvitationCapacity = {
  reservedInvitations: number;
  hasOwnReservation: boolean;
};

export function countCapacityAttendees(
  participants: DeltaParticipant[],
  hosts: DeltaParticipant[],
  invited: Invitation[] | number = [],
  signupDeadline?: string,
  now = new Date(),
): number {
  if (typeof invited === "number") {
    const reservationExpired = signupDeadline ? new Date(signupDeadline) <= now : false;
    return participants.length + hosts.length + (reservationExpired ? 0 : invited);
  }
  const reservationExpired = signupDeadline ? new Date(signupDeadline) <= now : false;
  const existingAttendees = new Set(
    [...participants, ...hosts].map((person) => person.email.toLowerCase()),
  );
  const reservedInvitations = reservationExpired
    ? 0
    : invited.filter(
        (invitation) =>
          invitation.status === "INVITED" &&
          !existingAttendees.has(invitation.email.toLowerCase()),
      ).length;
  return participants.length + hosts.length + reservedInvitations;
}

export function isInvitationReservationActive(
  hasReservation: boolean,
  signupDeadline?: string,
  now = new Date(),
): boolean {
  return (
    hasReservation &&
    (!signupDeadline || new Date(signupDeadline) > now)
  );
}

export function getInvitationCapacity(
  participants: DeltaParticipant[],
  hosts: DeltaParticipant[],
  invited: Invitation[] = [],
  email: string,
  signupDeadline?: string,
  now = new Date(),
): InvitationCapacity {
  return {
    reservedInvitations:
      countCapacityAttendees(participants, hosts, invited, signupDeadline, now) -
      participants.length -
      hosts.length,
    hasOwnReservation: hasReservedInvitation(email, invited, signupDeadline, now),
  };
}

export function hasReservedInvitation(
  email: string,
  invited: Invitation[] = [],
  signupDeadline?: string,
  now = new Date(),
): boolean {
  if (signupDeadline && new Date(signupDeadline) <= now) return false;
  return invited.some(
    (invitation) =>
      invitation.email.toLowerCase() === email.toLowerCase() &&
      invitation.status === "INVITED",
  );
}
