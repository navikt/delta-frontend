import type { FullDeltaEvent } from "@/types/event";

export type EventStats = {
  totalEvents: number;
  totalEventsThisYear: number;
  totalParticipants: number;
  uniqueParticipants: number;
  averageParticipants: number;
  averageEventsPerPerson: number;
  medianEventsPerPerson: number;
  categoryStats: CategoryStat[];
  attendanceTypeStats: AttendanceTypeStat[];
  arrangementTypeStats: ArrangementTypeStat[];
  upcomingEvents: number;
  pastEvents: number;
  publicEvents: number;
  privateEvents: number;
  eventsWithLimit: number;
  eventsWithoutLimit: number;
  eventsWithDeadline: number;
  eventsWithoutDeadline: number;
  mostPopularEvents: MostPopularEvent[];
  allCategories: string[];
  medianParticipants: number;
  allCategoryStats: CategoryStat[];
  allEventsThisYear: CategoryEvent[];
  newOrganizersCount: number;
  topOrganizersByEvents: OrganizerStat[];
  topOrganizersByParticipants: OrganizerStat[];
  totalOrganizersCount: number;
};

export type OrganizerStat = {
  name: string;
  count: number;
  uniqueCount?: number;
};

export type CategoryStat = {
  category: string;
  count: number;
  events: CategoryEvent[];
  totalParticipants: number;
  uniqueParticipants: number;
};

export type CategoryEvent = {
  id: string;
  title: string;
  startTime: string;
  participants: number;
  isPublic: boolean;
};

export type AttendanceTypeStat = {
  type: string;
  count: number;
  events: CategoryEvent[];
  totalParticipants: number;
  uniqueParticipants: number;
};

export type ArrangementTypeStat = {
  type: string;
  count: number;
  events: CategoryEvent[];
  totalParticipants: number;
  uniqueParticipants: number;
};

export type MostPopularEvent = {
  title: string;
  participants: number;
  id: string;
};

export function calculateEventStatistics(
  allEvents: FullDeltaEvent[],
  selectedYear: number,
  now = new Date(),
): EventStats {
  return calculateEventStatisticsByYear(allEvents, [selectedYear], now)[selectedYear];
}

export function calculateEventStatisticsByYear(
  allEvents: FullDeltaEvent[],
  years: number[],
  now = new Date(),
): Record<number, EventStats> {
  const eventsByYear = new Map<number, FullDeltaEvent[]>();
  const firstHostYear = new Map<string, number>();
  for (const event of allEvents) {
    const year = new Date(event.event.startTime).getFullYear();
    if (Number.isNaN(year)) continue;
    const yearEvents = eventsByYear.get(year);
    if (yearEvents) yearEvents.push(event);
    else eventsByYear.set(year, [event]);
    for (const host of event.hosts) {
      firstHostYear.set(host.email, Math.min(firstHostYear.get(host.email) ?? year, year));
    }
  }
  return Object.fromEntries(years.map(year => [year, calculateYearStatistics(
    eventsByYear.get(year) ?? [], allEvents.length, firstHostYear, year, now,
  )]));
}

