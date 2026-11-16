import { DeltaParticipant } from "@/types/event";
import { Tag } from "@navikt/ds-react";

type ParticipantProps = DeltaParticipant & { owner: boolean };

export default function Participant(participant: ParticipantProps) {
  return (
    <div className="flex flex-row items-center justify-between w-full gap-2">
      <span className="flex items-center gap-2">
        {participant.name.split(", ").reverse().join(" ")}
      </span>
      {participant.owner && (
        <Tag size="small" variant="strong" data-color="neutral">
          arrangør
        </Tag>
      )}
    </div>
  );
}
