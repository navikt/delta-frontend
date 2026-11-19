import "server-only";

import { getEvents } from "./eventQueries.ts";
import { calculateEventStatistics, type EventStats } from "./eventStatistics.ts";

export type {
  EventStats, OrganizerStat, CategoryStat, CategoryEvent,
  AttendanceTypeStat, ArrangementTypeStat, MostPopularEvent,
} from "./eventStatistics";

export async function getEventStatistics(years: number[]): Promise<Record<number, EventStats>> {
  const events = await getEvents({}, "/statistikk");
  const now = new Date();
  return Object.fromEntries(years.map(year => [year, calculateEventStatistics(events, year, now)]));
}
