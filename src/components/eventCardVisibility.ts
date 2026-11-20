import type { Category, FullDeltaEvent } from "@/types/event";
import { filterHomeOverview } from "../service/eventListQuery.ts";

export function getHomeCategoryNames(events: FullDeltaEvent[], now: number, categoryScope?: Category): string[] {
  const eligible = (categoryScope ? events : filterHomeOverview(events, { tab: "alle", onlyRegistered: false }))
    .filter(item => !shouldHideEventCard({
      tabname: "alle",
      categories: item.categories,
      signupDeadlineExpired: !!item.event.signupDeadline && new Date(item.event.signupDeadline).getTime() < now,
      showPast: false,
    }));
  return [...new Set(eligible.flatMap(item => item.categories.map(category => category.name)))]
    .sort((a, b) => a.localeCompare(b));
}

export function shouldHideEventCard({
  tabname,
  categories,
  signupDeadlineExpired,
  showPast,
  showOnlyRegistered,
}: {
  tabname?: string;
  categories: Category[];
  signupDeadlineExpired: boolean;
  showPast: boolean;
  showOnlyRegistered?: boolean;
}): boolean {
  if (showOnlyRegistered) {
    return false;
  }

  return (
    (tabname === "alle" &&
      categories.some((category) => category.name === "fagdag_utvikling_og_data")) ||
    (signupDeadlineExpired && tabname === "alle" && !showPast)
  );
}
