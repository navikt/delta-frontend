"use client";
import type { FullDeltaEvent } from "@/types/event";
import { BodyShort, HStack, LinkCard, Skeleton, Tag, VStack } from "@navikt/ds-react";
import { HourglassIcon, LocationPinIcon, PersonGroupIcon } from "@navikt/aksel-icons";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { formatDeadline } from "@/service/format";
import { formatCardTimeRange, getEventTimeStatus } from "@/service/eventGrouping";
import { countCapacityAttendees } from "@/service/eventCapacity";
import { isOptionFull, optionCapacityText } from "@/service/signupOptions";
import { RecurringBadge } from "@/components/RecurringBadge";
import { useOverviewPath } from "@/components/useOverviewPath";
import { rememberOverviewReturn } from "@/components/overviewReturn";
import { useBrowserNow } from "@/components/useBrowserNow";

const FEW_SEATS_LEFT = 9;

/** Stores the overview scroll position and return target before opening an event. */
export function useOverviewNavigation(href: string) {
  const returnTo = useOverviewPath();
  return () => {
    sessionStorage.setItem(`event-overview-scroll:${returnTo}`, `${window.scrollY}`);
    rememberOverviewReturn(href, returnTo);
  };
}

export function CardRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <HStack as="span" gap="space-8" align="center" wrap={false}>
      <span aria-hidden className="flex shrink-0 text-ax-text-neutral-subtle">{icon}</span>
      <HStack as="span" gap="space-8" align="center" className="min-w-0">{children}</HStack>
    </HStack>
  );
}

/** Top row of an overview card. LinkCard has no header slot, so the image grid area hosts the time/tags row. */
export function CardHeaderRow({ time, ended = false, children }: { time: string; ended?: boolean; children?: ReactNode }) {
  return (
    <HStack gap="space-8" justify="space-between" align="center" marginBlock="space-0 space-8" className="[grid-area:image]">
      <BodyShort as="span" size="small" weight="semibold" className={ended ? "text-ax-text-neutral-subtle" : "text-ax-text-accent"}>{time}</BodyShort>
      {children && <HStack gap="space-4" wrap>{children}</HStack>}
    </HStack>
  );
}

function Capacity({ event, now, ended }: { event: FullDeltaEvent; now: number | null; ended: boolean }) {
  const options = event.event.signupOptions ?? [];
  if (options.length) {
    return <>
      <span>{options.map((option) => `${option.label}: ${optionCapacityText(option)}`).join(" · ")}</span>
      {!ended && options.every(isOptionFull) && <Tag size="xsmall" variant="moderate" data-color="warning">Fullt</Tag>}
      {!ended && options.some((option) => option.waitlistEnabled) && <Tag size="xsmall" variant="outline" data-color="info">Venteliste</Tag>}
    </>;
  }
  const limit = event.event.participantLimit;
  if (limit === 0) {
    const count = event.participants.length;
    return <>{count} {count === 1 ? "deltaker" : "deltakere"}</>;
  }
  if (now === null && event.event.signupDeadline) return <Skeleton variant="text" width="8rem" />;
  const attendees = countCapacityAttendees(event.participants, event.hosts, event.invited,
    event.event.signupDeadline, new Date(now ?? 0));
  const remaining = limit - attendees;
  return <>
    <span>{attendees} av {limit} plasser</span>
    {!ended && (remaining <= 0 ? <Tag size="xsmall" variant="moderate" data-color="warning">Fullt</Tag>
      : remaining <= FEW_SEATS_LEFT && (
        <Tag size="xsmall" variant="moderate" data-color="warning">
          Kun {remaining} {remaining === 1 ? "plass" : "plasser"} igjen
        </Tag>
      ))}
    {!ended && event.event.waitlistEnabled && <Tag size="xsmall" variant="outline" data-color="info">Venteliste</Tag>}
  </>;
}

export function EventCard({ event, userEmail }: { event: FullDeltaEvent; userEmail?: string }) {
  const now = useBrowserNow();
  const href = `/event/${event.event.id}`;
  const handleNavigation = useOverviewNavigation(href);
  const isRegistered = userEmail != null && event.participants.some(p => p.email === userEmail);
  const isHost = userEmail != null && event.hosts.some(h => h.email === userEmail);
  const deadline = event.event.signupDeadline;
  const deadlineExpired = now !== null && !!deadline && new Date(deadline).getTime() < now;
  const timeStatus = getEventTimeStatus(event.event, now);
  const ended = timeStatus === "ended";

  return (
    <LinkCard arrow={false} size="small" className={ended ? "h-full bg-ax-bg-neutral-soft" : "h-full"}>
      <CardHeaderRow time={formatCardTimeRange(event.event)} ended={ended}>
        {ended && <Tag size="small" variant="moderate" data-color="neutral">Avsluttet</Tag>}
        {timeStatus === "ongoing" && <Tag size="small" variant="moderate" data-color="info">Pågår nå</Tag>}
        {event.recurringSeries && <RecurringBadge frequency={event.recurringSeries.frequency} />}
        {isHost && <Tag size="small" variant="moderate" data-color="meta-purple">Du arrangerer</Tag>}
        {isRegistered && <Tag size="small" variant="moderate" data-color="success">Påmeldt</Tag>}
      </CardHeaderRow>
      <LinkCard.Title as="h3">
        <LinkCard.Anchor asChild>
          <NextLink href={href} prefetch={false} onClick={handleNavigation}>{event.event.title}</NextLink>
        </LinkCard.Anchor>
      </LinkCard.Title>
      <LinkCard.Description>
        <VStack as="span" gap="space-4">
          {event.event.location && (
            <CardRow icon={<LocationPinIcon />}><span className="line-clamp-2">{event.event.location}</span></CardRow>
          )}
          <CardRow icon={<PersonGroupIcon />}><Capacity event={event} now={now} ended={ended} /></CardRow>
          {deadline && !ended && (
            <CardRow icon={<HourglassIcon />}>
              {now === null ? <Skeleton variant="text" width="10rem" />
                : deadlineExpired ? <>Påmeldingsfrist: <Tag size="xsmall" variant="moderate" data-color="danger">Utløpt</Tag></>
                : <>Påmeldingsfrist: {formatDeadline(event.event)}</>}
            </CardRow>
          )}
        </VStack>
      </LinkCard.Description>
      {event.categories.length > 0 && (
        <LinkCard.Footer>
          {event.categories.map(category => (
            <Tag key={category.id} size="small" variant="outline" data-color="neutral">{category.name}</Tag>
          ))}
        </LinkCard.Footer>
      )}
    </LinkCard>
  );
}
