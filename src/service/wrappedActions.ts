"use server";

import { getEvents } from "./eventActions";
import { getUser } from "@/auth/token";
import { FullDeltaEvent } from "@/types/event";

export type UserWrappedStats = {
    userName: string;
    userFirstName: string;
    totalEventsAttended: number;
    percentileRank: number;
    favoriteCategory: { name: string; count: number; emoji: string } | null;
    attendanceBreakdown: { fysisk: number; digitalt: number; hybrid: number };
    firstEventOfYear: { title: string; date: string; id: string } | null;
    biggestEvent: { title: string; participants: number; id: string } | null;
    totalPeopleMetWith: number;
    monthlyActivity: number[];
    funFacts: string[];
    topCategories: { name: string; count: number; emoji: string }[];
    totalHoursSpent: number;
    eventsHosted: number;
    attendedEvents: {
        id: string;
        title: string;
        date: string;
        emoji: string;
        isPublic: boolean;
    }[];
};

const categoryEmojis: Record<string, string> = {
    'kompetanse': '💡',
    'sosialt': '🎉',
    'bedriftidrettslaget': '🏃',
    'fysisk': '🏢',
    'digitalt': '💻',
    'hybrid': '🔄',
    'fagtorsdag': '📚',
    'default': '✨'
};

function getEmoji(category: string): string {
    return categoryEmojis[category.toLowerCase()] || categoryEmojis['default'];
}

export async function getUserWrappedStats(year?: number): Promise<UserWrappedStats | null> {
    try {
        const user = await getUser();
        const allEvents = await getEvents({ onlyJoined: true });

        const now = new Date();
        const selectedYear = year ?? now.getFullYear();

        // Filter events for selected year that the user participated in
        const userEventsThisYear = allEvents.filter(event => {
            const eventDate = new Date(event.event.startTime);
            return eventDate.getFullYear() === selectedYear;
        });

        // If user has no events, return minimal stats
        if (userEventsThisYear.length === 0) {
            return {
                userName: `${user.firstName} ${user.lastName}`,
                userFirstName: user.firstName,
                totalEventsAttended: 0,
                percentileRank: 100,
                favoriteCategory: null,
                attendanceBreakdown: { fysisk: 0, digitalt: 0, hybrid: 0 },
                firstEventOfYear: null,
                biggestEvent: null,
                totalPeopleMetWith: 0,
                monthlyActivity: Array(12).fill(0),
                funFacts: ["Det er aldri for sent å delta! 🚀"],
                topCategories: [],
                totalHoursSpent: 0,
                eventsHosted: 0,
                attendedEvents: [],
            };
        }

        // Calculate category stats
        const categoryCount = new Map<string, number>();
        const attendanceCount = { fysisk: 0, digitalt: 0, hybrid: 0 };
        const monthlyActivity = Array(12).fill(0);
        const uniquePeople = new Set<string>();
        let eventsHosted = 0;


        userEventsThisYear.forEach(event => {
            // Count monthly activity
            const month = new Date(event.event.startTime).getMonth();
            monthlyActivity[month]++;

            // Count unique people met
            event.participants.forEach(p => {
                if (p.email !== user.email) {
                    uniquePeople.add(p.email);
                }
            });
            event.hosts.forEach(h => {
                if (h.email !== user.email) {
                    uniquePeople.add(h.email);
                }
            });

            // Check if user was host
            if (event.hosts.some(h => h.email === user.email)) {
                eventsHosted++;
            }

            // Count categories
            event.categories.forEach(cat => {
                const categoryName = cat.name.toLowerCase().trim();

                // Track attendance type
                if (categoryName === 'fysisk') attendanceCount.fysisk++;
                else if (categoryName === 'digitalt') attendanceCount.digitalt++;
                else if (categoryName === 'hybrid') attendanceCount.hybrid++;

                // Track all categories
                if (!['fysisk', 'digitalt', 'hybrid'].includes(categoryName)) {
                    categoryCount.set(categoryName, (categoryCount.get(categoryName) || 0) + 1);
                }
            });
        });

        // Find favorite category
        const categoriesArray = Array.from(categoryCount.entries());
        const sortedCategories = categoriesArray.sort((a, b) => b[1] - a[1]);
        const topCat = sortedCategories[0];

        const favoriteCategory = topCat ? {
            name: topCat[0].charAt(0).toUpperCase() + topCat[0].slice(1),
            count: topCat[1],
            emoji: getEmoji(topCat[0])
        } : null;

        // Get top 3 categories
        const topCategories = Array.from(categoryCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                count,
                emoji: getEmoji(name)
            }));

        // Find first event of year
        const sortedByDate = [...userEventsThisYear].sort(
            (a, b) => new Date(a.event.startTime).getTime() - new Date(b.event.startTime).getTime()
        );
        const firstEvent = sortedByDate[0];
        const firstEventOfYear = firstEvent ? {
            title: firstEvent.event.public ? firstEvent.event.title : 'Privat arrangement',
            date: firstEvent.event.startTime,
            id: firstEvent.event.public ? firstEvent.event.id : '',
        } : null;

        // Find biggest event attended
        const sortedByParticipants = [...userEventsThisYear].sort(
            (a, b) => b.participants.length - a.participants.length
        );
        const biggestEventData = sortedByParticipants[0];
        const biggestEvent = biggestEventData ? {
            title: biggestEventData.event.public ? biggestEventData.event.title : 'Privat arrangement',
            participants: biggestEventData.participants.length,
            id: biggestEventData.event.public ? biggestEventData.event.id : '',
        } : null;

        // Calculate percentile (get all events to compare)
        const allEventsEver = await getEvents({});
        const eventsThisYearAll = allEventsEver.filter(event => {
            const eventDate = new Date(event.event.startTime);
            return eventDate.getFullYear() === selectedYear;
        });

        // Count participation per person
        const participationCount = new Map<string, number>();
        eventsThisYearAll.forEach(event => {
            event.participants.forEach(p => {
                participationCount.set(p.email, (participationCount.get(p.email) || 0) + 1);
            });
        });

        // Calculate percentile
        const userCount = userEventsThisYear.length;
        const allCounts = Array.from(participationCount.values());
        const peopleWithLessEvents = allCounts.filter(c => c < userCount).length;
        const percentileRank = allCounts.length > 0
            ? Math.round((peopleWithLessEvents / allCounts.length) * 100)
            : 50;

        // Estimate total hours (assume average 2 hours per event)
        const totalHoursSpent = userEventsThisYear.reduce((total, event) => {
            const start = new Date(event.event.startTime);
            const end = new Date(event.event.endTime);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return total + Math.max(0.5, Math.min(hours, 8)); // Cap between 0.5 and 8 hours
        }, 0);

        // Generate fun facts
        const funFacts = generateFunFacts({
            totalEvents: userEventsThisYear.length,
            eventsHosted,
            favoriteCategory: favoriteCategory?.name || null,
            attendanceBreakdown: attendanceCount,
            percentileRank,
            uniquePeople: uniquePeople.size,
            monthlyActivity,
            biggestEvent,
            totalHoursSpent,
            firstEventOfYear
        });

        return {
            userName: `${user.firstName} ${user.lastName}`,
            userFirstName: user.firstName,
            totalEventsAttended: userEventsThisYear.length,
            percentileRank,
            favoriteCategory,
            attendanceBreakdown: attendanceCount,
            firstEventOfYear,
            biggestEvent,
            totalPeopleMetWith: uniquePeople.size,
            monthlyActivity,
            funFacts,
            topCategories,
            totalHoursSpent: Math.round(totalHoursSpent),
            eventsHosted,
            attendedEvents: userEventsThisYear.map(e => {
                // Determine main category/emoji
                let emoji = '✨';
                const eventCategories = e.categories.map(c => c.name.toLowerCase());
                if (eventCategories.includes('kompetanse')) emoji = getEmoji('kompetanse');
                else if (eventCategories.includes('sosialt')) emoji = getEmoji('sosialt');
                else if (eventCategories.includes('bedriftidrettslaget')) emoji = getEmoji('bedriftidrettslaget');

                return {
                    id: e.event.id,
                    title: e.event.public ? e.event.title : 'Privat arrangement',
                    date: e.event.startTime,
                    emoji,
                    isPublic: e.event.public
                };
            }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        };
    } catch (error) {
        console.error('Failed to fetch user wrapped stats:', error);
        return null;
    }
}

