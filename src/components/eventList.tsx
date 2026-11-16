"use client";
import { Fragment, type ReactNode } from "react";
import type { FullDeltaEvent } from "@/types/event";
import { BodyShort, Box, HGrid, Heading, HStack, VStack } from "@navikt/ds-react";
import { EventCard } from "@/components/eventCard";
import { EVENT_GRID_COLUMNS } from "@/components/eventResultsSkeleton";
import { groupEventsByDay } from "@/service/eventGrouping";

type DayGroupsProps<T> = {
  items: T[];
  now: number;
  descending?: boolean;
  renderItem: (item: T) => ReactNode;
};

/** Renders items under browser-local day headings. Only render after hydration (`now` known). */
export function EventDayGroups<T extends { event: { id: string; startTime: string } }>({
  items, now, descending = false, renderItem,
}: DayGroupsProps<T>) {
  return (
    <VStack gap="space-32">
      {groupEventsByDay(items, now, { descending }).map(group => (
        <VStack as="section" key={group.key} gap="space-12" aria-labelledby={`day-${group.key}`}>
          <HStack gap="space-8" align="baseline" wrap>
            <Heading level="2" size="small" id={`day-${group.key}`}>{group.label}</Heading>
            <BodyShort textColor="subtle">{group.dateLabel}</BodyShort>
          </HStack>
          <HGrid gap="space-16" columns={EVENT_GRID_COLUMNS}>
            {group.events.map(item => <Fragment key={item.event.id}>{renderItem(item)}</Fragment>)}
          </HGrid>
        </VStack>
      ))}
    </VStack>
  );
}

export function EmptyEventList({ children }: { children: ReactNode }) {
  return (
    <Box background="raised" borderColor="neutral-subtle" borderWidth="1" borderRadius="12" padding="space-24">
      <BodyShort textColor="subtle">{children}</BodyShort>
    </Box>
  );
}

export default function EventList({ fullEvents, now, userEmail, descending, emptyMessage }: {
  fullEvents: FullDeltaEvent[];
  now: number;
  userEmail?: string;
  descending?: boolean;
  emptyMessage: ReactNode;
}) {
  if (!fullEvents.length) return <EmptyEventList>{emptyMessage}</EmptyEventList>;
  return <EventDayGroups items={fullEvents} now={now} descending={descending}
    renderItem={fullEvent => <EventCard event={fullEvent} userEmail={userEmail} />} />;
}
