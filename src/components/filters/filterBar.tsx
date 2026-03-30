"use client";

import { Category } from "@/types/event";
import {
  Search,
  Tabs,
  UNSAFE_Combobox,
  CheckboxGroup,
  Checkbox,
  LinkPanel,
} from "@navikt/ds-react";
import { useMemo, useState, useEffect } from "react";
import { FunnelIcon } from "@navikt/aksel-icons";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type HomeTab = "alle" | "mine";

const DEFAULT_TAB: HomeTab = "alle";
const VISIBLE_PREVIOUS_VALUE = "10";
const QUICK_FILTER_NAMES = ["kompetanse", "bedriftidrettslaget", "sosialt"] as const;
const HIDDEN_CATEGORY_NAMES = new Set(["fagfestival", "biljard", "fagdag_utvikling_og_data"]);

function getUniqueCategories(categories: Category[]) {
  return Array.from(new Map(categories.map((c) => [c.name, c])).values());
}

function isHomeTab(value: string | null): value is HomeTab {
  return value === "alle" || value === "mine";
}

function isQuickFilterName(value: string): value is (typeof QUICK_FILTER_NAMES)[number] {
  return QUICK_FILTER_NAMES.includes(value as (typeof QUICK_FILTER_NAMES)[number]);
}

function getSelectedCategoryNames(searchParams: Pick<URLSearchParams, "get">) {
  const categories = searchParams.get("categories");
  return (
    categories
      ?.split(",")
      .map((name) => name.trim())
      .filter(Boolean) ?? []
  );
}

