type ParticipantIconProps = {
  name: string;
  type?: string;
};

export default function ParticipantIcon({ name, type }: ParticipantIconProps) {
  if (type === "participantPreview") {
    return (
      <div className="flex justify-center w-7 h-7 text-ax-text-success-contrast text-sm bg-ax-bg-success-strong items-center rounded-full -ml-1 border border-ax-bg-default">
        {`${name.split(", ").at(1)?.charAt(0).toUpperCase()}${name
          .split(", ")
          .at(0)
          ?.charAt(0)
          .toUpperCase()}`}
      </div>
    );
  } else if (type === "participantList") {
    return (
      <div className="flex justify-center w-10 h-10 text-ax-text-success-contrast font-ax-bold bg-ax-bg-success-strong items-center gap-1 rounded-full">
        {`${name.split(", ").at(1)?.charAt(0).toUpperCase()}${name
          .split(" ")
          .at(0)
          ?.charAt(0)
          .toUpperCase()}`}
      </div>
    );
  } else {
    return (
      <div className="flex justify-center w-7 h-7 text-ax-text-success-contrast text-sm bg-ax-bg-success-strong-pressed items-center rounded-full -ml-1 border border-ax-bg-default">
        ···
      </div>
    );
  }
}
