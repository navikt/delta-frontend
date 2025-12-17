"use server";

import { getApi } from "@/api/instance";
import { FullDeltaEvent } from "@/types/event";
import { getEvents } from "./eventActions";

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

export async function getEventStatistics(year?: number): Promise<EventStats> {
  try {
    // Fetch all events
    const allEvents = await getEvents({});

    const now = new Date();
    const selectedYear = year ?? now.getFullYear();

    // Filter events for selected year
    const eventsThisYear = allEvents.filter(event => {
      const eventDate = new Date(event.event.startTime);
      return eventDate.getFullYear() === selectedYear;
    });

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
    // Initialize main categories to ensure they exist even if empty
    categoryEventsMap.set('kompetanse', []);
    categoryEventsMap.set('bedriftidrettslaget', []);
    categoryEventsMap.set('sosialt', []);
    categoryParticipantsMap.set('kompetanse', new Set());
    categoryParticipantsMap.set('bedriftidrettslaget', new Set());
    categoryParticipantsMap.set('sosialt', new Set());

    eventsThisYear.forEach(event => {
      event.categories.forEach(cat => {
        const categoryName = cat.name.toLowerCase().trim();

        if (!categoryEventsMap.has(categoryName)) {
          categoryEventsMap.set(categoryName, []);
          categoryParticipantsMap.set(categoryName, new Set());
        }

        const categoryEvent: CategoryEvent = {
          id: event.event.id,
          title: event.event.public ? event.event.title : 'Privat arrangement',
          startTime: event.event.startTime,
          participants: event.participants.length,
          isPublic: event.event.public,
        };
        categoryEventsMap.get(categoryName)?.push(categoryEvent);

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

    // Calculate attendance type stats for selected year
    const attendanceTypeEventsMap = new Map<string, CategoryEvent[]>();
    const attendanceTypeParticipantsMap = new Map<string, Set<string>>();
    attendanceTypeEventsMap.set('fysisk', []);
    attendanceTypeEventsMap.set('digitalt', []);
    attendanceTypeEventsMap.set('hybrid', []);
    attendanceTypeParticipantsMap.set('fysisk', new Set());
    attendanceTypeParticipantsMap.set('digitalt', new Set());
    attendanceTypeParticipantsMap.set('hybrid', new Set());

    eventsThisYear.forEach(event => {
      event.categories.forEach(cat => {
        const categoryName = cat.name.toLowerCase().trim();
        if (['fysisk', 'digitalt', 'hybrid'].includes(categoryName)) {
          const categoryEvent: CategoryEvent = {
            id: event.event.id,
            title: event.event.public ? event.event.title : 'Privat arrangement',
            startTime: event.event.startTime,
            participants: event.participants.length,
            isPublic: event.event.public,
          };
          attendanceTypeEventsMap.get(categoryName)?.push(categoryEvent);

          // Track unique participants per attendance type
          event.participants.forEach(participant => {
            attendanceTypeParticipantsMap.get(categoryName)?.add(participant.email);
          });
        }
      });
    });

    const attendanceTypeStats: AttendanceTypeStat[] = [
      {
        type: 'Fysisk',
        count: attendanceTypeEventsMap.get('fysisk')?.length || 0,
        events: attendanceTypeEventsMap.get('fysisk') || [],
        totalParticipants: (attendanceTypeEventsMap.get('fysisk') || []).reduce((sum, e) => sum + e.participants, 0),
        uniqueParticipants: attendanceTypeParticipantsMap.get('fysisk')?.size || 0,
      },
      {
        type: 'Digitalt',
        count: attendanceTypeEventsMap.get('digitalt')?.length || 0,
        events: attendanceTypeEventsMap.get('digitalt') || [],
        totalParticipants: (attendanceTypeEventsMap.get('digitalt') || []).reduce((sum, e) => sum + e.participants, 0),
        uniqueParticipants: attendanceTypeParticipantsMap.get('digitalt')?.size || 0,
      },
      {
        type: 'Hybrid',
        count: attendanceTypeEventsMap.get('hybrid')?.length || 0,
        events: attendanceTypeEventsMap.get('hybrid') || [],
        totalParticipants: (attendanceTypeEventsMap.get('hybrid') || []).reduce((sum, e) => sum + e.participants, 0),
        uniqueParticipants: attendanceTypeParticipantsMap.get('hybrid')?.size || 0,
      },
    ];

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

    // Calculate arrangement type stats for selected year
    const arrangementTypeEventsMap = new Map<string, CategoryEvent[]>();
    const arrangementTypeParticipantsMap = new Map<string, Set<string>>();
    const allCategoriesSet = new Set<string>();

    eventsThisYear.forEach(event => {
      event.categories.forEach(cat => {
        const categoryName = cat.name.toLowerCase().trim();
        allCategoriesSet.add(cat.name); // Collect all unique categories

        // Track Fagtorsdag arrangement type
        if (categoryName === 'fagtorsdag') {
          if (!arrangementTypeEventsMap.has('fagtorsdag')) {
            arrangementTypeEventsMap.set('fagtorsdag', []);
            arrangementTypeParticipantsMap.set('fagtorsdag', new Set());
          }
          const categoryEvent: CategoryEvent = {
            id: event.event.id,
            title: event.event.public ? event.event.title : 'Privat arrangement',
            startTime: event.event.startTime,
            participants: event.participants.length,
            isPublic: event.event.public,
          };
          arrangementTypeEventsMap.get('fagtorsdag')?.push(categoryEvent);

          // Track unique participants
          event.participants.forEach(participant => {
            arrangementTypeParticipantsMap.get('fagtorsdag')?.add(participant.email);
          });
        }
      });
    });

    const arrangementTypeStats: ArrangementTypeStat[] = [
      {
        type: 'Fagtorsdag',
        count: arrangementTypeEventsMap.get('fagtorsdag')?.length || 0,
        events: arrangementTypeEventsMap.get('fagtorsdag') || [],
        totalParticipants: (arrangementTypeEventsMap.get('fagtorsdag') || []).reduce((sum, e) => sum + e.participants, 0),
        uniqueParticipants: arrangementTypeParticipantsMap.get('fagtorsdag')?.size || 0,
      },
    ];

    // --- New Statistics Implementations ---

    // 1. New Organizers Calculation
    const previousYearsHosts = new Set<string>();
    allEvents.forEach(event => {
      const eventYear = new Date(event.event.startTime).getFullYear();
      if (eventYear < selectedYear) {
        event.hosts.forEach(host => previousYearsHosts.add(host.email));
      }
    });

    const thisYearHosts = new Set<string>();
    eventsThisYear.forEach(event => {
      event.hosts.forEach(host => thisYearHosts.add(host.email));
    });

    let newOrganizersCount = 0;
    thisYearHosts.forEach(hostEmail => {
      if (!previousYearsHosts.has(hostEmail)) {
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
      totalEvents: allEvents.length,
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
