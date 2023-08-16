import { DeltaEvent } from "@/types/event";
import { format, formatDuration, intervalToDuration } from "date-fns";
import nb from "date-fns/locale/nb";

const fmt = "EEEE do MMMM, HH:mm";
const fmtShort = "EEEE do MMMM";

export const formatEventTimes = (event: DeltaEvent): string => {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  return `${format(start, fmt, { locale: nb })} - ${format(
    end,
    isSameDay(start, end) ? "HH:mm" : fmt,
    { locale: nb },
  )}`;
};

export const formatEventDates = (event: DeltaEvent): string => {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  return `${format(start, fmtShort, { locale: nb })}`;
};

export const formatDeadline = (event: DeltaEvent): string | undefined => {
  const deadline = event.signupDeadline
    ? new Date(event.signupDeadline)
    : undefined;

  return deadline ? `${format(deadline, fmt, { locale: nb })}` : undefined;
};

export const isSameDay = (start: Date, end: Date): boolean => {
  return format(start, "do MM yyyy") === format(end, "do MM yyyy");
};

export const formatEventDuration = (event: DeltaEvent): string => {
  return formatDuration(
    intervalToDuration({
      start: new Date(event.startTime),
      end: new Date(event.endTime),
    }),
    {
      locale: nb,
      delimiter: ", ",
    },
  );
};

export const midnightDate = (dateString: string): Date => {
  var date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
};
