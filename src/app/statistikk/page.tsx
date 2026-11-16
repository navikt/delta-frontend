import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import { getEventStatistics } from "@/service/statsActions";
import { Metadata } from 'next';
import NextLink from "next/link";
import { BodyShort, Box, Heading, HStack, Link, VStack } from "@navikt/ds-react";
import { TrendUpIcon } from "@navikt/aksel-icons";
import YearSelector from "./yearSelector";
import CategorySection from "./categorySection";
import OverviewSection from "./overviewSection";
import { StatCard } from "./statCard";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const currentYear = new Date().getFullYear();
  const selectedYear = params.year ? parseInt(params.year) : currentYear;

  return {
    title: `Statistikk ${selectedYear} - Delta Δ Nav`,
  };
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  await checkToken("/statistikk");

  const params = await searchParams;
  const currentYear = new Date().getFullYear();
  const selectedYear = params.year ? parseInt(params.year) : currentYear;

  const stats = await getEventStatistics(selectedYear);
  const popularEventKeyOccurrences = new Map<string, number>();

  return (
    <CardWithBackground
      title={`Statistikk ${selectedYear}`}
      subtitle="Takk for at du deltar!"
    >
      <YearSelector selectedYear={selectedYear} currentYear={currentYear} />
      <div className="space-y-8">
        {/* Overview and Attendance Type Sections - Client Component */}
        <OverviewSection
          selectedYear={selectedYear}
          totalEventsThisYear={stats.totalEventsThisYear}
          totalEvents={stats.totalEvents}
          totalParticipants={stats.totalParticipants}
          uniqueParticipants={stats.uniqueParticipants}
          averageParticipants={stats.averageParticipants}
          medianParticipants={stats.medianParticipants}
          averageEventsPerPerson={stats.averageEventsPerPerson}
          medianEventsPerPerson={stats.medianEventsPerPerson}
          allEventsThisYear={stats.allEventsThisYear}
          allCategoryStats={stats.allCategoryStats}
          attendanceTypeStats={stats.attendanceTypeStats}
        />

        {/* Category Statistics */}
        <CategorySection
          categoryStats={stats.categoryStats}
          fagtorsdagStat={stats.arrangementTypeStats.map(s => ({
            category: s.type,
            count: s.count,
            events: s.events,
            totalParticipants: s.totalParticipants,
            uniqueParticipants: s.uniqueParticipants
          })).find(s => s.category === 'Fagtorsdag')}
          allCategoryStats={stats.allCategoryStats}
        />


        {/* Organizer Statistics */}
        <section>
          <Heading level="2" size="medium" spacing>Arrangører</Heading>
          <div className="grid grid-cols-1 ax-md:grid-cols-2 gap-4">
            <StatCard
              title="Totalt antall arrangører"
              value={stats.totalOrganizersCount}
              suffix="unike arrangører"
            />
            <StatCard
              title="Nye arrangører"
              value={stats.newOrganizersCount}
              suffix="førstegangsarrangører"
            />
          </div>

          <div className="grid grid-cols-1 ax-md:grid-cols-2 gap-4 mt-4">
            {/* Top Organizers by Event Count */}
            <Box background="raised" borderColor="neutral-subtle" borderWidth="1" borderRadius="12" padding="space-24">
              <Heading level="3" size="small" spacing>Arrangert flest arrangementer</Heading>
              <VStack gap="space-12">
                {stats.topOrganizersByEvents.map((org, index) => (
                  <HStack key={org.name} justify="space-between" align="center" gap="space-12" wrap={false} className="border-b border-ax-border-neutral-subtle last:border-0 pb-2 last:pb-0">
                    <HStack as="span" align="center" gap="space-12" wrap={false}>
                      <BodyShort as="span" size="large" weight="semibold" className="w-6 text-ax-text-success">
                        {index + 1}
                      </BodyShort>
                      <BodyShort as="span" weight="semibold">{org.name}</BodyShort>
                    </HStack>
                    <BodyShort as="span" textColor="subtle" className="shrink-0">{org.count} arr.</BodyShort>
                  </HStack>
                ))}
              </VStack>
            </Box>

            {/* Top Organizers by Participant Count */}
            <Box background="raised" borderColor="neutral-subtle" borderWidth="1" borderRadius="12" padding="space-24">
              <Heading level="3" size="small" spacing>Samlet flest deltakere</Heading>
              <VStack gap="space-12">
                {stats.topOrganizersByParticipants.map((org, index) => (
                  <HStack key={org.name} justify="space-between" align="center" gap="space-12" wrap={false} className="border-b border-ax-border-neutral-subtle last:border-0 pb-2 last:pb-0">
                    <HStack as="span" align="center" gap="space-12" wrap={false}>
                      <BodyShort as="span" size="large" weight="semibold" className="w-6 text-ax-text-meta-purple">
                        {index + 1}
                      </BodyShort>
                      <BodyShort as="span" weight="semibold">{org.name}</BodyShort>
                    </HStack>
                    <BodyShort as="span" textColor="subtle" className="shrink-0">
                      {org.count.toLocaleString('nb-NO')}
                      {org.uniqueCount !== undefined && (
                        <>
                          <span className="mx-1">/</span>
                          <BodyShort as="span" size="small">{org.uniqueCount.toLocaleString('nb-NO')} unike</BodyShort>
                        </>
                      )}
                    </BodyShort>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </div>
        </section>

        {/* Event Details */}
        <section>
          <Heading level="2" size="medium" spacing>Detaljer</Heading>
          <div className="grid grid-cols-1 ax-md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <StatCard
                title="Med påmeldingsfrist"
                value={stats.eventsWithDeadline}
                suffix={`arrangementer (${Math.round((stats.eventsWithDeadline / stats.totalEventsThisYear) * 100)}%)`}
                subtitle={`${stats.eventsWithoutDeadline.toLocaleString('nb-NO')} uten frist (${Math.round((stats.eventsWithoutDeadline / stats.totalEventsThisYear) * 100)}%)`}
              />
              <StatCard
                title="Med maks antall deltagere"
                value={stats.eventsWithLimit}
                suffix={`arrangementer (${Math.round((stats.eventsWithLimit / stats.totalEventsThisYear) * 100)}%)`}
                subtitle={`${stats.eventsWithoutLimit.toLocaleString('nb-NO')} uten grense (${Math.round((stats.eventsWithoutLimit / stats.totalEventsThisYear) * 100)}%)`}
              />
            </div>
            {stats.mostPopularEvents.length > 0 && (
              <Box background="raised" borderColor="neutral-subtle" borderWidth="1" borderRadius="12" padding="space-24">
                <HStack gap="space-12" align="center" wrap={false} className="mb-4">
                  <TrendUpIcon aria-hidden className="w-6 h-6 text-ax-text-accent flex-shrink-0" />
                  <Heading level="3" size="small">Mest populære arrangementer</Heading>
                </HStack>
                <VStack gap="space-16">
                  {stats.mostPopularEvents.map((event, index) => {
                    const baseKey = event.id || `${event.title}-${event.participants}`;
                    const occurrence = popularEventKeyOccurrences.get(baseKey) ?? 0;
                    popularEventKeyOccurrences.set(baseKey, occurrence + 1);

                    return (
                      <HStack key={`${baseKey}-${occurrence}`} gap="space-12" align="start" wrap={false} className="pb-4 last:pb-0 border-b last:border-b-0 border-ax-border-neutral-subtle">
                        <Heading as="span" level="4" size="medium" className="min-w-[2rem] text-ax-text-accent">
                          {index + 1}
                        </Heading>
                        <div className="flex-1">
                          {event.id ? (
                            <Link as={NextLink} href={`/event/${event.id}`} className="font-ax-bold">
                              {event.title}
                            </Link>
                          ) : (
                            <BodyShort as="span" weight="semibold">
                              {event.title}
                            </BodyShort>
                          )}
                          <BodyShort size="small" textColor="subtle" className="mt-1">
                            {event.participants.toLocaleString('nb-NO')} påmeldte deltakere
                          </BodyShort>
                        </div>
                      </HStack>
                    );
                  })}
                </VStack>
              </Box>
            )}
          </div>
        </section>
      </div>
    </CardWithBackground>
  );
}
