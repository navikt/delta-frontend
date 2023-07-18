"use client";
import { Button } from "@navikt/ds-react";
import { getEvent, joinEvent, leaveEvent } from "./eventActions";
import { DeltaEventWithParticipant, DeltaParticipant } from "@/types/event";
import { User } from "@/types/user";
import { Dispatch, SetStateAction, useState } from "react";

type JoinEventButtonParams = DeltaEventWithParticipant & { user: User } & {
  setParticipants: Dispatch<SetStateAction<DeltaParticipant[]>>;
};
export default function JoinEventButton({
  event,
  participants,
  user,
  setParticipants,
}: JoinEventButtonParams) {
  const [isLoading, setIsLoading] = useState(false);
  const isParticipant = participants.map((p) => p.email).includes(user.email);

  return (
    <form
      action={() =>
        toggleEventStatus(
          event.id,
          isParticipant,
          setParticipants,
          setIsLoading,
        )
      }
      className="w-full max-w-[12rem] h-full"
    >
      <Button
        type="submit"
        variant={isParticipant ? "danger" : "primary"}
        className="w-full h-fit"
        loading={isLoading}
      >
        {isParticipant ? "Meld av" : "Bli med"}
      </Button>
    </form>
  );
}

async function toggleEventStatus(
  eventId: string,
  isParticipant: boolean,
  setParticipants: Dispatch<SetStateAction<DeltaParticipant[]>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
) {
  setIsLoading(true);
  await (isParticipant ? leaveEvent(eventId) : joinEvent(eventId));
  setParticipants((await getEvent(eventId)).participants);
  setIsLoading(false);
}
