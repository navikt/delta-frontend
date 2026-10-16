"use client";

import type { Category } from "@/types/event";
import { BodyShort, Search, Tabs, UNSAFE_Combobox, CheckboxGroup, Checkbox, LinkPanel } from "@navikt/ds-react";
import { FunnelIcon } from "@navikt/aksel-icons";
import { useQueryStates } from "nuqs";
import { canonicalCategoryNames, homeParsers, homeTabUpdate } from "@/service/overviewState";
import { eventDatasetKey, getHomeEventQuery } from "@/service/eventListQuery";
import { useOverviewTransition } from "./overviewTransition";
import Link from "next/link";

const QUICK_FILTER_NAMES = ["kompetanse", "bedriftidrettslaget", "sosialt"];

export default function EventFilters({ categories, userEmail }: { categories: Category[]; userEmail: string }) {
  const [state, setState] = useQueryStates(homeParsers, { history: "replace", scroll: false });
  const { pending, startTransition } = useOverviewTransition();

  const selectedCategories = categories.filter(category => state.categories.includes(category.name));
  const visibleOptions = [...new Set(categories.map(category => category.name))]
    .filter(name => name !== "fagdag_utvikling_og_data").sort((a, b) => a.localeCompare(b));
  const updateServerState = (updates: Partial<typeof state>) => {
    const next = { ...state, ...updates };
    const changesDataset = eventDatasetKey("home", getHomeEventQuery(state, categories)) !==
      eventDatasetKey("home", getHomeEventQuery(next, categories));
    void setState(updates, { shallow: !changesDataset, ...(changesDataset ? { startTransition } : {}) });
  };
  const quickFilters = state.categories.filter(name => QUICK_FILTER_NAMES.includes(name));

  return (
    <div className="flex flex-col w-full gap-6 items-start">
      <Tabs className="self-start w-full" value={state.tab}
        onChange={tab => updateServerState(homeTabUpdate(tab === "mine" ? "mine" : "alle", state.showPast))}>
        <Tabs.List>
          <Tabs.Tab value="alle" label="Alle" />
          <Tabs.Tab value="mine" label="Arrangør" />
        </Tabs.List>
      </Tabs>
      {state.tab === "alle" && (
        <div className="px-4 flex flex-col ax-md:flex-row gap-2 w-full">
          <LinkPanel data-umami-event="STATSDAY CTA" href="/kategori/statistikkens+dag" border className="w-full ax-md:w-auto">
            <LinkPanel.Title>Statistikkens dag</LinkPanel.Title>
            <LinkPanel.Description>Se programmet og meld deg på arrangementer</LinkPanel.Description>
          </LinkPanel>
        </div>
      )}
      <div className="flex flex-col-reverse gap-2 items-start ax-md:flex-row justify-between w-full ax-md:items-center px-4">
        <Search label="Søk alle kommende arrangementer" variant="simple" value={state.search} size="small"
          className="w-full ax-md:w-auto order-2 ax-md:order-1"
          onChange={search => void setState({ search }, { shallow: true })}
          onClear={() => void setState({ search: "" }, { shallow: true })} />
        {state.tab === "alle" && (
          <div className="mt-5 ax-md:mt-0 w-full ax-md:w-fit flex items-center flex-wrap flex-row-reverse ax-md:flex-row gap-2 order-1 ax-md:order-2">
            <span className="gap-2 items-center hidden ax-md:flex">
              <FunnelIcon title="trakt" /><span className="font-ax-bold">Kategorier</span>
            </span>
            <UNSAFE_Combobox className="w-full ax-md:w-fit" size="small" label="Filtrer på kategori"
              hideLabel={false} options={visibleOptions}
              selectedOptions={selectedCategories.map(category => category.name).sort((a, b) => a.localeCompare(b))}
              onToggleSelected={(name, selected) => updateServerState({
                categories: canonicalCategoryNames(selected ? [...state.categories, name] : state.categories.filter(value => value !== name)),
              })}
              isMultiSelect shouldAutocomplete />
          </div>
        )}
      </div>
      {state.tab === "mine" ? (
        <CheckboxGroup legend="Vis" hideLegend className="-mt-5 -mb-2 ml-4"
          value={state.showPast ? ["10"] : []}
          onChange={(values: string[]) => updateServerState({ showPast: values.includes("10") })}>
          <Checkbox value="10">Vis tidligere</Checkbox>
        </CheckboxGroup>
      ) : (
        <CheckboxGroup legend="Vis" hideLegend className="-mt-5 -mb-2 ml-4"
          value={[...quickFilters, ...(state.onlyRegistered ? ["onlyRegistered"] : [])]}
          onChange={(values: string[]) => {
            const selected = values.filter(value => QUICK_FILTER_NAMES.includes(value));
            if (selected.length > 1) return;
            updateServerState({
              categories: canonicalCategoryNames([...state.categories.filter(name => !QUICK_FILTER_NAMES.includes(name)), ...selected]),
              onlyRegistered: values.includes("onlyRegistered"),
            });
          }}>
          <div className="mt-1 flex flex-col ax-sm:flex-row gap-0 ax-sm:gap-4">
            <Checkbox value="kompetanse" disabled={quickFilters.some(name => name !== "kompetanse")}>Kompetanse</Checkbox>
            <Checkbox value="bedriftidrettslaget" disabled={quickFilters.some(name => name !== "bedriftidrettslaget")}>Bedriftidrettslaget</Checkbox>
            <Checkbox value="sosialt" disabled={quickFilters.some(name => name !== "sosialt")}>Sosialt</Checkbox>
            {userEmail && <Checkbox value="onlyRegistered">Vis kun påmeldte</Checkbox>}
          </div>
        </CheckboxGroup>
      )}
      {pending && <BodyShort role="status" className="px-4">Laster arrangementer …</BodyShort>}
    </div>
  );
}

export function OverviewCreateLink() {
  return <div className="px-4 mb-4">
    <Link prefetch={false} data-umami-event="Opprett event besøkt" data-umami-event-placement="Oversiktmodul"
      href="/event/new" className="text-ax-brand-blue-600 underline hover:no-underline">Opprett nytt arrangement</Link>
  </div>;
}
