import { createLoader, createParser, parseAsString, parseAsStringEnum } from "nuqs/server";
import { parseAsYear } from "./yearState.ts";

export const parseAsLegacyBoolean = createParser({
  parse: value => value === "1" ? true : value === "0" ? false : null,
  serialize: value => value ? "1" : "0",
}).withDefault(false);

export function canonicalCategoryNames(names: string[]) {
  return [...new Set(names.map(name => name.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function toggleHomeQuickFilter(names: string[], name: string) {
  const eventTypes = ["kompetanse", "bedriftidrettslaget", "sosialt"];
  return canonicalCategoryNames([
    ...names.filter(value => value !== name && (!eventTypes.includes(name) || !eventTypes.includes(value))),
    ...(names.includes(name) ? [] : [name]),
  ]);
}

const parseAsCategoryNames = createParser({
  parse: value => canonicalCategoryNames(value.split(",")),
  serialize: value => canonicalCategoryNames(value).join(","),
  eq: (a, b) => canonicalCategoryNames(a).join(",") === canonicalCategoryNames(b).join(","),
}).withDefault([]);

export const homeParsers = {
  tab: parseAsStringEnum(["alle", "mine", "ventelister"]).withDefault("alle"),
  categories: parseAsCategoryNames,
  showPast: parseAsLegacyBoolean,
  onlyRegistered: parseAsLegacyBoolean,
  search: parseAsString.withDefault(""),
  year: parseAsYear,
  time: parseAsStringEnum(["past", "future"]).withDefault("future"),
};

export const loadHomeState = createLoader(homeParsers);
export type HomeState = Awaited<ReturnType<typeof loadHomeState>>;
export type OverviewSearchParams = { [key: string]: string | string[] | undefined };

export const HOME_VIEWS = ["alle", "pameldt", "ventelister", "mine"] as const;
export type HomeView = typeof HOME_VIEWS[number];

export function isHomeView(value: string): value is HomeView {
  return (HOME_VIEWS as readonly string[]).includes(value);
}

// "Påmeldt" is the legacy onlyRegistered flag on the alle tab, so old ?onlyRegistered=1 links keep working.
export function homeView(state: { tab: string; onlyRegistered: boolean }): HomeView {
  if (state.onlyRegistered) return "pameldt";
  return isHomeView(state.tab) ? state.tab : "alle";
}

export function homeTabUpdate(view: HomeView, showPast: boolean) {
  if (view === "pameldt") return { tab: "alle" as const, showPast: false, onlyRegistered: true };
  return { tab: view, showPast: view === "mine" && showPast, onlyRegistered: false };
}

export function festivalParsers(defaultTab: string, tabs: string[]) {
  return {
    tab: parseAsStringEnum(tabs).withDefault(defaultTab).withOptions({ clearOnDefault: false }),
    search: parseAsString.withDefault(""),
    view: parseAsStringEnum(["cards", "program"]).withDefault("cards"),
    attendance: parseAsStringEnum(["fysisk", "digitalt"]).withDefault("fysisk"),
  };
}
