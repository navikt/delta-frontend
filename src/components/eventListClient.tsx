"use client";

import { FullDeltaEvent } from "@/types/event";
import { EventCard } from "@/components/eventCard";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

type Props = {
  events: FullDeltaEvent[];
  tabname: string;
  userEmail?: string;
};

export default function EventListClient({ events, tabname, userEmail }: Props) {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const onlyRegistered = userEmail != null && searchParams.get("onlyRegistered") === "1";

  const filtered = useMemo(() => {
    let result = events;

    // Hide fagfestival/fagdag events on "alle" tab
    if (tabname === "alle") {
      result = result.filter(
        (e) =>
          !e.categories.some(
            (c) => c.name === "fagfestival" || c.name === "fagdag_utvikling_og_data",
          ),
      );
    }

    // Hide expired signup-deadline events on "alle" tab
    if (tabname === "alle") {
      result = result.filter(
        (e) =>
          !e.event.signupDeadline ||
          new Date(e.event.signupDeadline) >= new Date(),
      );
    }

    // Search filter (client-side, title match)
    if (tabname === "alle" && search) {
      result = result.filter((e) =>
        e.event.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Only registered filter
    if (onlyRegistered && userEmail) {
      result = result.filter((e) =>
        e.participants.some((p) => p.email === userEmail),
      );
    }

    return result;
  }, [events, tabname, search, onlyRegistered, userEmail]);

  return (
    <div className="w-full p-4">
      {filtered.length > 0 && (
        <p className="pb-4">
          {filtered.length} {filtered.length === 1 ? "arrangement" : "arrangementer"}
        </p>
      )}
      <div className="grid grid-cols-1 ax-md:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((fullEvent) => (
            <EventCard
              event={fullEvent}
              categories={fullEvent.categories}
              tabname={tabname}
              userEmail={userEmail}
              key={`event-${fullEvent.event.id}`}
            />
          ))
        ) : (
          <p className="col-span-full italic text-ax-xlarge">
            Fant ingen arrangementer :--(
          </p>
        )}
      </div>
    </div>
  );
}
