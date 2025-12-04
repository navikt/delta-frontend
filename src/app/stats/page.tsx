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

export const metadata: Metadata = {
  title: 'Statistikk - Delta Δ Nav',
};

export default async function StatsPage() {
  await checkToken("/stats");

  const stats = await getEventStatistics();

  return (
    <CardWithBackground title="Statistikk">
      <div className="space-y-8">
        {/* Overview Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Oversikt</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<CalendarIcon className="w-6 h-6" />}
              title="Arrangementer i år"
              value={stats.totalEventsThisYear}
              subtitle={`${stats.totalEvents} totalt`}
            />
            <StatCard
              icon={<PersonGroupIcon className="w-6 h-6" />}
              title="Totalt deltakere"
              value={stats.totalParticipants}
              subtitle={`${stats.averageParticipants} gjennomsnitt per arrangement`}
            />
            <StatCard
              icon={<TrendUpIcon className="w-6 h-6" />}
              title="Kommende arrangementer"
              value={stats.upcomingEvents}
              subtitle={`${stats.pastEvents} tidligere`}
            />
            <StatCard
              icon={<BarChartIcon className="w-6 h-6" />}
              title="Fagtorsdag arrangementer"
              value={stats.fagTorsdagEvents}
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
            {stats.mostPopularEvent && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <TrendUpIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Mest populære arrangement</h3>
                    <Link
                      href={`/event/${stats.mostPopularEvent.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {stats.mostPopularEvent.title}
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {stats.mostPopularEvent.participants} påmeldte deltakere
                    </p>
                  </div>
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
}: {
  icon?: React.ReactNode;
  title: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {icon && (
        <div className="text-blue-600 dark:text-blue-400 mb-3">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
