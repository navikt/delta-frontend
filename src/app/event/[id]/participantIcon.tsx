"use client";

type ParticipantIconProps = {
  name: string;
  type?: string;
};

export default function ParticipantIcon({ name, type }: ParticipantIconProps) {
  if (type === "participantPreview") {
    return (
      <div className="flex justify-center w-7 h-7 text-white text-sm bg-limegreen-700 items-center rounded-full -ml-1 border border-white">
        {`${name.split(", ").at(1)?.charAt(0).toUpperCase()}${name
          .split(", ")
          .at(0)
          ?.charAt(0)
          .toUpperCase()}`}
      </div>
    );
  } else if (type === "participantList") {
    return (
      <div className="flex justify-center w-10 h-10 text-white text-bold bg-limegreen-700 items-center gap-1 rounded-full">
        {`${name.split(", ").at(1)?.charAt(0).toUpperCase()}${name
          .split(" ")
          .at(0)
          ?.charAt(0)
          .toUpperCase()}`}
      </div>
    );
  } else {
    return (
      <div className="flex justify-center w-7 h-7 text-white text-sm bg-limegreen-800 items-center rounded-full -ml-1 border border-white">
        ···
      </div>
    );
  }
}
