"use client";

import { UserWrappedStats } from "@/service/wrappedActions";
import { motion } from "framer-motion";
import Link from "next/link";

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
            <SummarySection stats={stats} year={year} />
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
                    className="text-6xl mb-8"
                >
                    🎉
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-7xl font-black mb-6 text-white"
                >
                    DELTA {year}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl md:text-3xl font-medium text-white"
                >
                    Hei, {stats.userFirstName}! 👋
                </motion.p>
                <p className="text-xl mt-4 text-indigo-100">
                    Her er en oppsummering av ditt år i Delta.
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
    const avgText = avgDiff > 0
        ? `Du deltok på ${Math.round(avgDiff)} flere enn snittet!`
        : "Du er rett rundt gjennomsnittet.";

    return (
        <section
            className="py-24 px-8 flex justify-center"
            style={{ background: 'linear-gradient(135deg, #db2777, #e11d48)' }}
        >
            <div className="text-center max-w-2xl w-full">
                <h2 className="text-2xl md:text-3xl font-medium mb-8 text-white">
                    Du deltok på
                </h2>
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="relative inline-block"
                >
                    <span className="text-[8rem] md:text-[12rem] font-black leading-none text-white drop-shadow-lg">
                        {stats.totalEventsAttended}
                    </span>
                </motion.div>
                <p className="text-2xl md:text-3xl font-medium mt-4 text-white">
                    {stats.totalEventsAttended === 1 ? 'arrangement' : 'arrangementer'} i år!
                </p>

                <div className="mt-12 flex justify-center">
                    <div className="bg-white/20 rounded-2xl p-6 border border-white/20 backdrop-blur-sm max-w-md w-full">
                        <p className="text-sm text-pink-100 mb-2">Gjennomsnitt: {average}</p>
                        <p className="text-xl font-bold text-white">{avgText}</p>
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
                <h2 className="text-2xl md:text-3xl font-medium mb-12 text-white">
                    Din favoritt-kategori
                </h2>
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className="text-8xl mb-6"
                >
                    {stats.favoriteCategory.emoji}
                </motion.div>
                <h3 className="text-4xl md:text-6xl font-black mb-4 text-white drop-shadow-md">
                    {stats.favoriteCategory.name.toUpperCase()}
                </h3>
                <p className="text-xl md:text-2xl text-cyan-50">
                    {stats.favoriteCategory.count} arrangementer
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
                <h2 className="text-2xl md:text-3xl font-medium mb-12 text-center text-white">
                    Slik deltok du
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
                                <span className="text-2xl font-bold">{count}</span>
                            </div>
                            {/* Darker background for the track */}
                            <div className="h-6 bg-black/40 rounded-full overflow-hidden border border-white/20">
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
            </div>
        </section>
    );
}

// Fun Facts Section
function FunFactsSection({ stats }: { stats: UserWrappedStats }) {
    return (
        <section
            className="py-24 px-8 flex justify-center"
            // Slightly darker gradient for better text contrast
            style={{ background: 'linear-gradient(135deg, #b45309, #c2410c, #b91c1c)' }}
        >
            <div className="max-w-4xl w-full">
                <h2 className="text-2xl md:text-3xl font-medium mb-12 text-center text-white">
                    Visste du at...
                </h2>

                <div className="grid gap-6 md:grid-cols-2 mb-12">
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatBox icon="👥" value={stats.totalPeopleMetWith.toLocaleString('nb-NO')} label="kolleger møtt" />
                    <StatBox icon="⏰" value={Math.round(stats.totalHoursSpent).toLocaleString('nb-NO')} label="timer brukt" />
                    <StatBox icon="🎤" value={stats.eventsHosted.toLocaleString('nb-NO')} label="som vert" />
                    <StatBox
                        icon="📅"
                        value={Math.max(...stats.monthlyActivity).toLocaleString('nb-NO')}
                        label="maks per mnd"
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
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-white/90">{label}</p>
        </div>
    );
}

// Summary Section
function SummarySection({ stats, year }: { stats: UserWrappedStats; year: number }) {
    return (
        <section
            className="py-24 px-8 flex justify-center pb-32" // Added extra padding at bottom to ensure coverage
            style={{ background: 'linear-gradient(to top, #312e81, #4c1d95)' }}
        >
            <div className="text-center max-w-lg w-full">
                <div className="bg-white rounded-3xl p-8 text-gray-900 shadow-2xl mb-12">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="text-3xl">Δ</span>
                        <span className="text-xl font-bold">DELTA {year}</span>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-2xl font-black text-gray-800 mb-6">
                            {stats.userName}
                        </h2>

                        <div className="space-y-4 text-left">
                            <SummaryRow
                                icon="🎯"
                                label="Arrangementer"
                                value={stats.totalEventsAttended.toString()}
                            />
                            {stats.favoriteCategory && (
                                <SummaryRow
                                    icon={stats.favoriteCategory.emoji}
                                    label="Favoritt"
                                    value={stats.favoriteCategory.name}
                                />
                            )}
                            <SummaryRow
                                icon="👥"
                                label="Kolleger møtt"
                                value={stats.totalPeopleMetWith.toLocaleString('nb-NO')}
                            />
                        </div>

                        <div className="flex justify-center gap-2 mt-8 pt-6 border-t border-gray-200">
                            {stats.topCategories.slice(0, 3).map((cat) => (
                                <span key={cat.name} className="text-3xl" title={cat.name}>{cat.emoji}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <Link
                        href="/statistikk"
                        className="inline-flex items-center justify-center gap-2 bg-white text-indigo-900 hover:bg-indigo-50 rounded-full px-8 py-4 text-lg font-bold transition-colors shadow-lg"
                    >
                        📊 Se full statistikk
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 text-white hover:text-white/80 underline decoration-white/50 hover:decoration-white transition-all"
                    >
                        ← Tilbake til arrangementer
                    </Link>
                </div>
            </div>
        </section>
    );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 py-2">
            <span className="text-2xl" aria-hidden="true">{icon}</span>
            <span className="text-gray-600 flex-1">{label}</span>
            <span className="font-bold text-lg">{value}</span>
        </div>
    );
}
