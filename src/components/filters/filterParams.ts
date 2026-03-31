import { parseAsArrayOf, parseAsBoolean, parseAsString, parseAsStringLiteral } from "nuqs/server";

export type HomeTab = "alle" | "mine";

export const HOME_TAB_VALUES = ["alle", "mine"] as const;

/**
 * Shared nuqs parsers for home page filter URL state.
 * Used by FilterBar (client), EventListClient (client), and page.tsx (server via createSearchParamsCache).
 */
export const filterParsers = {
  tab: parseAsStringLiteral(HOME_TAB_VALUES).withDefault("alle"),
  search: parseAsString.withDefault(""),
  categories: parseAsArrayOf(parseAsString, ",").withDefault([]),
  showPast: parseAsBoolean.withDefault(false),
  onlyRegistered: parseAsBoolean.withDefault(false),
};

export type ParsedFilters = {
  tab: HomeTab;
  search: string;
  categories: string[];
  showPast: boolean;
  onlyRegistered: boolean;
};
