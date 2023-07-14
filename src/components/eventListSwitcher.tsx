"use client";

import { DeltaEvent } from "@/types/event";
import { Tabs } from "@navikt/ds-react";
import EventList from "./eventList";

type EventListSwitcherProps = {
  all: DeltaEvent[];
  my: DeltaEvent[];
  joined: DeltaEvent[];
};
export default function EventListSwitcher({
  all,
  my,
  joined,
}: EventListSwitcherProps) {
  return (
    <div className="flex flex-col gap-6 w-full justify-center items-center">
      <Tabs defaultValue="all" className="w-full">
        <Tabs.List className="flex justify-around w-full">
          <Tabs.Tab value="all" label="Alle" />
          <Tabs.Tab value="my" label="Mine" />
          <Tabs.Tab value="joined" label="Påmeldt" />
        </Tabs.List>
        <Tabs.Panel value="all" className="h-24 w-full bg-gray-50 p-4">
          <EventList events={all} />
        </Tabs.Panel>
        <Tabs.Panel value="my" className="h-24 w-full bg-gray-50 p-4">
          <EventList events={my} />
        </Tabs.Panel>
        <Tabs.Panel value="joined" className="h-24  w-full bg-gray-50 p-4">
          <EventList events={joined} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