export default function FilterBar({
  categories: allCategories = [],
  userEmail,
}: {
  categories?: Category[];
  userEmail?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);

  const searchParamsKey = searchParams.toString();
  const selectedCategoryNames = useMemo(
    () => getSelectedCategoryNames(new URLSearchParams(searchParamsKey)),
    [searchParamsKey],
  );
  const searchInput = searchParams.get("search") ?? "";
  const tabParam = searchParams.get("tab");
  const tabname: HomeTab = isHomeTab(tabParam) ? tabParam : DEFAULT_TAB;
  const showPrevious = searchParams.get("showPast") === "1";
  const showOnlyRegistered = userEmail != null && searchParams.get("onlyRegistered") === "1";

  const providedCategories = useMemo(() => getUniqueCategories(allCategories), [allCategories]);
  const selectedCategories = useMemo(
    () =>
      selectedCategoryNames
        .map((name) => providedCategories.find((c) => c.name === name))
        .filter((c): c is Category => c !== undefined),
    [providedCategories, selectedCategoryNames],
  );
  const selectedQuickFilters = useMemo(
    () => QUICK_FILTER_NAMES.filter((name) => selectedCategoryNames.includes(name)),
    [selectedCategoryNames],
  );
  const visibleCategoryOptions = useMemo(
    () =>
      providedCategories
        .map((c) => c.name)
        .filter((name) => !HIDDEN_CATEGORY_NAMES.has(name))
        .sort((a, b) => a.localeCompare(b)),
    [providedCategories],
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updateUrlState = (updates: {
    categories?: string[] | null;
    search?: string | null;
    tab?: HomeTab | null;
    showPast?: boolean | null;
    onlyRegistered?: boolean | null;
  }) => {
    const next = new URLSearchParams(searchParamsKey);

    if (updates.categories !== undefined) {
      if (updates.categories?.length) {
        next.set("categories", [...updates.categories].sort((a, b) => a.localeCompare(b)).join(","));
      } else {
        next.delete("categories");
      }
    }

    if (updates.search !== undefined) {
      updates.search ? next.set("search", updates.search) : next.delete("search");
    }

    if (updates.tab !== undefined) {
      updates.tab && updates.tab !== DEFAULT_TAB ? next.set("tab", updates.tab) : next.delete("tab");
    }

    if (updates.showPast !== undefined) {
      updates.showPast ? next.set("showPast", "1") : next.delete("showPast");
    }

    if (updates.onlyRegistered !== undefined) {
      updates.onlyRegistered ? next.set("onlyRegistered", "1") : next.delete("onlyRegistered");
    }

    const nextSearch = next.toString();
    router.replace(nextSearch ? `${pathname}?${nextSearch}` : pathname, { scroll: false });
  };

  const handleTabChange = (nextTab: HomeTab) => {
    updateUrlState({
      tab: nextTab,
      showPast: nextTab === "alle" ? null : showPrevious,
      onlyRegistered: false,
    });
  };

  const handleCategoryToggle = (categoryName: string, isSelected: boolean) => {
    const nextNames = isSelected
      ? [...selectedCategoryNames, categoryName]
      : selectedCategoryNames.filter((n) => n !== categoryName);
    updateUrlState({ categories: nextNames });
  };

  const handleQuickFilterChange = (values: string[]) => {
    const nextOnlyRegistered = values.includes("onlyRegistered");
    const validValues = values.filter(isQuickFilterName);
    if (validValues.length > 1) return;

    const nextNames = [
      ...selectedCategoryNames.filter((name) => !isQuickFilterName(name)),
      ...validValues,
    ];
    updateUrlState({ categories: nextNames, onlyRegistered: nextOnlyRegistered });
  };

  return (
    <div className="flex flex-col w-full gap-6 items-start">
      {/* Home tabs */}
      <Tabs className="self-start w-full" value={tabname}>
        <Tabs.List>
          <Tabs.Tab value="alle" label="Alle" onClick={() => handleTabChange("alle")} />
          <Tabs.Tab value="mine" label="Arrangør" onClick={() => handleTabChange("mine")} />
        </Tabs.List>
      </Tabs>

      {/* Fagfest CTA */}
      {tabname === "alle" && (
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

      {/* Search + Category filter */}
      <div className="flex flex-col-reverse gap-2 items-start ax-md:flex-row justify-between w-full ax-md:items-center px-4">
        <Search
          label="Søk alle kommende arrangementer"
          variant="simple"
          value={searchInput}
          size="small"
          className="w-full ax-md:w-auto order-2 ax-md:order-1"
          onChange={(e) => updateUrlState({ search: e || null })}
        />
        {tabname === "alle" && (
          <div className="mt-5 ax-md:mt-0 w-full ax-md:w-fit flex items-center flex-wrap flex-row-reverse ax-md:flex-row gap-2 order-1 ax-md:order-2">
            <span className="gap-2 items-center hidden ax-md:flex">
              <FunnelIcon title="trakt" />
              <label className="font-ax-bold">Kategorier</label>
            </span>
            <UNSAFE_Combobox
              className="w-full ax-md:w-fit"
              size="small"
              label="Filtrer på kategori"
              hideLabel={!isMobile}
              options={visibleCategoryOptions}
              selectedOptions={selectedCategories
                .map((c) => c.name)
                .sort((a, b) => a.localeCompare(b))}
              onToggleSelected={handleCategoryToggle}
              isMultiSelect
              shouldAutocomplete
            />
          </div>
        )}
      </div>

      {/* Quick filters / show past */}
      {tabname !== "alle" && (
        <CheckboxGroup
          legend="Vis"
          hideLegend
          className="-mt-5 -mb-2 ml-4"
          onChange={(values: string[]) =>
            updateUrlState({ showPast: values.includes(VISIBLE_PREVIOUS_VALUE) })
          }
          value={showPrevious ? [VISIBLE_PREVIOUS_VALUE] : []}
        >
          <Checkbox value={VISIBLE_PREVIOUS_VALUE}>Vis tidligere</Checkbox>
        </CheckboxGroup>
      )}
      {tabname === "alle" && (
        <CheckboxGroup
          legend="Vis"
          hideLegend
          className="-mt-5 -mb-2 ml-4"
          onChange={handleQuickFilterChange}
          value={[...selectedQuickFilters, ...(showOnlyRegistered ? ["onlyRegistered"] : [])]}
        >
          <div className="mt-1 flex flex-col ax-sm:flex-row gap-0 ax-sm:gap-4">
            <Checkbox
              value="kompetanse"
              disabled={selectedCategories.some(
                (c) => c.name === "bedriftidrettslaget" || c.name === "sosialt",
              )}
            >
              Kompetanse
            </Checkbox>
            <Checkbox
              value="bedriftidrettslaget"
              disabled={selectedCategories.some(
                (c) => c.name === "kompetanse" || c.name === "sosialt",
              )}
            >
              Bedriftidrettslaget
            </Checkbox>
            <Checkbox
              value="sosialt"
              disabled={selectedCategories.some(
                (c) => c.name === "kompetanse" || c.name === "bedriftidrettslaget",
              )}
            >
              Sosialt
            </Checkbox>
            {userEmail && <Checkbox value="onlyRegistered">Vis kun påmeldte</Checkbox>}
          </div>
        </CheckboxGroup>
      )}

      {/* Create event link */}
      <div className="px-4 mb-4">
        <Link
          prefetch={false}
          data-umami-event="Opprett event besøkt"
          data-umami-event-placement="Oversiktmodul"
          href="/event/new"
          className="text-ax-brand-blue-600 underline hover:no-underline"
        >
          Opprett nytt arrangement
        </Link>
      </div>
    </div>
  );
}
