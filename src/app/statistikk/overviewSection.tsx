"use client";

import { useState } from "react";
import {
    CalendarIcon,
    PersonGroupIcon,
    LocationPinIcon,
} from "@navikt/aksel-icons";
import { CategoryEvent, CategoryStat, AttendanceTypeStat } from "@/service/statsActions";
import CategoryModal from "./categoryModal";

type OverviewSectionProps = {
    selectedYear: number;
    totalEventsThisYear: number;
    totalEvents: number;
    totalParticipants: number;
    uniqueParticipants: number;
    averageParticipants: number;
    medianParticipants: number;
    averageEventsPerPerson: number;
    medianEventsPerPerson: number;
    allEventsThisYear: CategoryEvent[];
    allCategoryStats: CategoryStat[];
    attendanceTypeStats: AttendanceTypeStat[];
};

export default function OverviewSection({
    selectedYear,
    totalEventsThisYear,
    totalEvents,
    totalParticipants,
    uniqueParticipants,
    averageParticipants,
    medianParticipants,
    averageEventsPerPerson,
    medianEventsPerPerson,
    allEventsThisYear,
    allCategoryStats,
    attendanceTypeStats,
}: OverviewSectionProps) {
    const [showOverviewModal, setShowOverviewModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState<AttendanceTypeStat | null>(null);

    return (
        <>
            {/* Overview Section */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Oversikt for {selectedYear}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<CalendarIcon className="w-6 h-6" />}
                        title="Arrangementer i år"
                        value={totalEventsThisYear}
                        suffix="arrangementer"
                        subtitle={`${totalEvents.toLocaleString('nb-NO')} totalt alle år`}
                    />
                    <StatCard
                        icon={<PersonGroupIcon className="w-6 h-6" />}
                        title="Totalt deltakere"
                        value={totalParticipants}
                        suffix="deltakere"
                        subtitle={`${uniqueParticipants.toLocaleString('nb-NO')} unike deltakere`}
                    />
                    <StatCard
                        icon={<PersonGroupIcon className="w-6 h-6" />}
                        title="Gjennomsnitt per arrangement"
                        value={averageParticipants}
                        suffix="deltakere"
                        subtitle={`Median: ${medianParticipants.toLocaleString('nb-NO')} deltakere`}
                    />
                    <StatCard
                        icon={<PersonGroupIcon className="w-6 h-6" />}
                        title="Gjennomsnitt per person"
                        value={averageEventsPerPerson}
                        suffix="arrangementer"
                        subtitle={`Median: ${medianEventsPerPerson.toLocaleString('nb-NO')} arrangementer`}
                    />
                </div>
                <button
                    onClick={() => setShowOverviewModal(true)}
                    className="mt-4 text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium cursor-pointer"
                >
                    Klikk for detaljer →
                </button>
            </section>

            {/* Attendance Type Statistics */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Oppmøtetype</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {attendanceTypeStats.map((type) => {
                        return (
                            <ClickableStatCard
                                key={type.type}
                                title={type.type}
                                value={type.count}
                                suffix="arrangementer"
                                subtitle={`${type.uniqueParticipants.toLocaleString('nb-NO')} unike deltakere, ${type.totalParticipants.toLocaleString('nb-NO')} deltakelser totalt`}
                                icon={<LocationPinIcon className="w-6 h-6" />}
                                onClick={() => setShowAttendanceModal(type)}
                            />
                        );
                    })}
                </div>
            </section>

            {/* Overview Modal */}
            {showOverviewModal && (
                <CategoryModal
                    isOpen={true}
                    onClose={() => setShowOverviewModal(false)}
                    categoryName={`Alle arrangementer ${selectedYear}`}
                    events={allEventsThisYear}
                    categoryStats={allCategoryStats}
                />
            )}

            {/* Attendance Type Modal */}
            {showAttendanceModal && (
                <CategoryModal
                    isOpen={true}
                    onClose={() => setShowAttendanceModal(null)}
                    categoryName={showAttendanceModal.type}
                    events={showAttendanceModal.events}
                />
            )}
        </>
    );
}

// Non-clickable stat card for overview section
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

// Clickable stat card for attendance type section
function ClickableStatCard({
    icon,
    title,
    value,
    suffix,
    subtitle,
    onClick,
}: {
    icon?: React.ReactNode;
    title: string;
    value: number;
    suffix?: string;
    subtitle?: string;
    onClick?: () => void;
}) {
    const formattedValue = value.toLocaleString('nb-NO');

    return (
        <button
            onClick={onClick}
            className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors text-left cursor-pointer w-full"
        >
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
            <p className="text-xs text-blue-600 mt-2">Klikk for detaljer</p>
        </button>
    );
}
