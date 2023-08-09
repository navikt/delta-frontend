"use client";
import { DeltaParticipant } from "@/types/event";
import ParticipantIcon from "@/app/event/[id]/participantIcon";

type ParticipantProps = DeltaParticipant & { owner: boolean };

export default function Participant(participant: ParticipantProps) {
  return (
    <div className="flex flex-row items-center justify-between w-full gap-2">
      <span className="flex items-center gap-2">
        <span className="flex-none">
          <ParticipantIcon name={participant.name} type="participantList" />
        </span>
        {participant.name.split(", ").reverse().join(" ")}
      </span>
      {participant.owner && (
        <span className="bg-gray-500 text-surface-subtle cursor-default rounded-xl px-2">
          ARRANGØR
        </span>
      )}
    </div>
  );
}
