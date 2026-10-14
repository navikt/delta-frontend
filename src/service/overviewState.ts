import { createLoader, createParser, parseAsString, parseAsStringEnum } from "nuqs/server";

export const parseAsLegacyBoolean = createParser({
  parse: value => value === "1" ? true : value === "0" ? false : null,
  serialize: value => value ? "1" : "0",
}).withDefault(false);

export function canonicalCategoryNames(names: string[]) {
  return [...new Set(names.map(name => name.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

const parseAsCategoryNames = createParser({
  parse: value => canonicalCategoryNames(value.split(",")),
  serialize: value => canonicalCategoryNames(value).join(","),
  eq: (a, b) => canonicalCategoryNames(a).join(",") === canonicalCategoryNames(b).join(","),
}).withDefault([]);

export const homeParsers = {
  tab: parseAsStringEnum(["alle", "mine"]).withDefault("alle"),
  categories: parseAsCategoryNames,
  showPast: parseAsLegacyBoolean,
  onlyRegistered: parseAsLegacyBoolean,
  search: parseAsString.withDefault(""),
  time: parseAsStringEnum(["past", "future"]).withDefault("future"),
};

export const loadHomeState = createLoader(homeParsers);
export type HomeState = Awaited<ReturnType<typeof loadHomeState>>;
export type OverviewSearchParams = { [key: string]: string | string[] | undefined };

export function homeTabUpdate(tab: "alle" | "mine", showPast: boolean) {
  return { tab, showPast: tab === "mine" && showPast, onlyRegistered: false };
}

export function festivalParsers(defaultTab: string, tabs: string[]) {
  return {
    tab: parseAsStringEnum(tabs).withDefault(defaultTab).withOptions({ clearOnDefault: false }),
    search: parseAsString.withDefault(""),
    view: parseAsStringEnum(["cards", "program"]).withDefault("cards"),
    attendance: parseAsStringEnum(["fysisk", "digitalt"]).withDefault("fysisk"),
  };
}
