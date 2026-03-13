"use client";

import { UserWrappedStats } from "@/service/wrappedActions";
import { motion } from "framer-motion";
import Link from "next/link";
import { Table, Pagination } from "@navikt/ds-react";
import { useState } from "react";

type WrappedClientProps = {
    stats: UserWrappedStats;
    year: number;
};

export default function WrappedClient({ stats, year }: WrappedClientProps) {
    return (
        <div className="w-full flex flex-col text-white -mb-4">
            <WelcomeSection stats={stats} year={year} />
            <TotalEventsSection stats={stats} />
            <CategorySection stats={stats} />
            <AttendanceSection stats={stats} />
            <FunFactsSection stats={stats} />

            <MimretidSection stats={stats} />
        </div>
    );
}

// Welcome Section
function WelcomeSection({ stats, year }: { stats: UserWrappedStats; year: number }) {
    return (
        <section
            className="min-h-[80vh] flex items-center justify-center p-8"
            style={{ background: 'linear-gradient(135deg, #312e81, #6b21a8, #312e81)' }}
        >
            <div className="text-center max-w-2xl">
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-6xl mb-12"
                >
                    🎉
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl ax-md:text-7xl font-black mb-8 text-white"
                >
                    Delta {year}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl ax-md:text-3xl font-medium text-white"
                >
                    Hei, {stats.userFirstName}! 👋
                </motion.p>
                <p className="text-xl mt-12 text-indigo-100">
                    Takk for at du deltar! Her er ditt tilbakeblikk.
                </p>
            </div>
        </section>
    );
}

