"use client";

import { useState } from "react";
import {
    CalendarIcon,
    PersonGroupIcon,
    LocationPinIcon,
} from "@navikt/aksel-icons";
import type { CategoryEvent, CategoryStat, AttendanceTypeStat } from "@/service/statsActions";
import CategoryModal from "./categoryModal";
import { ClickableStatCard, StatCard } from "./statCard";
import { Button, Heading } from "@navikt/ds-react";

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
                <Heading level="2" size="medium" spacing>Oversikt for {selectedYear}</Heading>
                <div className="grid grid-cols-1 ax-md:grid-cols-2 ax-lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<CalendarIcon className="w-6 h-6" />}
                        title="Arrangementer i år"
                        value={totalEventsThisYear}
                        suffix="arrangementer"
                        subtitle={`${totalEvents.toLocaleString('nb-NO')} totalt alle år`}
                    />
                    <StatCard
                        icon={<PersonGroupIcon className="w-6 h-6" />}
                        title="Totalt deltakelser"
                        value={totalParticipants}
                        suffix="deltakelser"
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
                <Button
                    type="button"
                    variant="tertiary"
                    size="small"
                    onClick={() => setShowOverviewModal(true)}
                    className="mt-4"
                >
                    Klikk for detaljer →
                </Button>
            </section>

            {/* Attendance Type Statistics */}
            <section>
                <Heading level="2" size="medium" spacing>Oppmøtetype</Heading>
                <div className="grid grid-cols-1 ax-md:grid-cols-3 gap-4">
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
