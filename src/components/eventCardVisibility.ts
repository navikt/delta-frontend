import type { Category } from "@/types/event";

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
