"use client"
import { Category, FullDeltaEvent } from "@/types/event";
import { Search, Tabs, UNSAFE_Combobox, CheckboxGroup, Checkbox, LinkPanel } from "@navikt/ds-react";
import EventList from "./eventList";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getEvents } from "@/service/eventActions";
import { FunnelIcon } from "@navikt/aksel-icons";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

enum TimeSelector {
  PAST = "past",
  FUTURE = "future",
}

type HomeTab = "alle" | "mine";

const DEFAULT_TAB: HomeTab = "alle";
const VISIBLE_PREVIOUS_VALUE = "10";
const QUICK_FILTER_NAMES = ["kompetanse", "bedriftidrettslaget", "sosialt"] as const;
const HIDDEN_CATEGORY_NAMES = new Set(["fagfestival", "biljard", "fagdag_utvikling_og_data"]);

function getUniqueCategories(categories: Category[]) {
  return Array.from(new Map(categories.map((category) => [category.name, category])).values());
}

function isHomeTab(value: string | null): value is HomeTab {
  return value === "alle" || value === "mine";
}

function isQuickFilterName(value: string): value is (typeof QUICK_FILTER_NAMES)[number] {
  return QUICK_FILTER_NAMES.includes(value as (typeof QUICK_FILTER_NAMES)[number]);
}

function getSelectedCategoryNames(searchParams: Pick<URLSearchParams, "get">) {
  const categories = searchParams.get("categories");

  return categories
    ?.split(",")
    .map((categoryName) => categoryName.trim())
    .filter(Boolean) ?? [];
}

