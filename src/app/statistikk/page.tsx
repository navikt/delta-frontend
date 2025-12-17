import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import { getEventStatistics } from "@/service/statsActions";
import { Metadata } from 'next';
import Link from "next/link";
import { TrendUpIcon } from "@navikt/aksel-icons";
import YearSelector from "./yearSelector";
import CategorySection from "./categorySection";
import OverviewSection from "./overviewSection";

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

        {/* Event Details */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Detaljer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="bg-white p-6 rounded-lg border-2 border-blue-300">
                <div className="flex items-start gap-3 mb-4">
                  <TrendUpIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <h3 className="font-semibold text-lg text-gray-900">Mest populære arrangementer</h3>
                </div>
                <div className="space-y-4">
                  {stats.mostPopularEvents.map((event, index) => (
                    <div key={`${event.id}-${index}`} className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-b-0 border-gray-200">
                      <span className="text-2xl font-bold text-blue-600 min-w-[2rem]">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        {event.id ? (
                          <Link
                            href={`/event/${event.id}`}
                            className="text-blue-700 hover:text-blue-800 hover:underline font-medium"
                          >
                            {event.title}
                          </Link>
                        ) : (
                          <span className="text-gray-700 font-medium">
                            {event.title}
                          </span>
                        )}
                        <p className="text-sm text-gray-700 mt-1">
                          {event.participants.toLocaleString('nb-NO')} påmeldte deltakere
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Organizer Statistics */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Arrangører</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <StatCard
                title="Nye arrangører"
                value={stats.newOrganizersCount}
                suffix="førstegangsarrangører"
              />
            </div>
            {/* Placeholder to keep grid balanced if needed, or expand functionality later */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Top Organizers by Event Count */}
            <div className="bg-white p-6 rounded-lg border-2 border-green-300">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Arrangert flest arrangementer</h3>
              <div className="space-y-3">
                {stats.topOrganizersByEvents.map((org, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-green-600 w-6">
                        {index + 1}
                      </span>
                      <span className="text-gray-900 font-medium">{org.name}</span>
                    </div>
                    <span className="text-gray-600 font-medium">{org.count} arr.</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Organizers by Participant Count */}
            <div className="bg-white p-6 rounded-lg border-2 border-purple-300">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Samlet flest deltakere</h3>
              <div className="space-y-3">
                {stats.topOrganizersByParticipants.map((org, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-purple-600 w-6">
                        {index + 1}
                      </span>
                      <span className="text-gray-900 font-medium">{org.name}</span>
                    </div>
                    <span className="text-gray-600 font-medium">{org.count.toLocaleString('nb-NO')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </CardWithBackground>
  );
}

function StatCard({
  icon,
  title,
  value,
  suffix,
  subtitle,
}: {
  icon?: React.ReactNode;
  title: string;
  value: number;
  suffix?: string;
  subtitle?: string;
}) {
  const formattedValue = value.toLocaleString('nb-NO');

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      {icon && (
        <div className="text-blue-600 mb-3">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-gray-700 mb-1">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900">
        {formattedValue}
        {suffix && <span className="text-lg font-medium text-gray-600 ml-1">{suffix}</span>}
      </p>
      {subtitle && (
        <p className="text-sm text-gray-600 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
