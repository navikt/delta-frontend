"use client";

type ParticipantIconProps = { nameList?: string[]; type?: string };

export default function ParticipantIcon({
  nameList,
  type,
}: ParticipantIconProps) {
  if (type === "participantPreview") {
    return (
      <div className="flex justify-center w-7 h-7 text-white text-sm bg-border-alt-2 jusitify-center items-center rounded-full">
        {`${nameList.at(0)?.charAt(0).toUpperCase()}${nameList
          .at(-1)
          ?.charAt(0)
          .toUpperCase()}`}
      </div>
    );
  } else if (type === "participantList") {
    return (
      <div className="flex justify-center w-10 h-10 text-white text-bold bg-border-alt-2 jusitify-center items-center gap-1 rounded-full">
        {`${nameList.at(0)?.charAt(0).toUpperCase()}${nameList
          .at(-1)
          ?.charAt(0)
          .toUpperCase()}`}
      </div>
    );
  } else {
    return (
      <div className="flex justify-center w-7 h-7 text-white text-sm bg-border-alt-3 jusitify-center items-center rounded-full">
        ...
      </div>
    );
  }
}
