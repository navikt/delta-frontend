"use client";
import { Button } from "@navikt/ds-react";
import { joinEvent, leaveEvent } from "./joinEvent";
import { DeltaEventWithParticipant } from "@/types/event";
import { User } from "@/types/user";

export default function JoinEventButton({
  event,
  participants,
  user,
}: DeltaEventWithParticipant & { user: User }) {
  const isParticipant = participants.map((p) => p.email).includes(user.email);
  return (
    <form
      action={isParticipant ? leaveEvent : joinEvent}
      className="w-full max-w-[12rem] h-full"
    >
      <input type="hidden" name="id" value={event.id} />
      <Button
        type="submit"
        variant={isParticipant ? "danger" : "primary"}
        className="w-full h-fit"
      >
        {isParticipant ? "Meld av" : "Bli med"}
      </Button>
    </form>
  );
}
