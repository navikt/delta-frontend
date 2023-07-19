import { DeltaEvent } from "@/types/event";
import { format, formatDuration, intervalToDuration, parseISO } from "date-fns";
import { getTimezoneOffset } from "date-fns-tz";
import nb from "date-fns/locale/nb";

const fmt = "do MMMM yyyy, HH:mm";
// TODO: let's do this better!!!

export const formatEventTimes = (event: DeltaEvent): string => {
  const [start, end] = dates(event);

  return `${format(start, fmt, { locale: nb })} - ${format(
    end,
    isSameDay(start, end) ? "HH:mm" : fmt,
    { locale: nb },
  )}`;
};

export const isSameDay = (start: Date, end: Date): boolean => {
  return format(start, "do MM yyyy") === format(end, "do MM yyyy");
};

export const formatEventDuration = (event: DeltaEvent): string => {
  const [start, end] = dates(event);

  return formatDuration(intervalToDuration({ start, end }), {
    locale: nb,
    delimiter: ", ",
  });
};

export const dates = (event: DeltaEvent): [Date, Date] => {
  const offset = getTimezoneOffset("Europe/Oslo");
  var start = parseISO(event.startTime);
  var end = parseISO(event.endTime);
  start.setTime(start.getTime() - offset);
  end.setTime(end.getTime() - offset);
  return [start, end];
};

export const adjustTimezoneForward = (date: Date): Date => {
  const offset = getTimezoneOffset("Europe/Oslo");
  date.setTime(date.getTime() + offset);
  return date
}
