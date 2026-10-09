"use client";

import { Alert, BodyShort, Button, UNSAFE_Combobox } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { searchPeople } from "@/service/eventActions";
import { DirectoryPerson } from "@/types/event";

const SEARCH_DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

type PersonPickerProps = {
  selectedPeople: DirectoryPerson[];
  onChange: (people: DirectoryPerson[]) => void;
  excludedEmails?: string[];
  label?: string;
};

export default function PersonPicker({
  selectedPeople,
  onChange,
  excludedEmails = [],
  label = "Inviter personer",
}: PersonPickerProps) {
  const [query, setQuery] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState<{
    query: string;
    attempt: number;
    results: DirectoryPerson[];
    error: string | null;
  } | null>(null);
  const trimmedQuery = query.trim();
  const shouldSearch = trimmedQuery.length >= MIN_QUERY_LENGTH;
  const isCurrent = search?.query === trimmedQuery && search.attempt === attempt;
  const searching = shouldSearch && !isCurrent;
  const results = shouldSearch && isCurrent ? search.results : [];
  const searchError = shouldSearch && isCurrent ? search.error : null;
  const excluded = new Set(excludedEmails.map((email) => email.toLowerCase()));
  const selectedEmails = new Set(selectedPeople.map((person) => person.email.toLowerCase()));
  const availableResults = results.filter(
    (person) =>
      !excluded.has(person.email.toLowerCase()) &&
      !selectedEmails.has(person.email.toLowerCase()),
  );
  const options = availableResults.map((person) => ({
    label: `${person.name} (${person.email})`,
    value: person.email,
  }));
  const selectedOptions = selectedPeople.map((person) => ({
    label: `${person.name} (${person.email})`,
    value: person.email,
  }));

  useEffect(() => {
    if (!shouldSearch) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      const result = await searchPeople(trimmedQuery);
      if (cancelled) return;
      setSearch({
        query: trimmedQuery,
        attempt,
        results: result.ok ? result.data : [],
        error: result.ok ? null : result.message,
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [attempt, shouldSearch, trimmedQuery]);

  return (
    <div
      className="flex flex-col gap-2 max-w-prose"
      onKeyDown={(event) => {
        if (event.key === "Enter") event.preventDefault();
      }}
    >
      <UNSAFE_Combobox
        label={label}
        description="Søk blant personer i Nav. Invitasjonen sendes fra ikkesvar.delta@nav.no. Outlook-svar oppdaterer Delta, men kommentarer i e-postsvar blir ikke lest."
        options={[...selectedOptions, ...options]}
        filteredOptions={options}
        selectedOptions={selectedOptions}
        isMultiSelect
        isLoading={searching}
        value={query}
        onChange={setQuery}
        onToggleSelected={(email, isSelected) => {
          if (!isSelected) {
            onChange(selectedPeople.filter((person) => person.email !== email));
            return;
          }
          const person = results.find((result) => result.email === email);
          if (person) {
            onChange([...selectedPeople, person]);
            setQuery("");
          }
        }}
      />
      {trimmedQuery.length > 0 && trimmedQuery.length < MIN_QUERY_LENGTH && (
        <BodyShort size="small">Skriv minst to tegn for å søke.</BodyShort>
      )}
      {searchError && (
        <Alert variant="error" size="small">
          {searchError}{" "}
          <Button
            type="button"
            size="xsmall"
            variant="tertiary"
            onClick={() => setAttempt((current) => current + 1)}
          >
            Prøv igjen
          </Button>
        </Alert>
      )}
      {isCurrent && !searchError && !searching && availableResults.length === 0 && (
        <BodyShort size="small">Ingen personer å vise.</BodyShort>
      )}
    </div>
  );
}
