import type { FullDeltaEvent } from "@/types/event";

export const JOINED_TAB = "påmeldte";
export type FestivalConfig = {
  category?: string;
  activeDays?: string[];
  month?: string;
  slug?: string;
  showProgramOverviewCheckbox?: boolean;
  combineDays?: boolean;
  timeWindowTabs?: { id: string; label: string; startTime: string; endTime: string }[];
};

const monthIndexByName: Record<string, number> = {
  january: 0, januar: 0, february: 1, februar: 1, march: 2, mars: 2, april: 3,
  may: 4, mai: 4, june: 5, juni: 5, july: 6, juli: 6, august: 7, september: 8,
  october: 9, oktober: 9, november: 10, december: 11, desember: 11,
};

export function resolveFestival(config: FestivalConfig, now: Date) {
  const category = config.category ?? "fagfest";
  const month = config.month ?? "April";
  const normalizedMonth = month.trim().toLowerCase();
  const parsedMonth = new Date(`${month} 1, 2000`).getMonth();
  const monthIndex = monthIndexByName[normalizedMonth] ?? (Number.isFinite(parsedMonth) ? parsedMonth : 0);
  const year = monthIndex < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
  const activeDays = config.activeDays?.length ? config.activeDays
    : Array.from({ length: new Date(year, monthIndex + 1, 0).getDate() }, (_, index) => String(index + 1));
  const timeWindowTabs = config.timeWindowTabs ?? [];
  const combineDays = config.combineDays ?? false;
  const currentDay = String(now.getDate());
  const dayDefault = now.getMonth() < monthIndex ? activeDays[0]
    : now.getMonth() > monthIndex ? JOINED_TAB
    : activeDays.includes(currentDay) ? currentDay
    : Number.parseInt(activeDays[0], 10) > now.getDate() ? activeDays[0] : JOINED_TAB;
  const defaultTab = timeWindowTabs.length ? timeWindowTabs[0].id : combineDays ? "alle" : dayDefault;
  return {
    config, requestInstant: now.getTime(),
    category, month, monthIndex, year, activeDays, combineDays, timeWindowTabs, defaultTab,
    slug: config.slug ?? "fagfest",
    showProgramOverviewCheckbox: config.showProgramOverviewCheckbox ?? true,
    remainingDays: now.getMonth() === monthIndex
      ? activeDays.filter(day => Number.parseInt(day, 10) >= now.getDate()) : activeDays,
    tabs: [JOINED_TAB, ...activeDays, ...timeWindowTabs.map(tab => tab.id), ...(combineDays ? ["alle"] : [])],
  };
}

export type ResolvedFestival = ReturnType<typeof resolveFestival>;

export function festivalBrowserPlan(serverFestival: ResolvedFestival, rawTab: string | null) {
  const festival = resolveFestival(serverFestival.config, new Date(serverFestival.requestInstant));
  const explicitTab = rawTab !== null && festival.tabs.includes(rawTab);
  const correction = explicitTab || festival.defaultTab === serverFestival.defaultTab ? null : {
    tab: festival.defaultTab,
    navigation: festivalTabNavigation(serverFestival.defaultTab, festival.defaultTab),
  };
  return { festival, correction };
}

export function festivalTabNavigation(current: string, next: string) {
  return (current === JOINED_TAB) !== (next === JOINED_TAB) ? "server" : "shallow";
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null;
}

export function filterFestivalEvents(
  events: FullDeltaEvent[],
  festival: ResolvedFestival,
  state: { tab: string; search: string; attendance: string },
) {
  return events.filter(item => {
    const start = new Date(item.event.startTime);
    const day = String(start.getDate());
    const activeDay = start.getMonth() === festival.monthIndex &&
      start.getFullYear() === festival.year && festival.activeDays.includes(day);
    const passesDay = state.tab === JOINED_TAB || (activeDay &&
      (festival.combineDays || !festival.activeDays.includes(state.tab) || state.tab === day));
    const window = festival.timeWindowTabs.find(tab => tab.id === state.tab);
    const minutes = start.getHours() * 60 + start.getMinutes();
    const from = window ? timeToMinutes(window.startTime) : null;
    const to = window ? timeToMinutes(window.endTime) : null;
    const passesWindow = !window || (from !== null && to !== null && minutes >= from && minutes <= to);
    const passesAttendance = festival.category !== "mim" || state.tab === JOINED_TAB ||
      item.categories.some(category => category.name.toLowerCase() === state.attendance);
    return passesDay && passesWindow && passesAttendance &&
      item.categories.some(category => category.name === festival.category) &&
      item.event.title.toLowerCase().includes(state.search.toLowerCase());
  });
}

export function joinedFestivalEventIds(events: FullDeltaEvent[], email: string) {
  return new Set(events.filter(item => item.participants.some(person => person.email === email)).map(item => item.event.id));
}
