"use client";

import { useState, useEffect, useRef } from "react";
import { UserWrappedStats } from "@/service/wrappedActions";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from "@navikt/aksel-icons";

type WrappedClientProps = {
    stats: UserWrappedStats;
    year: number;
};

export default function WrappedClient({ stats, year }: WrappedClientProps) {
    const [currentSection, setCurrentSection] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const sections = [
        { id: "welcome", component: <WelcomeSection stats={stats} year={year} /> },
        { id: "events", component: <TotalEventsSection stats={stats} /> },
        { id: "category", component: <CategorySection stats={stats} /> },
        { id: "attendance", component: <AttendanceSection stats={stats} /> },
        { id: "funfacts", component: <FunFactsSection stats={stats} /> },
        { id: "summary", component: <SummarySection stats={stats} year={year} /> },
    ];

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown" || e.key === " ") {
                e.preventDefault();
                setCurrentSection((prev) => Math.min(prev + 1, sections.length - 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCurrentSection((prev) => Math.max(prev - 1, 0));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [sections.length]);

    // Handle scroll/swipe
    useEffect(() => {
        let touchStartY = 0;
        let lastScrollTime = 0;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const now = Date.now();
            if (now - lastScrollTime < 500) return; // Throttle scrolling

            // Accumulate delta or just check threshold
            if (Math.abs(e.deltaY) > 10) {
                if (e.deltaY > 0) {
                    setCurrentSection((prev) => Math.min(prev + 1, sections.length - 1));
                } else {
                    setCurrentSection((prev) => Math.max(prev - 1, 0));
                }
                lastScrollTime = now;
            }
        };

        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;

            if (Math.abs(diff) > 30) {
                if (diff > 0) {
                    setCurrentSection((prev) => Math.min(prev + 1, sections.length - 1));
                } else {
                    setCurrentSection((prev) => Math.max(prev - 1, 0));
                }
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener("wheel", handleWheel, { passive: false });
            container.addEventListener("touchstart", handleTouchStart);
            container.addEventListener("touchend", handleTouchEnd);
        }

        return () => {
            if (container) {
                container.removeEventListener("wheel", handleWheel);
                container.removeEventListener("touchstart", handleTouchStart);
                container.removeEventListener("touchend", handleTouchEnd);
            }
        };
    }, [sections.length]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 overflow-hidden bg-gray-900"
            style={{
                touchAction: "none",
                zIndex: 9999, // Ensure it's above everything including header/footer
            }}
        >
            {/* Close button */}
            <Link
                href="/"
                className="fixed top-6 left-6 z-[120] p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors"
                aria-label="Lukk"
            >
                <XMarkIcon className="w-6 h-6" />
            </Link>

            {/* Progress indicator */}
            <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[110] flex flex-col gap-2">
                {sections.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSection(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSection
                            ? "bg-white scale-125 shadow-lg"
                            : "bg-white/40 hover:bg-white/60"
                            }`}
                    />
                ))}
            </div>

            {/* Navigation arrows */}
            {currentSection > 0 && (
                <button
                    onClick={() => setCurrentSection((prev) => prev - 1)}
                    className="fixed top-8 left-1/2 -translate-x-1/2 z-[110] p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 animate-bounce"
                >
                    <ChevronUpIcon className="w-8 h-8 text-white" />
                </button>
            )}

            {currentSection < sections.length - 1 && (
                <button
                    onClick={() => setCurrentSection((prev) => prev + 1)}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 animate-bounce"
                >
                    <ChevronDownIcon className="w-8 h-8 text-white" />
                </button>
            )}

            {/* Sections */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSection}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full w-full"
                >
                    {sections[currentSection].component}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// Welcome Section
function WelcomeSection({ stats, year }: { stats: UserWrappedStats; year: number }) {
    return (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8">
            <div className="text-center text-white max-w-2xl">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="text-6xl mb-8"
                >
                    🎉
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-5xl md:text-7xl font-black mb-6"
                >
                    DELTA WRAPPED
                </motion.h1>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-8xl font-black text-white/90 mb-8"
                >
                    {year}
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-2xl md:text-3xl font-medium"
                >
                    Hei, {stats.userFirstName}! 👋
                </motion.p>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-xl mt-4 text-white/80"
                >
                    La oss se på ditt år i Delta...
                </motion.p>
            </div>
        </div>
    );
}

// Total Events Section
function TotalEventsSection({ stats }: { stats: UserWrappedStats }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const target = stats.totalEventsAttended;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [stats.totalEventsAttended]);

    return (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 p-8">
            <div className="text-center text-white max-w-2xl">
                <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl md:text-3xl font-medium mb-4"
                >
                    Du deltok på
                </motion.p>
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    className="relative"
                >
                    <span className="text-[10rem] md:text-[14rem] font-black leading-none">
                        {count}
                    </span>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.5, type: "spring" }}
                        className="absolute -right-4 -top-4 text-6xl"
                    >
                        ✨
                    </motion.div>
                </motion.div>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-2xl md:text-3xl font-medium mt-4"
                >
                    {stats.totalEventsAttended === 1 ? 'arrangement' : 'arrangementer'} i år!
                </motion.p>
                {stats.percentileRank >= 50 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 }}
                        className="mt-8 inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-3"
                    >
                        <span className="text-lg font-medium">
                            Mer enn {stats.percentileRank}% av brukerne! 🔥
                        </span>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// Category Section
function CategorySection({ stats }: { stats: UserWrappedStats }) {
    if (!stats.favoriteCategory) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 p-8">
                <div className="text-center text-white">
                    <p className="text-2xl">Ingen kategorier ennå 🤷</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 p-8">
            <div className="text-center text-white max-w-2xl">
                <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl md:text-3xl font-medium mb-8"
                >
                    Din favoritt-kategori var
                </motion.p>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    className="text-8xl mb-6"
                >
                    {stats.favoriteCategory.emoji}
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-5xl md:text-7xl font-black mb-4"
                >
                    {stats.favoriteCategory.name.toUpperCase()}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-xl md:text-2xl text-white/90"
                >
                    {stats.favoriteCategory.count} arrangementer
                </motion.p>

                {stats.topCategories.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="mt-12 flex justify-center gap-6 flex-wrap"
                    >
                        {stats.topCategories.slice(1).map((cat, i) => (
                            <div key={cat.name} className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4">
                                <span className="text-2xl mr-2">{cat.emoji}</span>
                                <span className="font-semibold">{cat.name}</span>
                                <span className="text-white/70 ml-2">({cat.count})</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// Attendance Type Section
function AttendanceSection({ stats }: { stats: UserWrappedStats }) {
    const { fysisk, digitalt, hybrid } = stats.attendanceBreakdown;
    const total = fysisk + digitalt + hybrid;

    if (total === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8">
                <div className="text-center text-white">
                    <p className="text-2xl">Ingen oppmøte-data 📊</p>
                </div>
            </div>
        );
    }

    const maxType = fysisk >= digitalt && fysisk >= hybrid
        ? 'fysisk'
        : digitalt >= hybrid
            ? 'digitalt'
            : 'hybrid';

    const typeConfig = {
        fysisk: { emoji: '🏢', label: 'På kontoret', color: 'from-emerald-400 to-green-500' },
        digitalt: { emoji: '💻', label: 'Digitalt', color: 'from-blue-400 to-cyan-500' },
        hybrid: { emoji: '🔄', label: 'Hybrid', color: 'from-purple-400 to-pink-500' },
    };

    return (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8">
            <div className="text-center text-white max-w-2xl w-full">
                <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl md:text-3xl font-medium mb-12"
                >
                    Slik deltok du
                </motion.p>

                <div className="space-y-6 px-4">
                    {[
                        { type: 'fysisk' as const, count: fysisk },
                        { type: 'digitalt' as const, count: digitalt },
                        { type: 'hybrid' as const, count: hybrid },
                    ].map(({ type, count }, index) => (
                        <motion.div
                            key={type}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.2 }}
                            className="relative"
                        >
                            <div className="flex items-center gap-4 mb-2">
                                <span className="text-3xl">{typeConfig[type].emoji}</span>
                                <span className="text-lg font-medium flex-1 text-left">{typeConfig[type].label}</span>
                                <span className="text-2xl font-bold">{count}</span>
                            </div>
                            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                                    transition={{ delay: 0.6 + index * 0.2, duration: 0.8, ease: "easeOut" }}
                                    className={`h-full bg-gradient-to-r ${typeConfig[type].color} rounded-full`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-12 bg-white/20 backdrop-blur-sm rounded-2xl p-6 inline-block"
                >
                    <span className="text-4xl mr-3">{typeConfig[maxType].emoji}</span>
                    <span className="text-xl font-medium">
                        Du er en {typeConfig[maxType].label.toLowerCase()}-entusiast!
                    </span>
                </motion.div>
            </div>
        </div>
    );
}

// Fun Facts Section
function FunFactsSection({ stats }: { stats: UserWrappedStats }) {
    const [currentFact, setCurrentFact] = useState(0);

    useEffect(() => {
        if (stats.funFacts.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentFact((prev) => (prev + 1) % stats.funFacts.length);
        }, 4000);

        return () => clearInterval(timer);
    }, [stats.funFacts.length]);

    return (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8">
            <div className="text-center text-white max-w-3xl">
                <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl md:text-3xl font-medium mb-12"
                >
                    Visste du at...
                </motion.p>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentFact}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 md:p-12"
                    >
                        <p className="text-2xl md:text-4xl font-bold leading-relaxed">
                            {stats.funFacts[currentFact] || "Du er fantastisk! 🎉"}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {stats.funFacts.length > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {stats.funFacts.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentFact(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentFact
                                    ? "bg-white w-8"
                                    : "bg-white/40"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    <StatBox icon="👥" value={stats.totalPeopleMetWith} label="kolleger møtt" />
                    <StatBox icon="⏰" value={stats.totalHoursSpent} label="timer" />
                    <StatBox icon="🎤" value={stats.eventsHosted} label="som vert" />
                    <StatBox
                        icon="📅"
                        value={Math.max(...stats.monthlyActivity)}
                        label="maks per mnd"
                    />
                </motion.div>
            </div>
        </div>
    );
}

function StatBox({ icon, value, label }: { icon: string; value: number; label: string }) {
    return (
        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
            <span className="text-2xl">{icon}</span>
            <p className="text-2xl font-bold mt-2">{value}</p>
            <p className="text-sm text-white/80">{label}</p>
        </div>
    );
}

// Summary Section
function SummarySection({ stats, year }: { stats: UserWrappedStats; year: number }) {
    return (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 p-8">
            <div className="text-center text-white max-w-lg w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="bg-white rounded-3xl p-8 text-gray-900 shadow-2xl"
                >
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="text-3xl">Δ</span>
                        <span className="text-xl font-bold">DELTA WRAPPED {year}</span>
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
                                icon="🏆"
                                label="Rangering"
                                value={`Topp ${100 - stats.percentileRank}%`}
                            />
                            <SummaryRow
                                icon="👥"
                                label="Kolleger møtt"
                                value={stats.totalPeopleMetWith.toString()}
                            />
                        </div>

                        <div className="flex justify-center gap-2 mt-8 pt-6 border-t border-gray-200">
                            {stats.topCategories.slice(0, 3).map((cat) => (
                                <span key={cat.name} className="text-3xl">{cat.emoji}</span>
                            ))}
                            {stats.topCategories.length === 0 && (
                                <span className="text-3xl">✨</span>
                            )}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 flex flex-col gap-4"
                >
                    <Link
                        href="/statistikk"
                        className="inline-flex items-center justify-center gap-2 bg-white text-purple-900 hover:bg-gray-100 rounded-full px-8 py-4 text-lg font-bold transition-colors shadow-lg"
                    >
                        📊 Se full statistikk
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 text-white/80 hover:text-white transition-colors"
                    >
                        ← Tilbake til arrangementer
                    </Link>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 text-white/60 text-sm"
                >
                    Takk for at du deltar! 🙌
                </motion.p>
            </div>
        </div>
    );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 py-2">
            <span className="text-2xl">{icon}</span>
            <span className="text-gray-600 flex-1">{label}</span>
            <span className="font-bold text-lg">{value}</span>
        </div>
    );
}