function generateFunFacts(data: {
    totalEvents: number;
    eventsHosted: number;
    favoriteCategory: string | null;
    attendanceBreakdown: { fysisk: number; digitalt: number; hybrid: number };
    percentileRank: number;
    uniquePeople: number;
    monthlyActivity: number[];
    biggestEvent: { title: string; participants: number } | null;
    totalHoursSpent: number;
    firstEventOfYear: { title: string; date: string } | null;
}): string[] {
    const facts: string[] = [];

    // Percentile fact - REMOVED per user request
    // if (data.percentileRank >= 90) {
    //     facts.push(`Du er blant topp ${100 - data.percentileRank}% av alle deltakere! 🏆`);
    // } else if (data.percentileRank >= 75) {
    //     facts.push(`Du er mer aktiv enn ${data.percentileRank}% av brukerne! 🌟`);
    // }

    // Hosting fact
    if (data.eventsHosted > 0) {
        facts.push(`Du var vert for ${data.eventsHosted} arrangement${data.eventsHosted > 1 ? 'er' : ''}! 🎤`);
    }

    // First event of the year (Replaces duplicate "People met" fact)
    if (data.firstEventOfYear) {
        facts.push(`Du startet året med "${data.firstEventOfYear.title}"!`);
    }

    // Attendance type
    const { fysisk, digitalt, hybrid } = data.attendanceBreakdown;
    const total = fysisk + digitalt + hybrid;
    if (total > 0) {
        if (fysisk > digitalt && fysisk > hybrid) {
            facts.push(`Du foretrekker fysiske møter – ${Math.round((fysisk / total) * 100)}% var på kontoret! 🏢`);
        } else if (digitalt > fysisk && digitalt > hybrid) {
            facts.push(`Digital-entusiast! ${Math.round((digitalt / total) * 100)}% av arrangementene var virtuelle 💻`);
        }
    }

    // Most active month
    const maxMonth = Math.max(...data.monthlyActivity);
    const mostActiveMonth = data.monthlyActivity.indexOf(maxMonth);
    const monthNames = ['januar', 'februar', 'mars', 'april', 'mai', 'juni',
        'juli', 'august', 'september', 'oktober', 'november', 'desember'];
    if (maxMonth > 0) {
        facts.push(`Din mest aktive måned var ${monthNames[mostActiveMonth]} med ${maxMonth} arrangementer! 📅`);
    }

    // Hours spent
    if (data.totalHoursSpent >= 50) {
        facts.push(`Du brukte ${Math.round(data.totalHoursSpent)} timer på arrangementer – det er ${Math.round(data.totalHoursSpent / 8)} arbeidsdager! ⏰`);
    }

    // Biggest event
    if (data.biggestEvent && data.biggestEvent.participants >= 50) {
        facts.push(`Du var med på et arrangement med ${data.biggestEvent.participants} deltakere!`);
    }

    // Shuffle and return top 3-4 facts
    return facts.sort(() => Math.random() - 0.5).slice(0, 4);
}
