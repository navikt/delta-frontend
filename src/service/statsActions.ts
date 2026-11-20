import "server-only";

import { getEvents } from "./eventQueries.ts";
import { calculateEventStatisticsByYear, type EventStats } from "./eventStatistics.ts";

export type {
  EventStats, OrganizerStat, CategoryStat, CategoryEvent,
  AttendanceTypeStat, ArrangementTypeStat, MostPopularEvent,
} from "./eventStatistics";

export async function getEventStatistics(years: number[]): Promise<Record<number, EventStats>> {
  const events = await getEvents({}, "/statistikk");
  return calculateEventStatisticsByYear(events, years);
}
