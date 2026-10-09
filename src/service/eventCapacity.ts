import { DeltaParticipant, Invitation } from "@/types/event";

export function countCapacityAttendees(
  participants: DeltaParticipant[],
  hosts: DeltaParticipant[],
  invited: Invitation[] = [],
  signupDeadline?: string,
  now = new Date(),
): number {
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
