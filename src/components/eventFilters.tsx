"use client";

import type { Category } from "@/types/event";
import { Badge, BodyShort, Box, Chips, HStack, Link as AkselLink, Search, Switch, UNSAFE_Combobox, VStack } from "@navikt/ds-react";
import { useQueryStates } from "nuqs";
import { canonicalCategoryNames, homeParsers, homeTabUpdate, homeView, isHomeView } from "@/service/overviewState";
import { homeDatasetKey } from "@/service/eventListQuery";
import { useOverviewTransition } from "./overviewTransition";
import NextLink from "next/link";
import ViewToggle from "./viewToggle";
import { OVERVIEW_RESULTS_ID } from "./eventResultsSkeleton";

const QUICK_FILTERS = [
  { name: "kompetanse", label: "Kompetanse" },
  { name: "bedriftidrettslaget", label: "Bedriftsidrettslaget" },
  { name: "sosialt", label: "Sosialt" },
];
const QUICK_FILTER_NAMES = QUICK_FILTERS.map(filter => filter.name);

export default function EventFilters({ categories }: { categories: Category[] }) {
  const [state, setState] = useQueryStates(homeParsers, { history: "replace", scroll: false });
  const { pending, startTransition, allCount } = useOverviewTransition();
  const view = homeView(state);

  const selectedCategories = categories.filter(category => state.categories.includes(category.name));
  const visibleOptions = [...new Set(categories.map(category => category.name))]
    .filter(name => name !== "fagdag_utvikling_og_data").sort((a, b) => a.localeCompare(b));
  const updateServerState = (updates: Partial<typeof state>) => {
    const next = { ...state, ...updates };
    const changesDataset = homeDatasetKey(state, categories) !== homeDatasetKey(next, categories);
    void setState(updates, { shallow: !changesDataset, ...(changesDataset ? { startTransition } : {}) });
  };
  const quickFilters = state.categories.filter(name => QUICK_FILTER_NAMES.includes(name));
  // The backend ANDs categories, so the quick filters are mutually exclusive.
  const toggleQuickFilter = (name: string) => updateServerState({
    categories: canonicalCategoryNames([
      ...state.categories.filter(value => !QUICK_FILTER_NAMES.includes(value)),
      ...(quickFilters.includes(name) ? [] : [name]),
    ]),
  });

  return (
    <VStack gap="space-16" width="100%">
      <ViewToggle label="Vis arrangementer" value={view} controls={OVERVIEW_RESULTS_ID}
        onChange={value => { if (isHomeView(value)) updateServerState(homeTabUpdate(value, state.showPast)); }}
        options={[
          {
            value: "alle",
            text: allCount !== null ? `Alle (${allCount})` : "Alle",
            label: <>
              Alle
              {allCount !== null && <><Badge count={allCount} maxCount={999} data-color="neutral" className="ml-2" /><span className="sr-only"> arrangementer</span></>}
            </>,
          },
          { value: "pameldt", text: "Påmeldt" },
          { value: "ventelister", text: "Ventelister" },
          { value: "mine", text: "Jeg arrangerer" },
        ]} />
      <Box background="raised" borderColor="neutral-subtle" borderWidth="1" borderRadius="12" padding="space-16">
        <VStack gap="space-16">
          <Box className="w-full max-w-2xl">
            <Search label="Søk i arrangementer" hideLabel variant="simple" size="small" value={state.search}
              placeholder="Søk etter tittel, sted eller arrangør"
              onChange={search => void setState({ search }, { shallow: true })}
              onClear={() => void setState({ search: "" }, { shallow: true })} />
          </Box>
          {view === "alle" && <>
            <HStack gap="space-16" align="end" wrap>
              <VStack gap="space-8">
                <BodyShort size="small" weight="semibold">Type arrangement</BodyShort>
                <Chips size="small" aria-label="Type arrangement">
                  {QUICK_FILTERS.map(filter => (
                    <Chips.Toggle key={filter.name} selected={quickFilters.includes(filter.name)}
                      onClick={() => toggleQuickFilter(filter.name)}>
                      {filter.label}
                    </Chips.Toggle>
                  ))}
                </Chips>
              </VStack>
              <Box className="w-full ax-md:w-80">
                <UNSAFE_Combobox size="small" label="Kategori" placeholder="Alle kategorier" options={visibleOptions}
                  selectedOptions={selectedCategories.map(category => category.name).sort((a, b) => a.localeCompare(b))}
                  onToggleSelected={(name, selected) => updateServerState({
                    categories: canonicalCategoryNames(selected ? [...state.categories, name] : state.categories.filter(value => value !== name)),
                  })}
                  isMultiSelect shouldAutocomplete />
              </Box>
            </HStack>
          </>}
          {view === "mine" && (
            <Switch size="small" checked={state.showPast}
              onChange={event => updateServerState({ showPast: event.target.checked })}>
              Vis tidligere
            </Switch>
          )}
        </VStack>
      </Box>
      {pending && <BodyShort textColor="subtle">Laster arrangementer …</BodyShort>}
    </VStack>
  );
}

export function OverviewCreateLink() {
  return <AkselLink as={NextLink} prefetch={false} data-umami-event="Opprett event besøkt" data-umami-event-placement="Oversiktmodul"
    href="/event/new" className="w-fit">Opprett nytt arrangement</AkselLink>;
}
