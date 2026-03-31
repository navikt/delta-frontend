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
import { useQueryStates } from "nuqs";
import { filterParsers, HomeTab } from "./filterParams";

const QUICK_FILTER_NAMES = ["kompetanse", "bedriftidrettslaget", "sosialt"] as const;
const HIDDEN_CATEGORY_NAMES = new Set(["fagfestival", "biljard", "fagdag_utvikling_og_data"]);

function getUniqueCategories(categories: Category[]) {
  return Array.from(new Map(categories.map((c) => [c.name, c])).values());
}

function isQuickFilterName(value: string): value is (typeof QUICK_FILTER_NAMES)[number] {
  return QUICK_FILTER_NAMES.includes(value as (typeof QUICK_FILTER_NAMES)[number]);
}

export default function FilterBar({
  categories: allCategories = [],
  userEmail,
}: {
  categories?: Category[];
  userEmail?: string;
}) {
  const [filters, setFilters] = useQueryStates(filterParsers, {
    history: "replace",
    scroll: false,
    shallow: false,
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const providedCategories = useMemo(() => getUniqueCategories(allCategories), [allCategories]);

  const selectedCategories = useMemo(
    () =>
      filters.categories
        .map((name) => providedCategories.find((c) => c.name === name))
        .filter((c): c is Category => c !== undefined),
    [providedCategories, filters.categories],
  );

  const selectedQuickFilters = useMemo(
    () => QUICK_FILTER_NAMES.filter((name) => filters.categories.includes(name)),
    [filters.categories],
  );

  const visibleCategoryOptions = useMemo(
    () =>
      providedCategories
        .map((c) => c.name)
        .filter((name) => !HIDDEN_CATEGORY_NAMES.has(name))
        .sort((a, b) => a.localeCompare(b)),
    [providedCategories],
  );

  const handleTabChange = (nextTab: HomeTab) => {
    setFilters({
      tab: nextTab,
      showPast: nextTab === "alle" ? false : filters.showPast,
      onlyRegistered: false,
    });
  };

  const handleCategoryToggle = (categoryName: string, isSelected: boolean) => {
    const nextNames = isSelected
      ? [...filters.categories, categoryName]
      : filters.categories.filter((n) => n !== categoryName);
    setFilters({ categories: nextNames.length ? nextNames.sort((a, b) => a.localeCompare(b)) : [] });
  };

  const handleQuickFilterChange = (values: string[]) => {
    const nextOnlyRegistered = values.includes("onlyRegistered");
    const validValues = values.filter(isQuickFilterName);
    if (validValues.length > 1) return;

    const nextNames = [
      ...filters.categories.filter((name) => !isQuickFilterName(name)),
      ...validValues,
    ];
    setFilters({ categories: nextNames, onlyRegistered: nextOnlyRegistered });
  };

  const showOnlyRegistered = userEmail != null && filters.onlyRegistered;

  return (
    <div className="flex flex-col w-full gap-6 items-start">
      {/* Home tabs */}
      <Tabs className="self-start w-full" value={filters.tab}>
        <Tabs.List>
          <Tabs.Tab value="alle" label="Alle" onClick={() => handleTabChange("alle")} />
          <Tabs.Tab value="mine" label="Arrangør" onClick={() => handleTabChange("mine")} />
        </Tabs.List>
      </Tabs>

      {/* Fagfest CTA */}
      {filters.tab === "alle" && (
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
          value={filters.search}
          size="small"
          className="w-full ax-md:w-auto order-2 ax-md:order-1"
          onChange={(e) => setFilters({ search: e || "" })}
        />
        {filters.tab === "alle" && (
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
      {filters.tab !== "alle" && (
        <CheckboxGroup
          legend="Vis"
          hideLegend
          className="-mt-5 -mb-2 ml-4"
          onChange={(values: string[]) =>
            setFilters({ showPast: values.includes("showPast") })
          }
          value={filters.showPast ? ["showPast"] : []}
        >
          <Checkbox value="showPast">Vis tidligere</Checkbox>
        </CheckboxGroup>
      )}
      {filters.tab === "alle" && (
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

