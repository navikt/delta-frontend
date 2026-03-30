export type FestivalConfig = {
  /** URL path segment, e.g. "fagtorsdag" */
  basePath: string;
  /** Category name used for filtering events */
  category: string;
  /** Active days of the month as strings, e.g. ["31"] */
  activeDays: string[];
  /** Month name in Norwegian, e.g. "oktober" */
  month: string;
  /** Whether to filter active days with >= (true) or just show all (false) */
  filterFutureDaysOnly: boolean;
  /** Category names to hide from tags on event cards */
  hiddenCategoryNames: string[];
  /** CSS class for the page wrapper */
  cssClass: string;
  /** Back button text on the detail page */
  backText: string;
  /** Organizer email shown in event description */
  organizerEmail: string;
  /** Organizer display name shown in event description */
  organizerName: string;
};

export const fagtorsdagConfig: FestivalConfig = {
  basePath: "fagtorsdag",
  category: "fagtorsdag",
  activeDays: ["31"],
  month: "oktober",
  filterFutureDaysOnly: false,
  hiddenCategoryNames: ["fagtorsdag"],
  cssClass: "colorful_fagtorsdag",
  backText: "Fagtorsdag",
  organizerEmail: "einar.bjerve@nav.no",
  organizerName: "Fagtorsdag",
};

export const mimConfig: FestivalConfig = {
  basePath: "mim",
  category: "mangfold i mai",
  activeDays: ["15"],
  month: "mai",
  filterFutureDaysOnly: true,
  hiddenCategoryNames: ["mim24", "mangfold i mai"],
  cssClass: "colorful",
  backText: "Programmet",
  organizerEmail: "uu@nav.no",
  organizerName: "MIM 25",
};

export const fagdagUtviklingOgDataConfig: FestivalConfig = {
  basePath: "fagdag_utvikling_og_data",
  category: "fagdag_utvikling_og_data",
  activeDays: ["6"],
  month: "juni",
  filterFutureDaysOnly: false,
  hiddenCategoryNames: ["fagdag_utvikling_og_data", "mangfold i mai"],
  cssClass: "colorful_fagdag_utvikling_og_data",
  backText: "Programoversikt",
  organizerEmail: "einar.bjerve@nav.no",
  organizerName: "Fagdag Utvikling og Data",
};