function calculateYearStatistics(
  eventsThisYear: FullDeltaEvent[],
  totalEvents: number,
  firstHostYear: Map<string, number>,
  selectedYear: number,
  now: Date,
): EventStats {
  try {
    // Create list of all events this year for the overview modal
    const allEventsThisYear: CategoryEvent[] = eventsThisYear.map(event => ({
      id: event.event.id,
      title: event.event.public ? event.event.title : 'Privat arrangement',
      startTime: event.event.startTime,
      participants: event.participants.length,
      isPublic: event.event.public,
    }));

    // Calculate total participants for selected year
    const totalParticipants = eventsThisYear.reduce((sum, event) =>
      sum + event.participants.length, 0
    );

    // Calculate average participants for selected year
    const averageParticipants = eventsThisYear.length > 0
      ? Math.round(totalParticipants / eventsThisYear.length)
      : 0;

    // Calculate median participants for selected year
    let medianParticipants = 0;
    if (eventsThisYear.length > 0) {
      const sortedParticipants = eventsThisYear.map(e => e.participants.length).sort((a, b) => a - b);
      const mid = Math.floor(sortedParticipants.length / 2);
      medianParticipants = sortedParticipants.length % 2 !== 0
        ? sortedParticipants[mid]
        : (sortedParticipants[mid - 1] + sortedParticipants[mid]) / 2;
    }

    // Calculate category stats for selected year
    const categoryEventsMap = new Map<string, CategoryEvent[]>();
    const categoryParticipantsMap = new Map<string, Set<string>>();
    const allCategoriesSet = new Set<string>();
    // Initialize main categories to ensure they exist even if empty
    categoryEventsMap.set('kompetanse', []);
    categoryEventsMap.set('bedriftidrettslaget', []);
    categoryEventsMap.set('sosialt', []);
    categoryParticipantsMap.set('kompetanse', new Set());
    categoryParticipantsMap.set('bedriftidrettslaget', new Set());
    categoryParticipantsMap.set('sosialt', new Set());

    eventsThisYear.forEach((event, index) => {
      event.categories.forEach(cat => {
        const categoryName = cat.name.toLowerCase().trim();
        allCategoriesSet.add(cat.name);

        if (!categoryEventsMap.has(categoryName)) {
          categoryEventsMap.set(categoryName, []);
          categoryParticipantsMap.set(categoryName, new Set());
        }

        categoryEventsMap.get(categoryName)?.push(allEventsThisYear[index]);

        // Track unique participants per category
        event.participants.forEach(participant => {
          categoryParticipantsMap.get(categoryName)?.add(participant.email);
        });
      });
    });

    // Calculate unique participants for selected year and count events per person
    const participantEventCount = new Map<string, number>();
    eventsThisYear.forEach(event => {
      event.participants.forEach(participant => {
        const count = participantEventCount.get(participant.email) || 0;
        participantEventCount.set(participant.email, count + 1);
      });
    });
    const uniqueParticipants = participantEventCount.size;

    // Calculate average and median events per person
    let averageEventsPerPerson = 0;
    let medianEventsPerPerson = 0;
    if (uniqueParticipants > 0) {
      const eventCounts = Array.from(participantEventCount.values());
      averageEventsPerPerson = Math.round((eventCounts.reduce((sum, count) => sum + count, 0) / uniqueParticipants) * 10) / 10;

      const sortedCounts = [...eventCounts].sort((a, b) => a - b);
      const mid = Math.floor(sortedCounts.length / 2);
      medianEventsPerPerson = sortedCounts.length % 2 !== 0
        ? sortedCounts[mid]
        : (sortedCounts[mid - 1] + sortedCounts[mid]) / 2;
    }

    const allCategoryStats: CategoryStat[] = Array.from(categoryEventsMap.entries()).map(([name, events]) => {
      const totalParticipants = events.reduce((sum, e) => sum + e.participants, 0);
      const uniqueParticipants = categoryParticipantsMap.get(name)?.size || 0;
      return {
        category: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
        count: events.length,
        events: events,
        totalParticipants,
        uniqueParticipants,
      };
    }).sort((a, b) => b.count - a.count); // Sort by count desc

    const categoryStats: CategoryStat[] = [
      {
        category: 'Kompetanse',
        count: categoryEventsMap.get('kompetanse')?.length || 0,
        events: categoryEventsMap.get('kompetanse') || [],
        totalParticipants: (categoryEventsMap.get('kompetanse') || []).reduce((sum, e) => sum + e.participants, 0),
        uniqueParticipants: categoryParticipantsMap.get('kompetanse')?.size || 0,
      },
      {
        category: 'Bedriftidrettslaget',
        count: categoryEventsMap.get('bedriftidrettslaget')?.length || 0,
        events: categoryEventsMap.get('bedriftidrettslaget') || [],
        totalParticipants: (categoryEventsMap.get('bedriftidrettslaget') || []).reduce((sum, e) => sum + e.participants, 0),
        uniqueParticipants: categoryParticipantsMap.get('bedriftidrettslaget')?.size || 0,
      },
      {
        category: 'Sosialt',
        count: categoryEventsMap.get('sosialt')?.length || 0,
        events: categoryEventsMap.get('sosialt') || [],
        totalParticipants: (categoryEventsMap.get('sosialt') || []).reduce((sum, e) => sum + e.participants, 0),
        uniqueParticipants: categoryParticipantsMap.get('sosialt')?.size || 0,
      },
    ];

    const categoryTotals = (name: string) => {
      const events = categoryEventsMap.get(name) ?? [];
      return {
        count: events.length,
        events,
        totalParticipants: events.reduce((sum, event) => sum + event.participants, 0),
        uniqueParticipants: categoryParticipantsMap.get(name)?.size ?? 0,
      };
    };
    const attendanceTypeStats: AttendanceTypeStat[] = ['Fysisk', 'Digitalt', 'Hybrid']
      .map(type => ({ type, ...categoryTotals(type.toLowerCase()) }));

    // Count upcoming and past events for selected year
    const upcomingEvents = eventsThisYear.filter(event =>
      new Date(event.event.startTime) > now
    ).length;

    const pastEvents = eventsThisYear.length - upcomingEvents;

    // Count public and private events for selected year
    const publicEvents = eventsThisYear.filter(event => event.event.public).length;
    const privateEvents = eventsThisYear.length - publicEvents;

    // Count events with/without participant limit for selected year
    const eventsWithLimit = eventsThisYear.filter(event =>
      event.event.participantLimit > 0
    ).length;
    const eventsWithoutLimit = eventsThisYear.length - eventsWithLimit;

    // Count events with/without signup deadline for selected year
    const eventsWithDeadline = eventsThisYear.filter(event =>
      event.event.signupDeadline && event.event.signupDeadline.trim() !== ''
    ).length;
    const eventsWithoutDeadline = eventsThisYear.length - eventsWithDeadline;

    // Find top 3 most popular events for selected year, hide private event details
    const mostPopularEvents: MostPopularEvent[] = [];
    if (eventsThisYear.length > 0) {
      const sortedByParticipants = [...eventsThisYear].sort((a, b) =>
        b.participants.length - a.participants.length
      );
      const topEvents = sortedByParticipants.slice(0, 3);
      mostPopularEvents.push(...topEvents.map(event => ({
        title: event.event.public ? event.event.title : 'Privat arrangement',
        participants: event.participants.length,
        id: event.event.public ? event.event.id : '',
      })));
    }

    const arrangementTypeStats: ArrangementTypeStat[] = [
      { type: 'Fagtorsdag', ...categoryTotals('fagtorsdag') },
    ];

    // --- New Statistics Implementations ---

    const thisYearHosts = new Set<string>();
    eventsThisYear.forEach(event => {
      event.hosts.forEach(host => thisYearHosts.add(host.email));
    });

    let newOrganizersCount = 0;
    thisYearHosts.forEach(hostEmail => {
      if (firstHostYear.get(hostEmail) === selectedYear) {
        newOrganizersCount++;
      }
    });

    // 2. Top Organizers by Events
    const organizersByEventCount = new Map<string, { count: number; name: string }>();
    eventsThisYear.forEach(event => {
      event.hosts.forEach(host => {
        const currentData = organizersByEventCount.get(host.email) || { count: 0, name: host.name };
        organizersByEventCount.set(host.email, { count: currentData.count + 1, name: host.name });
      });
    });

    const topOrganizersByEvents = Array.from(organizersByEventCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. Top Organizers by Participants
    const organizersByParticipantCount = new Map<string, { count: number; uniqueParticipants: Set<string>; name: string }>();
    eventsThisYear.forEach(event => {
      event.hosts.forEach(host => {
        const currentData = organizersByParticipantCount.get(host.email) || { count: 0, uniqueParticipants: new Set<string>(), name: host.name };

        // Add total participant count for this event
        currentData.count += event.participants.length;

        // Add unique participants for this event
        event.participants.forEach(p => currentData.uniqueParticipants.add(p.email));

        organizersByParticipantCount.set(host.email, currentData);
      });
    });

    const topOrganizersByParticipants = Array.from(organizersByParticipantCount.values())
      .map(data => ({
        name: data.name,
        count: data.count,
        uniqueCount: data.uniqueParticipants.size
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const allCategories = Array.from(allCategoriesSet).sort();

    return {
      totalEvents,
      totalEventsThisYear: eventsThisYear.length,
      totalParticipants,
      uniqueParticipants,
      averageParticipants,
      averageEventsPerPerson,
      medianEventsPerPerson,
      categoryStats,
      attendanceTypeStats,
      arrangementTypeStats,
      upcomingEvents,
      pastEvents,
      publicEvents,
      privateEvents,
      eventsWithLimit,
      eventsWithoutLimit,
      eventsWithDeadline,
      eventsWithoutDeadline,
      mostPopularEvents,
      allCategories,
      medianParticipants,
      allCategoryStats,
      allEventsThisYear,
      newOrganizersCount,
      topOrganizersByEvents,
      topOrganizersByParticipants,
      totalOrganizersCount: thisYearHosts.size,
    };
  } catch (error) {
    console.error('Failed to fetch event statistics:', error);
    throw error;
  }
}
