import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import { getEventStatistics } from "@/service/statsActions";
import { Metadata } from 'next';
import Link from "next/link";
import {
  CalendarIcon,
  PersonGroupIcon,
  BarChartIcon,
  TrendUpIcon,
  LocationPinIcon,
} from "@navikt/aksel-icons";
import YearSelector from "./yearSelector";

export const metadata: Metadata = {
  title: 'Statistikk - Delta Δ Nav',
};

export default async function StatsPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  await checkToken("/stats");

  const currentYear = new Date().getFullYear();
  const selectedYear = searchParams.year ? parseInt(searchParams.year) : currentYear;

  const stats = await getEventStatistics(selectedYear);

  return (
    <CardWithBackground title="Statistikk">
      <YearSelector selectedYear={selectedYear} currentYear={currentYear} />
      <div className="space-y-8">
        {/* Overview Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Oversikt for {selectedYear}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<CalendarIcon className="w-6 h-6" />}
              title="Arrangementer i år"
              value={stats.totalEventsThisYear}
              subtitle={`${stats.totalEvents.toLocaleString('nb-NO')} totalt alle år`}
              details={
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong>Offentlige:</strong> {stats.publicEvents.toLocaleString('nb-NO')}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Private:</strong> {stats.privateEvents.toLocaleString('nb-NO')}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Med påmeldingsgrense:</strong> {stats.eventsWithLimit.toLocaleString('nb-NO')}
                  </p>
                </div>
              }
            />
            <StatCard
              icon={<PersonGroupIcon className="w-6 h-6" />}
              title="Totalt deltakere"
              value={stats.totalParticipants}
              subtitle={`${stats.averageParticipants.toLocaleString('nb-NO')} gjennomsnitt per arrangement`}
              details={
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Dette er basert på {stats.totalEventsThisYear.toLocaleString('nb-NO')} arrangementer i {selectedYear}.
                  </p>
                  <p className="text-sm text-gray-700">
                    Gjennomsnittet per arrangement er {stats.averageParticipants.toLocaleString('nb-NO')} deltakere.
                  </p>
                </div>
              }
            />
            <StatCard
              icon={<TrendUpIcon className="w-6 h-6" />}
              title="Kommende arrangementer"
              value={stats.upcomingEvents}
              subtitle={`${stats.pastEvents.toLocaleString('nb-NO')} tidligere`}
              details={
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong>Fullførte:</strong> {stats.pastEvents.toLocaleString('nb-NO')} arrangementer
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Planlagt:</strong> {stats.upcomingEvents.toLocaleString('nb-NO')} arrangementer
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Total: {stats.totalEventsThisYear.toLocaleString('nb-NO')} arrangementer i {selectedYear}
                  </p>
                </div>
              }
            />
            <StatCard
              icon={<BarChartIcon className="w-6 h-6" />}
              title="Fagtorsdag arrangementer"
              value={stats.fagTorsdagEvents}
              details={
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Fagtorsdag er vår ukentlige kompetansedeling.
                  </p>
                  <p className="text-sm text-gray-700">
                    {stats.fagTorsdagEvents > 0 && (
                      <>
                        Det er gjennomført {stats.fagTorsdagEvents.toLocaleString('nb-NO')} Fagtorsdag arrangementer i {selectedYear}.
                      </>
                    )}
                    {stats.fagTorsdagEvents === 0 && (
                      <>Ingen Fagtorsdag arrangementer registrert i {selectedYear}.</>
                    )}
                  </p>
                </div>
              }
            />
          </div>
        </section>

        {/* Category Statistics */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Arrangementer per kategori</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.categoryStats.map((cat) => (
              <StatCard
                key={cat.category}
                title={cat.category}
                value={cat.count}
                icon={<BarChartIcon className="w-6 h-6" />}
              />
            ))}
          </div>
        </section>

        {/* Attendance Type Statistics */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Oppmøtetype</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.attendanceTypeStats.map((type) => (
              <StatCard
                key={type.type}
                title={type.type}
                value={type.count}
                icon={<LocationPinIcon className="w-6 h-6" />}
              />
            ))}
          </div>
        </section>

        {/* Event Details */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Detaljer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <StatCard
                title="Offentlige arrangementer"
                value={stats.publicEvents}
                subtitle={`${stats.privateEvents} private`}
              />
              <StatCard
                title="Med påmeldingsgrense"
                value={stats.eventsWithLimit}
                subtitle={`${stats.eventsWithoutLimit} uten grense`}
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
      </div>
    </CardWithBackground>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  details,
}: {
  icon?: React.ReactNode;
  title: string;
  value: number;
  subtitle?: string;
  details?: React.ReactNode;
}) {
  const formattedValue = value.toLocaleString('nb-NO');

  return (
    <details className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors group">
      <summary className="cursor-pointer list-none">
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
        </p>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">
            {subtitle}
          </p>
        )}
        {details && (
          <p className="text-xs text-blue-600 mt-2 group-open:hidden">
            Klikk for mer info
          </p>
        )}
      </summary>
      {details && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {details}
        </div>
      )}
    </details>
  );
}
