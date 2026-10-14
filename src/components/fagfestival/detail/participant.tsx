import type { DeltaParticipant } from "@/types/event";

type ParticipantProps = DeltaParticipant & { owner: boolean };

export default function Participant(participant: ParticipantProps) {
  return (
    <div className="flex flex-row items-center justify-between w-full gap-2">
      <span className="flex items-center gap-2">
        {participant.name.split(", ").reverse().join(" ")}
      </span>
      {participant.owner && (
        <span className="bg-ax-neutral-600 text-ax-text-on-inverted cursor-default rounded-xl px-2">
          arrangør
        </span>
      )}
    </div>
  );
}
