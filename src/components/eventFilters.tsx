"use client";

import type { Category } from "@/types/event";
import { useRef } from "react";
import { Badge, BodyShort, Box, Chips, Fieldset, HGrid, HStack, Link as AkselLink, Search, Switch, VStack } from "@navikt/ds-react";
import { useQueryStates } from "nuqs";
import { canonicalCategoryNames, homeParsers, homeTabUpdate, homeView, isHomeView, toggleHomeQuickFilter } from "@/service/overviewState";
import { homeDatasetKey } from "@/service/eventListQuery";
import { useOverviewTransition } from "./overviewTransition";
import NextLink from "next/link";
import ViewToggle from "./viewToggle";
import { OVERVIEW_RESULTS_ID } from "./eventResultsSkeleton";

const QUICK_FILTERS = [
  { name: "kompetanse", label: "Kompetanse" },
  { name: "fagtorsdag", label: "Fagtorsdag" },
  { name: "bedriftidrettslaget", label: "Bedriftsidrettslaget" },
  { name: "sosialt", label: "Sosialt" },
];
const QUICK_FILTER_NAMES = QUICK_FILTERS.map(filter => filter.name);

export default function EventFilters({ categories }: { categories: Category[] }) {
  const [state, setState] = useQueryStates(homeParsers, { history: "replace", scroll: false });
  const { pending, startTransition, allCount, availableCategoryNames } = useOverviewTransition();
  const view = homeView(state);
  const searchRef = useRef<HTMLDivElement>(null);

  const selectedCategories = categories.filter(category =>
    state.categories.includes(category.name) && !QUICK_FILTER_NAMES.includes(category.name));
  const visibleOptions = availableCategoryNames ?? [];
  const categorySuggestions = state.search.trim() ? visibleOptions.filter(name =>
    !QUICK_FILTER_NAMES.includes(name) && !state.categories.includes(name) &&
    name.toLocaleLowerCase("nb-NO").includes(state.search.trim().toLocaleLowerCase("nb-NO"))) : [];
  const visibleQuickFilters = QUICK_FILTERS.filter(filter =>
    visibleOptions.includes(filter.name) || state.categories.includes(filter.name));
  const updateServerState = (updates: Partial<typeof state>) => {
    const next = { ...state, ...updates };
    const changesDataset = homeDatasetKey(state, categories) !== homeDatasetKey(next, categories);
    void setState(updates, { shallow: !changesDataset, ...(changesDataset ? { startTransition } : {}) });
  };
  const toggleQuickFilter = (name: string) => updateServerState({
    categories: toggleHomeQuickFilter(state.categories, name),
  });
  const toggleCategory = (name: string, selected: boolean) => {
    updateServerState({
      categories: canonicalCategoryNames(selected ? [...state.categories, name] : state.categories.filter(value => value !== name)),
      ...(selected ? { search: "" } : {}),
    });
    searchRef.current?.querySelector("input")?.focus();
  };

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
          <HGrid gap="space-24" align="start" columns={{
            xs: "minmax(0, 1fr)",
            lg: view === "alle" ? "minmax(16rem, 24rem) minmax(0, 1fr)" : "minmax(0, 24rem)",
          }}>
            <VStack gap="space-8">
              <Search ref={searchRef}
                label={view === "alle" ? "Søk etter tittel, sted, arrangør eller kategorier" : "Søk etter tittel, sted eller arrangør"}
                hideLabel={false} variant="simple" size="small" value={state.search}
                onChange={search => void setState({ search }, { shallow: true })}
                onClear={() => void setState({ search: "" }, { shallow: true })} />
              {view === "alle" && selectedCategories.length > 0 && (
                <Chips size="small" aria-label="Valgte kategorier">
                  {selectedCategories.map(category => (
                    <Chips.Removable key={category.id} onDelete={() => toggleCategory(category.name, false)}>
                      {category.name}
                    </Chips.Removable>
                  ))}
                </Chips>
              )}
              {view === "alle" && categorySuggestions.length > 0 && (
                <VStack gap="space-8" role="group" aria-label="Kategoriforslag">
                  <BodyShort size="small" textColor="subtle">Kategoriforslag</BodyShort>
                  <Chips size="small">
                    {categorySuggestions.map(name => (
                      <Chips.Toggle key={name} selected={false} checkmark={false}
                        onClick={() => toggleCategory(name, true)}>
                        {name}
                      </Chips.Toggle>
                    ))}
                  </Chips>
                </VStack>
              )}
            </VStack>
            {view === "alle" && (
              <Fieldset legend="Type arrangement" size="small">
                <HStack gap="space-8" align="center" wrap>
                  {visibleQuickFilters.length > 0 && <Chips size="small">
                    {visibleQuickFilters.map(filter => (
                      <Chips.Toggle key={filter.name} selected={state.categories.includes(filter.name)}
                        onClick={() => toggleQuickFilter(filter.name)}>
                        {filter.label}
                      </Chips.Toggle>
                    ))}
                  </Chips>}
                </HStack>
              </Fieldset>
            )}
          </HGrid>
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
