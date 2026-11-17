import { addDays, differenceInCalendarDays, format, isSameDay } from "date-fns";
import { nb } from "date-fns/locale";

export type EventDayGroup<T> = {
  key: string;
  label: string;
  dateLabel: string;
  isFagtorsdag: boolean;
  events: T[];
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Groups events by their browser-local start day. Zone-less backend times are
 * interpreted in the browser's timezone, so call this only after hydration.
 */
export function groupEventsByDay<T extends { event: { startTime: string } }>(
  events: T[],
  now: number,
  { descending = false }: { descending?: boolean } = {},
): EventDayGroup<T>[] {
  const today = new Date(now);
  const tomorrow = addDays(today, 1);
  const sorted = [...events].sort((a, b) =>
    new Date(a.event.startTime).getTime() - new Date(b.event.startTime).getTime());
  const groups = new Map<string, EventDayGroup<T>>();
  for (const item of sorted) {
    const start = new Date(item.event.startTime);
    const key = format(start, "yyyy-MM-dd");
    const group = groups.get(key);
    if (group) {
      group.events.push(item);
      continue;
    }
    const relative = isSameDay(start, today) ? "I dag" : isSameDay(start, tomorrow) ? "I morgen" : null;
    const year = start.getFullYear() === today.getFullYear() ? "" : " yyyy";
    groups.set(key, {
      key,
      label: relative ?? capitalize(format(start, "EEEE", { locale: nb })),
      dateLabel: format(start, `${relative ? "EEEE " : ""}d. MMMM${year}`, { locale: nb }),
      isFagtorsdag: differenceInCalendarDays(start, new Date(2026, 10, 26)) % 14 === 0,
      events: [item],
    });
  }
  const result = [...groups.values()];
  return descending ? result.reverse() : result;
}

export function getEventTimeStatus(event: { startTime: string; endTime: string }, now: number | null) {
  if (now === null || (event.startTime.substring(11, 16) === "00:00" && event.endTime.substring(11, 16) === "00:01")) {
    return null;
  }
  if (now >= new Date(event.endTime).getTime()) return "ended";
  if (now >= new Date(event.startTime).getTime()) return "ongoing";
  return "upcoming";
}

/** Time range for a card under a day heading; multi-day events also show the end date. */
export function formatCardTimeRange(event: { startTime: string; endTime: string }) {
  const startTime = event.startTime.substring(11, 16);
  const endTime = event.endTime.substring(11, 16);
  if (startTime === "00:00" && endTime === "00:01") return "Kommer senere";
  if (event.startTime.substring(0, 10) === event.endTime.substring(0, 10)) return `${startTime} – ${endTime}`;
  return `${startTime} – ${format(new Date(event.endTime), "d. MMM", { locale: nb })} ${endTime}`;
}
