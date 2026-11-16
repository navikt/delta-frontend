import { format, formatDuration, intervalToDuration } from "date-fns";
import { nb } from "date-fns/locale";
import type { DeltaEvent } from "@/types/event";

type EventTimes = Pick<DeltaEvent, "startTime" | "endTime">;

export const FEW_SEATS_THRESHOLD = 9;

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const formatDay = (date: Date) => capitalize(format(date, "EEEE d. MMMM", { locale: nb }));
const formatClock = (date: Date) => format(date, "HH:mm");

const isSameCalendarDay = (start: Date, end: Date) =>
  format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");

const isComingSoon = (event: EventTimes) =>
  event.startTime.substring(11, 16) === "00:00" && event.endTime.substring(11, 16) === "00:01";

/** "Onsdag 18. november 14:00 – Torsdag 19. november 16:00" */
const formatMultiDayRange = (start: Date, end: Date) =>
  `${formatDay(start)} ${formatClock(start)} – ${formatDay(end)} ${formatClock(end)}`;

/** Day and time on separate parts, e.g. for the info card: bold date, muted time. */
export function formatEventDateParts(event: EventTimes): { date: string; time: string } {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  if (!isSameCalendarDay(start, end)) {
    const duration = formatDuration(intervalToDuration({ start, end }), { locale: nb, delimiter: ", " });
    return { date: formatMultiDayRange(start, end), time: `Varighet: ${duration}` };
  }
  return {
    date: formatDay(start),
    time: isComingSoon(event) ? "Kommer senere" : `${formatClock(start)}–${formatClock(end)}`,
  };
}

/** One-line hero summary, e.g. "Onsdag 18. november · 14:00–16:00". */
export function formatEventSummary(event: EventTimes): string {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  if (!isSameCalendarDay(start, end)) return formatMultiDayRange(start, end);
  const { date, time } = formatEventDateParts(event);
  return `${date} · ${time}`;
}

export type SeatStatus =
  | { kind: "unlimited" }
  | { kind: "full" }
  | { kind: "few"; remaining: number }
  | { kind: "available"; remaining: number };

/** `participantLimit === 0` means the event has no limit. */
export function getSeatStatus(attendeeCount: number, participantLimit: number): SeatStatus {
  if (participantLimit <= 0) return { kind: "unlimited" };
  const remaining = participantLimit - attendeeCount;
  if (remaining <= 0) return { kind: "full" };
  if (remaining <= FEW_SEATS_THRESHOLD) return { kind: "few", remaining };
  return { kind: "available", remaining };
}

export function seatStatusLabel(status: SeatStatus): string | null {
  switch (status.kind) {
    case "full":
      return "Fullt";
    case "few":
      return status.remaining === 1 ? "Kun 1 plass igjen" : `Kun ${status.remaining} plasser igjen`;
    default:
      return null;
  }
}
