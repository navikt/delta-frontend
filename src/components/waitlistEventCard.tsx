"use client";
import type { MyWaitlistEvent } from "@/types/event";
import { LinkCard, Tag, VStack } from "@navikt/ds-react";
import { LocationPinIcon } from "@navikt/aksel-icons";
import NextLink from "next/link";
import { formatCardTimeRange } from "@/service/eventGrouping";
import { CardHeaderRow, CardRow, useOverviewNavigation } from "./eventCard";

export function WaitlistEventCard({ entry: { event, position, open } }: { entry: MyWaitlistEvent }) {
  const href = `/event/${event.id}`;
  const handleNavigation = useOverviewNavigation(href);
  return (
    <LinkCard arrow={false} size="small" className="h-full">
      <CardHeaderRow time={formatCardTimeRange(event)} />
      <LinkCard.Title as="h3">
        <LinkCard.Anchor asChild>
          <NextLink href={href} prefetch={false} onClick={handleNavigation}>{event.title}</NextLink>
        </LinkCard.Anchor>
      </LinkCard.Title>
      {event.location && (
        <LinkCard.Description>
          <VStack as="span" gap="space-4">
            <CardRow icon={<LocationPinIcon />}><span className="line-clamp-2">{event.location}</span></CardRow>
          </VStack>
        </LinkCard.Description>
      )}
      <LinkCard.Footer>
        <Tag size="small" variant="moderate" data-color="info">Nr. {position} på ventelisten</Tag>
        {!open && <Tag size="small" variant="moderate" data-color="warning">Påmeldingsfristen er utløpt</Tag>}
      </LinkCard.Footer>
    </LinkCard>
  );
}
