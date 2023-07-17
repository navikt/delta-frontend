"use client";
import { DeltaEvent, DeltaParticipant } from "@/types/event";
import { BodyLong, Detail, Heading, Button } from "@navikt/ds-react";
import { joinEvent } from "@/app/event/[id]/eventActions";
import { User } from "@/types/user";
type EventProps = {
  event: DeltaEvent;
  participants: DeltaParticipant[];
  user: User;
};

export function Event({ event, participants, user }: EventProps) {
  const isParticipant = participants.map((p) => p.email).includes(user.email);
  return (
    <>
      <Heading level="1" size="large">
        {event.title}
      </Heading>
      <Detail className="flex gap-1 items-center">
        {event.startTime} - {event.endTime}
      </Detail>
      <BodyLong className="flex gap-1 items-center">
        {event.description}
      </BodyLong>
      <form action={joinEvent}>
        <input type="hidden" name="id" value={event.id} />
        <Button type="submit">Bli med</Button>
      </form>
      {console.log(participants, user)}
      {console.log(isParticipant)}
    </>
  );
}