export default function EventFilters({
  categories: allCategories = [],
  selectTime = false,
  selectTimeRadio = false,
  selectCategory = false,
  searchName = false,
  joinedLink  = false,
  homeTabs  = false,
  ctaLink  = false,
  userEmail,
}: {
  categories?: Category[];
  selectTime?: boolean;
  selectTimeRadio?: boolean;
  searchName?: boolean;
  selectCategory?: boolean;
  joinedLink?: boolean;
  homeTabs?: boolean;
  ctaLink?: boolean;
  userEmail?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchInputFromUrl = searchParams.get("search") ?? "";
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [events, setEvents] = useState<FullDeltaEvent[]>([]);
  const [searchInputValue, setSearchInputValue] = useState(searchInputFromUrl);
  const hasRestoredScroll = useRef(false);

  const searchParamsKey = searchParams.toString();
  const selectedCategoryNames = useMemo(
    () => getSelectedCategoryNames(new URLSearchParams(searchParamsKey)),
    [searchParamsKey],
  );
  const selectedCategoryNamesKey = selectedCategoryNames.join(",");
  const tabParam = searchParams.get("tab");
  const tabname: HomeTab = isHomeTab(tabParam) ? tabParam : DEFAULT_TAB;
  const showPrevious = searchParams.get("showPast") === "1";
  const showOnlyRegistered = userEmail != null && searchParams.get("onlyRegistered") === "1";
  const selectedTime =
    searchParams.get("time") === TimeSelector.PAST ? TimeSelector.PAST : TimeSelector.FUTURE;
  const currentOverviewPath = useMemo(() => {
    const currentSearch = searchParamsKey;
    return `${pathname}${currentSearch ? `?${currentSearch}` : ""}`;
  }, [pathname, searchParamsKey]);

  const providedCategories = useMemo(
    () => getUniqueCategories(allCategories),
    [allCategories],
  );
  const eventCategories = useMemo(
    () =>
      providedCategories.length > 0
        ? providedCategories
        : getUniqueCategories(events.flatMap((event) => event.categories)),
    [providedCategories, events],
  );
  const selectedCategories = useMemo(
    () =>
      selectedCategoryNames
        .map((categoryName) =>
          (providedCategories.length > 0 ? providedCategories : eventCategories).find(
            (category) => category.name === categoryName,
          ),
        )
        .filter((category): category is Category => category !== undefined),
    [eventCategories, providedCategories, selectedCategoryNames],
  );
  const filterEvents = useMemo(
    () => {
      let filtered =
        tabname !== "alle"
          ? events
          : events.filter((fullEvent) =>
              fullEvent.event.title.toLowerCase().includes(searchInputValue.toLowerCase()),
            );

      if (showOnlyRegistered && userEmail) {
        filtered = filtered.filter((fullEvent) =>
          fullEvent.participants.some((p) => p.email === userEmail),
        );
      }

      return filtered;
    },
    [events, searchInputValue, tabname, showOnlyRegistered, userEmail],
  );
  const selectedQuickFilters = useMemo(
    () => QUICK_FILTER_NAMES.filter((categoryName) => selectedCategoryNames.includes(categoryName)),
    [selectedCategoryNames],
  );
  const visibleCategoryOptions = useMemo(
    () =>
      eventCategories
        .map((category) => category.name)
        .filter((categoryName) => !HIDDEN_CATEGORY_NAMES.has(categoryName))
        .sort((a, b) => a.localeCompare(b)),
    [eventCategories],
  );
  const onlyFuture = tabname === "alle" || !showPrevious;
  const onlyPast = tabname !== "alle" && showPrevious;

  const updateUrlState = useCallback((updates: {
    categories?: string[] | null;
    search?: string | null;
    tab?: HomeTab | null;
    showPast?: boolean | null;
    time?: TimeSelector | null;
    onlyRegistered?: boolean | null;
  }) => {
    const nextSearchParams = new URLSearchParams(searchParamsKey);

    if (updates.categories !== undefined) {
      if (updates.categories?.length) {
        nextSearchParams.set(
          "categories",
          [...updates.categories].sort((a, b) => a.localeCompare(b)).join(","),
        );
      } else {
        nextSearchParams.delete("categories");
      }
    }

    if (updates.search !== undefined) {
      if (updates.search) {
        nextSearchParams.set("search", updates.search);
      } else {
        nextSearchParams.delete("search");
      }
    }

    if (updates.tab !== undefined) {
      if (updates.tab && updates.tab !== DEFAULT_TAB) {
        nextSearchParams.set("tab", updates.tab);
      } else {
        nextSearchParams.delete("tab");
      }
    }

    if (updates.showPast !== undefined) {
      if (updates.showPast) {
        nextSearchParams.set("showPast", "1");
      } else {
        nextSearchParams.delete("showPast");
      }
    }

    if (updates.time !== undefined) {
      if (updates.time && updates.time !== TimeSelector.FUTURE) {
        nextSearchParams.set("time", updates.time);
      } else {
        nextSearchParams.delete("time");
      }
    }

    if (updates.onlyRegistered !== undefined) {
      if (updates.onlyRegistered) {
        nextSearchParams.set("onlyRegistered", "1");
      } else {
        nextSearchParams.delete("onlyRegistered");
      }
    }

    const nextSearch = nextSearchParams.toString();

    if (nextSearch === searchParamsKey) {
      return;
    }

    router.replace(nextSearch ? `${pathname}?${nextSearch}` : pathname, { scroll: false });
  }, [pathname, router, searchParamsKey]);

  const handleTabChange = (nextTab: HomeTab) => {
    updateUrlState({
      tab: nextTab,
      showPast: nextTab === "alle" ? null : showPrevious,
      onlyRegistered: false,
    });
  };

  const handleCategoryToggle = (categoryName: string, isSelected: boolean) => {
    const nextCategoryNames = isSelected
      ? [...selectedCategoryNames, categoryName]
      : selectedCategoryNames.filter((category) => category !== categoryName);

    updateUrlState({ categories: nextCategoryNames });
  };

  const handleQuickFilterChange = (values: string[]) => {
    const nextOnlyRegistered = values.includes("onlyRegistered");
    const validValues = values.filter(isQuickFilterName);

    if (validValues.length > 1) {
      return;
    }

    const nextCategoryNames = [
      ...selectedCategoryNames.filter(
        (categoryName) => !isQuickFilterName(categoryName),
      ),
      ...validValues,
    ];

    updateUrlState({ categories: nextCategoryNames, onlyRegistered: nextOnlyRegistered });
  };

  useEffect(() => {
    hasRestoredScroll.current = false;
  }, [currentOverviewPath]);

  useEffect(() => {
    setSearchInputValue(searchInputFromUrl);
  }, [searchInputFromUrl]);

  useEffect(() => {
    if (searchInputValue === searchInputFromUrl) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      updateUrlState({ search: searchInputValue || null });
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInputFromUrl, searchInputValue, updateUrlState]);

  const selectedCategoryIdsKey = useMemo(
    () => selectedCategories.map((category) => category.id).sort((a, b) => a - b).join(","),
    [selectedCategories],
  );
  const categoryIdsKeyForFetch = tabname === "alle" ? selectedCategoryIdsKey : "";
  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const categoriesForFetch =
          categoryIdsKeyForFetch.length === 0
            ? []
            : categoryIdsKeyForFetch
                .split(",")
                .map((categoryId) => Number(categoryId))
                .filter((categoryId) => Number.isFinite(categoryId))
                .map((categoryId) => ({ id: categoryId, name: "" }));

        const eventsData = await getEvents({
          categories: categoriesForFetch,
          onlyFuture,
          onlyPast,
          onlyMine: tabname === "mine",
        });

        if (!cancelled) {
          setEvents(eventsData);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchEvents();

    return () => {
      cancelled = true;
    };
  }, [categoryIdsKeyForFetch, onlyFuture, onlyPast, tabname]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (loading || hasRestoredScroll.current) {
      return;
    }

    const savedScrollY = sessionStorage.getItem(`event-overview-scroll:${currentOverviewPath}`);

    hasRestoredScroll.current = true;

    if (!savedScrollY) {
      return;
    }

    const parsedScrollY = Number(savedScrollY);

    if (!Number.isFinite(parsedScrollY)) {
      sessionStorage.removeItem(`event-overview-scroll:${currentOverviewPath}`);
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: parsedScrollY, behavior: "auto" });
        sessionStorage.removeItem(`event-overview-scroll:${currentOverviewPath}`);
      });
    });
  }, [currentOverviewPath, filterEvents.length, loading]);

  return (
    <div className="flex flex-col w-full gap-6 items-start">
      {homeTabs && (
          <Tabs className="self-start w-full" value={tabname}>
            <Tabs.List>
              <Tabs.Tab
                  value="alle"
                  label="Alle"
                  onClick={() => handleTabChange("alle")}
              />
              <Tabs.Tab
                  value="mine"
                  label="Arrangør"
                  onClick={() => handleTabChange("mine")}
              />
            </Tabs.List>
          </Tabs>
      )}
      {selectTime && (
        <Tabs className="self-start w-full" value={selectedTime}>
          <Tabs.List>
            <Tabs.Tab
              value={TimeSelector.FUTURE}
              label="Kommende"
              onClick={() => updateUrlState({ time: TimeSelector.FUTURE })}
            />
            <Tabs.Tab
              value={TimeSelector.PAST}
              label="Tidligere"
              onClick={() => updateUrlState({ time: TimeSelector.PAST })}
            />
          </Tabs.List>
        </Tabs>
      )}
    {tabname == "alle" && (
          <>
            {joinedLink && (
                <div className="px-4 inline-block">
                  <LinkPanel
                    data-umami-event="Fagfest CTA"
                    href="/fagfest"
                    border
                    className="bg-fagfestival text-white"
                  >
                    <LinkPanel.Title className="!text-white">Fagfest</LinkPanel.Title>
                    <LinkPanel.Description className="!text-white">
                      Se programmet og meld deg på arrangementer
                    </LinkPanel.Description>
                  </LinkPanel>
                </div>
            )}
          </>
      )}
      {(searchName || selectCategory) && (
          <div
              className="flex flex-col-reverse gap-2 items-start ax-md:flex-row justify-between w-full ax-md:items-center px-4">
            {searchName && (
                <Search
                    label="Søk alle kommende arrangementer"
                    variant="simple"
                    value={searchInputValue}
                    size="small"
                    className="w-full ax-md:w-auto order-2 ax-md:order-1"
                    onChange={(value) => {
                      setSearchInputValue(value);
                    }}
                />
            )}
            {selectCategory && tabname == "alle" && (
                <div
                    className="mt-5 ax-md:mt-0 w-full ax-md:w-fit flex items-center flex-wrap flex-row-reverse ax-md:flex-row gap-2 order-1 ax-md:order-2">
      <span className="gap-2 items-center hidden ax-md:flex">
        <FunnelIcon title="trakt"/>
        <label className="font-ax-bold">Kategorier</label>
      </span>
                  <UNSAFE_Combobox
                      className="w-full ax-md:w-fit"
                      size="small"
                      label="Filtrer på kategori"
                      hideLabel={!isMobile}
                      options={visibleCategoryOptions}
                      selectedOptions={selectedCategories
                          .map((category) => category.name)
                          .sort((a, b) => a.localeCompare(b))}
                      onToggleSelected={(categoryName, isSelected) => {
                        handleCategoryToggle(categoryName, isSelected);
                      }}
                      isMultiSelect
                      shouldAutocomplete
                  />
                </div>
            )}
          </div>
      )}
      {(selectTimeRadio && tabname != "alle") && (
          <>
            {/*<Switch className={"-mt-5 -mb-2 ml-4"}>Vis tidligere</Switch>*/}
            <CheckboxGroup
                legend={"Vis"} hideLegend className={"-mt-5 -mb-2 ml-4"}
                onChange={(values: string[]) =>
                  updateUrlState({ showPast: values.includes(VISIBLE_PREVIOUS_VALUE) })
                }
                value={showPrevious ? [VISIBLE_PREVIOUS_VALUE] : []}
            >
              <Checkbox value={VISIBLE_PREVIOUS_VALUE}>Vis tidligere</Checkbox>
            </CheckboxGroup>
          </>
       )}
      {(selectTimeRadio && tabname == "alle") && (
          <>
            {/*<Switch className={"-mt-5 -mb-2 ml-4"}>Vis tidligere</Switch>*/}
            <CheckboxGroup
                legend={"Vis"} hideLegend className={"-mt-5 -mb-2 ml-4"}
                onChange={handleQuickFilterChange}
                value={[...selectedQuickFilters, ...(showOnlyRegistered ? ["onlyRegistered"] : [])]}
            >
              <div className="mt-1 flex flex-col ax-sm:flex-row gap-0 ax-sm:gap-4">
                <Checkbox value="kompetanse" disabled={selectedCategories.some(category => category.name === "bedriftidrettslaget" || category.name === "sosialt")}>Kompetanse</Checkbox>
                <Checkbox value="bedriftidrettslaget" disabled={selectedCategories.some(category => category.name === "kompetanse" || category.name === "sosialt")}>Bedriftidrettslaget</Checkbox>
                <Checkbox value="sosialt" disabled={selectedCategories.some(category => category.name === "kompetanse" || category.name === "bedriftidrettslaget")}>Sosialt</Checkbox>
                {userEmail && (
                  <Checkbox value="onlyRegistered">Vis kun påmeldte</Checkbox>
                )}
              </div>
            </CheckboxGroup>
          </>
      )}
      <div className="w-full p-4">
        {filterEvents.length > 0 && (<p className="pb-4">{filterEvents.length} {filterEvents.length == 1 ? (<>arrangement</>) : (<>arrangementer</>)}</p>)}
        <EventList
          fullEvents={filterEvents}
          loading={loading}
          showAll={showPrevious ? [VISIBLE_PREVIOUS_VALUE] : []}
          tabname={tabname}
          userEmail={userEmail}
        />
      </div>
      {ctaLink && (
          <div className="px-4 mb-4">
            <Link prefetch={false} data-umami-event="Opprett event besøkt" data-umami-event-placement="Oversiktmodul" href="/event/new" className="text-ax-brand-blue-600 underline hover:no-underline">
              Opprett nytt arrangement
            </Link>
          </div>
      )}
    </div>
  );
}
