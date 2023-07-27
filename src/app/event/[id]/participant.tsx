"use client";
import { DeltaParticipant } from "@/types/event";
import ParticipantIcon from "@/app/event/[id]/participantIcon";

type ParticipantProps = DeltaParticipant & { owner: boolean };

export default function Participant(participant: ParticipantProps) {
  const nameList = participant.email.split("@")[0].split(".");
  const name = nameList
    .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
    .join(" ");

  return (
    <div className="flex flex-row items-center justify-between w-full gap-2">
      <div className="flex flex-row items-center gap-2">
        <ParticipantIcon nameList={nameList} type="participantList" />
        <span className="text-md">
          {name}
          {participant.owner && " (arrangør)"}
        </span>
      </div>
    </div>
  );
}
