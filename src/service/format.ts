import { DeltaEvent } from "@/types/event";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { nb } from "date-fns/locale/nb";
import type { RecurrenceFrequency } from "@/types/event";

const fmt = "EEEE do MMMM, HH:mm";
const fmtShort = "EEEE do MMMM";
const fmtDate = "do MMMM yyyy";

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
  /*const end = new Date(event.endTime);*/

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

export const isComingSoonTimeRange = (event: DeltaEvent): boolean => {
  const startTime = event.startTime.substring(11, 16);
  const endTime = event.endTime.substring(11, 16);

  return startTime === "00:00" && endTime === "00:01";
};

export const formatEventTimeRange = (event: DeltaEvent): string => {
  return `${event.startTime.substring(11, 16)} – ${event.endTime.substring(11, 16)}`;
};

export const formatEventTimeRangeOrComingSoon = (event: DeltaEvent): string => {
  if (isComingSoonTimeRange(event)) {
    return "Kommer senere";
  }

  return formatEventTimeRange(event);
};

export const midnightDate = (dateString: string): Date => {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
};

const frequencyLabels: Record<RecurrenceFrequency, string> = {
  WEEKLY: "Ukentlig",
  BIWEEKLY: "Annenhver uke",
  MONTHLY: "Månedlig",
};

export const formatRecurrenceFrequency = (
  frequency: RecurrenceFrequency,
): string => {
  return frequencyLabels[frequency] ?? frequency;
};

export const formatRecurrenceUntilDate = (untilDate: string): string => {
  return format(new Date(untilDate), fmtDate, { locale: nb });
};
