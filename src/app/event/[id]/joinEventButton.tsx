"use client";
import { Button } from "@navikt/ds-react";
import { joinEvent, leaveEvent } from "./eventActions";
import { DeltaEventWithParticipant } from "@/types/event";
import { User } from "@/types/user";
import { NextRouter, useRouter } from "next/router";
import { useState } from "react";

export default function JoinEventButton({
  event,
  participants,
  user,
}: DeltaEventWithParticipant & { user: User }) {
  const [isParticipant, setParticipant] = useState(participants.map((p) => p.email).includes(user.email));
  return (
    <form
      action={(f: FormData) => setParticipant(toggleEventStatus(f, isParticipant))}
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

function toggleEventStatus(formData: FormData, isParticipant: boolean) {
  isParticipant ? leaveEvent(formData) : joinEvent(formData)
  return !isParticipant
}