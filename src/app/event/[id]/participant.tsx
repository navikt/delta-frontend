"use client";
import { DeltaParticipant } from "@/types/event";

type ParticipantProps = DeltaParticipant;

export default function Participant(participant: ParticipantProps) {
  const nameList = participant.email.split("@")[0].split(".");
  const name = nameList
    .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
    .join(" ");

  return (
    <div className="flex flex-row items-center w-full gap-2">
      <div className="flex justify-center w-10 h-10 text-white text-bold bg-border-alt-2  jusitify-center items-center gap-2 rounded-full">{`${nameList[0]
        .charAt(0)
        .toUpperCase()}${nameList.at(-1)?.charAt(0).toUpperCase()}`}</div>
      <span className="text-md">{name}</span>
    </div>
  );
}
