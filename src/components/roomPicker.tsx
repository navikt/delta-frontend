"use client";

import { Alert, BodyShort, Button, Tag, UNSAFE_Combobox } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { getRoomAvailability, searchRooms } from "@/service/roomActions";
import { RoomAvailability, RoomInfo } from "@/types/room";

export type SelectedRoom = { email: string; name: string };

type RoomPickerProps = {
  selectedRoom: SelectedRoom | null;
  onSelect: (room: SelectedRoom | null) => void;
  /** Event start/end in backend format; availability is only checked when both are set. */
  startTime: string | null;
  endTime: string | null;
  /** Skip availability for this room (e.g. the event's own current booking would show as busy). */
  skipAvailabilityFor?: string | null;
  label?: string;
};

const SEARCH_DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

function roomLabel(room: RoomInfo): string {
  const details = [
    room.capacity ? `${room.capacity} plasser` : null,
    room.floorLabel ? `etasje ${room.floorLabel}` : null,
    room.isWheelChairAccessible ? "rullestoltilgjengelig" : null,
  ].filter(Boolean);
  return details.length > 0
    ? `${room.displayName} (${details.join(", ")})`
    : (room.displayName ?? "");
}

export default function RoomPicker({
  selectedRoom,
  onSelect,
  startTime,
  endTime,
  skipAvailabilityFor,
  label = "Møterom (valgfritt)",
}: RoomPickerProps) {
  const [query, setQuery] = useState("");
  // Results are tagged with the query they belong to, so loading/stale state is derived.
  const [search, setSearch] = useState<{
    query: string;
    attempt: number;
    results: RoomInfo[];
    error: string | null;
  } | null>(null);
  const [searchAttempt, setSearchAttempt] = useState(0);
  const trimmed = query.trim();
  const shouldSearch = trimmed.length >= MIN_QUERY_LENGTH;
  const isCurrent = search?.query === trimmed && search.attempt === searchAttempt;
  const searching = shouldSearch && !isCurrent;
  const results = shouldSearch && isCurrent ? search.results : [];
  const searchError = shouldSearch && isCurrent ? search.error : null;

  useEffect(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      const result = await searchRooms(trimmed);
      if (cancelled) return; // stale response
      setSearch({
        query: trimmed,
        attempt: searchAttempt,
        results: result.ok ? result.data.filter((r) => r.emailAddress && r.displayName) : [],
        error: result.ok ? null : result.message,
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [trimmed, searchAttempt]);

  const options = results.map((r) => ({ label: roomLabel(r), value: r.emailAddress! }));
  const selectedOptions = selectedRoom
    ? [{ label: selectedRoom.name, value: selectedRoom.email }]
    : [];

  return (
    <div className="flex flex-col gap-2 max-w-prose">
      <div
        onKeyDown={(e) => {
          // Don't submit the surrounding form on Enter
          if (e.key === "Enter") e.preventDefault();
        }}
      >
        <UNSAFE_Combobox
          label={label}
          description="Søk på romnavn, f.eks. «fya1 a347» eller «kaptein». Valgt rom fylles inn som sted."
          options={[...selectedOptions, ...options]}
          filteredOptions={options}
          selectedOptions={selectedOptions}
          isLoading={searching}
          value={query}
          onChange={setQuery}
          onToggleSelected={(email, isSelected) => {
            if (!isSelected) {
              onSelect(null);
              return;
            }
            const room = results.find((r) => r.emailAddress === email);
            if (room?.emailAddress && room.displayName) {
              onSelect({ email: room.emailAddress, name: room.displayName });
              setQuery("");
            }
          }}
        />
      </div>
      {searchError && (
        <Alert variant="error" size="small">
          {searchError}{" "}
          <Button
            type="button"
            size="xsmall"
            variant="tertiary"
            onClick={() => setSearchAttempt((n) => n + 1)}
          >
            Prøv igjen
          </Button>
        </Alert>
      )}
      {selectedRoom && selectedRoom.email !== skipAvailabilityFor && (
        <RoomAvailabilityStatus
          roomEmail={selectedRoom.email}
          startTime={startTime}
          endTime={endTime}
        />
      )}
    </div>
  );
}

type AvailabilityResult =
  | { state: "done"; availability: RoomAvailability | undefined }
  | { state: "error"; message: string };

function RoomAvailabilityStatus({
  roomEmail,
  startTime,
  endTime,
}: {
  roomEmail: string;
  startTime: string | null;
  endTime: string | null;
}) {
  const [attempt, setAttempt] = useState(0);
  const hasRange = !!startTime && !!endTime && startTime < endTime;
  const key = `${roomEmail}|${startTime}|${endTime}|${attempt}`;
  const [fetched, setFetched] = useState<{ key: string; result: AvailabilityResult } | null>(null);

  useEffect(() => {
    if (!hasRange) return;
    let cancelled = false;
    getRoomAvailability([roomEmail], startTime!, endTime!).then((result) => {
      if (cancelled) return;
      setFetched({
        key,
        result: result.ok
          ? {
              state: "done",
              availability:
                result.data.find((a) => a.emailAddress === roomEmail) ?? result.data[0],
            }
          : { state: "error", message: result.message },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [key, hasRange, roomEmail, startTime, endTime]);

  const status: { state: "idle" } | { state: "loading" } | AvailabilityResult = !hasRange
    ? { state: "idle" }
    : fetched?.key === key
      ? fetched.result
      : { state: "loading" };

  if (status.state === "idle") {
    return (
      <BodyShort size="small" className="text-ax-text-neutral-subtle">
        Fyll inn start- og sluttid for å se om rommet er ledig.
      </BodyShort>
    );
  }
  if (status.state === "loading") {
    return <BodyShort size="small">Sjekker om rommet er ledig …</BodyShort>;
  }

  const retry = (
    <Button type="button" size="xsmall" variant="tertiary" onClick={() => setAttempt((n) => n + 1)}>
      Prøv igjen
    </Button>
  );

  if (status.state === "error" || !status.availability || status.availability.error || !status.availability.availabilityView) {
    const message = status.state === "error" ? status.message : "Kunne ikke hente ledighet for rommet.";
    return (
      <Alert variant="warning" size="small">
        {message} {retry}
      </Alert>
    );
  }

  const view = status.availability.availabilityView;
  if (/^0+$/.test(view)) {
    return (
      <div>
        <Tag variant="success" size="small">Ledig i hele tidsrommet</Tag>
      </div>
    );
  }
  if (/[234]/.test(view)) {
    return (
      <Alert variant="warning" size="small">
        Rommet er opptatt i deler av tidsrommet. Bookingen blir trolig avslått – vurder et annet rom.
      </Alert>
    );
  }
  return (
    <Alert variant="info" size="small">
      Rommet er foreløpig reservert i deler av tidsrommet.
    </Alert>
  );
}