// Total Events Section
function TotalEventsSection({ stats }: { stats: UserWrappedStats }) {
    const average = 3.7;

    // Calculate comparison text
    const avgDiff = stats.totalEventsAttended - average;
    let avgText;

    if (stats.totalEventsAttended === 0) {
        avgText = "Du har litt å gå på! Satser på neste år 🚀";
    } else if (avgDiff >= 0.5) {
        avgText = `Du deltok på ${Math.round(avgDiff)} flere enn snittet!`;
    } else {
        avgText = "Du er rett rundt gjennomsnittet.";
    }

    return (
        <section
            className="py-24 px-8 flex justify-center"
            style={{ background: 'linear-gradient(135deg, #db2777, #e11d48)' }}
        >
            <div className="text-center max-w-2xl w-full">
                <h2 className="text-2xl ax-md:text-3xl font-medium mb-8 text-white">
                    Du deltok på
                </h2>
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="relative inline-block"
                >
                    <span className="text-[8rem] ax-md:text-[12rem] font-black leading-none text-white drop-shadow-lg">
                        {stats.totalEventsAttended}
                    </span>
                </motion.div>
                <p className="text-2xl ax-md:text-3xl font-medium mt-4 text-white">
                    {stats.totalEventsAttended === 1 ? 'arrangement' : 'arrangementer'} i år!
                </p>

                <div className="mt-12 flex justify-center">
                    <div className="bg-white/20 rounded-2xl p-6 border border-white/20 backdrop-blur-sm max-w-md w-full">
                        <p className="text-sm text-pink-100 mb-2">Gjennomsnitt: {average}</p>
                        <p className="text-xl font-ax-bold text-white">{avgText}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Category Section
function CategorySection({ stats }: { stats: UserWrappedStats }) {
    if (!stats.favoriteCategory) return null;

    return (
        <section
            className="py-24 px-8 flex justify-center"
            style={{ background: 'linear-gradient(135deg, #0891b2, #2563eb)' }}
        >
            <div className="text-center max-w-2xl w-full">
                <h2 className="text-2xl ax-md:text-3xl font-medium mb-12 text-white">
                    Din favorittkategori
                </h2>
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className="text-8xl mb-6"
                >
                    {stats.favoriteCategory.emoji}
                </motion.div>
                <h3 className="text-4xl ax-md:text-6xl font-black mb-4 text-white drop-shadow-md">
                    {stats.favoriteCategory.name.toUpperCase()}
                </h3>
                <p className="text-xl ax-md:text-2xl text-cyan-50">
                    Du deltok på {stats.favoriteCategory.count} arrangementer
                </p>

                {stats.topCategories.length > 1 && (
                    <div className="mt-12 flex justify-center gap-4 flex-wrap">
                        {stats.topCategories.slice(1).map((cat) => (
                            <div key={cat.name} className="bg-white/20 border border-white/20 rounded-xl px-6 py-4 flex items-center gap-3 backdrop-blur-sm">
                                <span className="text-2xl">{cat.emoji}</span>
                                <span className="font-semibold text-white">{cat.name}</span>
                                <span className="text-cyan-100">({cat.count})</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

// Attendance Type Section
function AttendanceSection({ stats }: { stats: UserWrappedStats }) {
    const { fysisk, digitalt, hybrid } = stats.attendanceBreakdown;
    const total = fysisk + digitalt + hybrid;

    if (total === 0) return null;

    const typeConfig = {
        fysisk: { emoji: '🏢', label: 'På kontoret' },
        digitalt: { emoji: '💻', label: 'Digitalt' },
        hybrid: { emoji: '🔄', label: 'Hybrid' },
    };

    return (
        <section
            className="py-24 px-8 flex justify-center"
            style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}
        >
            <div className="max-w-2xl w-full">
                <h2 className="text-2xl ax-md:text-3xl font-medium mb-12 text-center text-white">
                    Dine arrangementer
                </h2>

                <div className="space-y-8">
                    {[
                        { type: 'fysisk' as const, count: fysisk },
                        { type: 'digitalt' as const, count: digitalt },
                        { type: 'hybrid' as const, count: hybrid },
                    ].map(({ type, count }) => (
                        <div key={type} className="relative">
                            <div className="flex items-center gap-4 mb-2 text-white">
                                <span className="text-3xl" aria-hidden="true">{typeConfig[type].emoji}</span>
                                <span className="text-lg font-medium flex-1">{typeConfig[type].label}</span>
                                <span className="text-2xl font-ax-bold">{count}</span>
                            </div>
                            {/* Darker background for the track */}
                            <div className="h-6 bg-black/40 rounded-full overflow-hidden border-2 border-white/50">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    // High contrast bar color (white/light)
                                    className="h-full bg-white/90"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-12 text-center">
                    <p className="text-xl ax-md:text-2xl font-ax-bold text-white inline-block">
                        {fysisk >= digitalt && fysisk >= hybrid && "De fleste arrangementene dine var fysiske! 🏢"}
                        {digitalt > fysisk && digitalt >= hybrid && "De fleste arrangementene dine var digitale! 💻"}
                        {hybrid > fysisk && hybrid > digitalt && "De fleste arrangementene dine var hybride! 🔄"}
                    </p>
                </div>
            </div>
        </section>
    );
}

// Mimretid Section
function MimretidSection({ stats }: { stats: UserWrappedStats }) {
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<{ orderBy: string; direction: 'ascending' | 'descending' }>({
        orderBy: 'date',
        direction: 'ascending'
    });
    const rowsPerPage = 10;

    const events = stats.attendedEvents || [];
    const count = events.length;
    const totalPages = Math.ceil(count / rowsPerPage);

    if (count === 0) return null;

    let sortedEvents = [...events];
    if (sort && sort.orderBy === 'date') {
        sortedEvents.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sort.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        });
    }

    const displayedEvents = sortedEvents.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const handleSort = (sortKey: string) => {
        setSort((prev) => ({
            orderBy: sortKey,
            direction:
                prev && prev.orderBy === sortKey && prev.direction === 'ascending'
                    ? 'descending'
                    : 'ascending',
        }));
    };

    return (
        <section
            className="py-24 px-8 flex justify-center"
            style={{ background: 'linear-gradient(135deg, #4338ca, #3730a3)' }}
        >
            <div className="max-w-4xl w-full">
                <h2 className="text-2xl ax-md:text-3xl font-medium mb-12 text-center text-white">
                    Mimretid!
                </h2>

                <div className="bg-white rounded-xl p-6 shadow-xl text-ax-neutral-1000 border-4 border-indigo-200 min-h-[600px] flex flex-col">
                    <Table
                        size="large"
                        sort={sort}
                        onSortChange={handleSort}
                    >
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell onClick={() => handleSort('date')} className="cursor-pointer select-none">
                                    Dato
                                    {sort?.orderBy === 'date' && (
                                        <span className="ml-2">
                                            {sort.direction === 'ascending' ? '↓' : '↑'}
                                        </span>
                                    )}
                                </Table.HeaderCell>
                                <Table.HeaderCell>Arrangement</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {displayedEvents.map((event) => {
                                const date = new Date(event.date);
                                const dateString = date.toLocaleDateString("nb-NO", {
                                    day: "numeric",
                                    month: "long",
                                });
                                return (
                                    <Table.Row key={event.id} className="h-16">
                                        <Table.DataCell className="whitespace-nowrap capitalize align-middle">{dateString}</Table.DataCell>
                                        <Table.DataCell className="align-middle">
                                            {event.isPublic ? (
                                                <a href={`/event/${event.id}`} className="font-semibold text-indigo-700 hover:underline line-clamp-2">
                                                    {event.title}
                                                </a>
                                            ) : (
                                                <span className="font-semibold line-clamp-2">{event.title}</span>
                                            )}
                                        </Table.DataCell>
                                    </Table.Row>
                                );
                            })}
                            {/* Fill remaining rows to maintain height */}
                            {Array.from({ length: Math.max(0, rowsPerPage - displayedEvents.length) }).map((_, index) => (
                                <Table.Row key={`empty-${index}`} className="h-16">
                                    <Table.DataCell className="whitespace-nowrap capitalize" aria-hidden="true">&nbsp;</Table.DataCell>
                                    <Table.DataCell aria-hidden="true">&nbsp;</Table.DataCell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                            <Pagination
                                page={page}
                                onPageChange={setPage}
                                count={totalPages}
                                size="small"
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4 mt-12 items-center">
                    <Link
                        href="/statistikk"
                        className="inline-flex items-center justify-center gap-2 bg-white text-indigo-900 hover:bg-indigo-50 rounded-full px-8 py-4 text-lg font-ax-bold transition-colors shadow-lg hover:underline"
                    >
                        📊 Se statistikk for Delta i stort
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 text-white underline decoration-white/50 hover:decoration-white transition-all"
                    >
                        ← Tilbake til arrangementer
                    </Link>
                </div>
            </div>
        </section>
    );
}

// Fun Facts & Stats Section
function FunFactsSection({ stats }: { stats: UserWrappedStats }) {
    return (
        <section
            className="py-24 px-8 flex justify-center"
            style={{ background: 'linear-gradient(135deg, #5b21b6, #4c1d95)' }}
        >
            <div className="max-w-4xl w-full">
                <h2 className="text-2xl ax-md:text-3xl font-medium mb-12 text-center text-white">
                    Visste du at...
                </h2>

                <div className="grid gap-6 ax-md:grid-cols-2 mb-12">
                    {stats.funFacts.map((fact, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-black/20 border-2 border-white/40 p-6 rounded-2xl backdrop-blur-sm"
                        >
                            <p className="text-lg font-medium leading-relaxed text-white">
                                {fact}
                            </p>
                        </motion.div>
                    ))}
                    {stats.funFacts.length === 0 && (
                        <div className="col-span-2 text-center text-white/80">
                            Du er fantastisk! 🎉
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 ax-sm:grid-cols-2 ax-lg:grid-cols-4 gap-6">
                    <StatBox icon="👥" value={stats.totalPeopleMetWith.toLocaleString('nb-NO')} label='kolleger "møtt"' />
                    <StatBox icon="⏰" value={Math.round(stats.totalHoursSpent).toLocaleString('nb-NO')} label="timer brukt" />
                    <StatBox icon="🎤" value={stats.eventsHosted.toLocaleString('nb-NO')} label="som vert" />
                    <StatBox
                        icon="📅"
                        value={Math.max(...stats.monthlyActivity).toLocaleString('nb-NO')}
                        label="flest på én mnd"
                    />
                </div>
            </div>
        </section>
    );
}

function StatBox({ icon, value, label }: { icon: string; value: string | number; label: string }) {
    return (
        <div className="bg-black/20 border-2 border-white/30 rounded-xl p-4 text-center backdrop-blur-sm">
            <span className="text-2xl block mb-2" aria-hidden="true">{icon}</span>
            <p className="text-2xl font-ax-bold text-white">{value}</p>
            <p className="text-sm text-white/90">{label}</p>
        </div>
    );
}


