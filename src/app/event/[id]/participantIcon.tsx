"use client";

type ParticipantIconProps = {
  nameList: string[];
  type?: string;
  className?: string;
};

export default function ParticipantIcon({
  nameList,
  type,
  className,
}: ParticipantIconProps) {
  if (type === "participantPreview") {
    return (
      <div className="flex justify-center w-7 h-7 text-white text-sm bg-limegreen-700 items-center rounded-full -ml-1 border border-white">
        {`${nameList.at(0)?.charAt(0).toUpperCase()}${nameList
          .at(-1)
          ?.charAt(0)
          .toUpperCase()}`}
      </div>
    );
  } else if (type === "participantList") {
    return (
      <div className="flex justify-center w-10 h-10 text-white text-bold bg-limegreen-700 items-center gap-1 rounded-full">
        {`${nameList.at(0)?.charAt(0).toUpperCase()}${nameList
          .at(-1)
          ?.charAt(0)
          .toUpperCase()}`}
      </div>
    );
  } else {
    return (
      <div className="flex justify-center w-7 h-7 text-white text-sm bg-limegreen-800 items-center rounded-full -ml-1">
        ...
      </div>
    );
  }
}
