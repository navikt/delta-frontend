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
};

export type CategoryStat = {
  category: string;
  count: number;
  events: CategoryEvent[];
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
};

export type ArrangementTypeStat = {
  type: string;
  count: number;
  events: CategoryEvent[];
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
    // Initialize main categories to ensure they exist even if empty
    categoryEventsMap.set('kompetanse', []);
    categoryEventsMap.set('bedriftidrettslaget', []);
    categoryEventsMap.set('sosialt', []);

    eventsThisYear.forEach(event => {
      event.categories.forEach(cat => {
        const categoryName = cat.name.toLowerCase().trim();

        if (!categoryEventsMap.has(categoryName)) {
          categoryEventsMap.set(categoryName, []);
        }

        const categoryEvent: CategoryEvent = {
          id: event.event.id,
          title: event.event.public ? event.event.title : 'Privat arrangement',
          startTime: event.event.startTime,
          participants: event.participants.length,
          isPublic: event.event.public,
        };
        categoryEventsMap.get(categoryName)?.push(categoryEvent);
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

    const allCategoryStats: CategoryStat[] = Array.from(categoryEventsMap.entries()).map(([name, events]) => ({
      category: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
      count: events.length,
      events: events,
    })).sort((a, b) => b.count - a.count); // Sort by count desc

    const categoryStats: CategoryStat[] = [
      {
        category: 'Kompetanse',
        count: categoryEventsMap.get('kompetanse')?.length || 0,
        events: categoryEventsMap.get('kompetanse') || [],
      },
      {
        category: 'Bedriftidrettslaget',
        count: categoryEventsMap.get('bedriftidrettslaget')?.length || 0,
        events: categoryEventsMap.get('bedriftidrettslaget') || [],
      },
      {
        category: 'Sosialt',
        count: categoryEventsMap.get('sosialt')?.length || 0,
        events: categoryEventsMap.get('sosialt') || [],
      },
    ];

    // Calculate attendance type stats for selected year
    const attendanceTypeMap = new Map<string, number>();
    eventsThisYear.forEach(event => {
      event.categories.forEach(cat => {
        const categoryName = cat.name.toLowerCase().trim();
        if (['fysisk', 'digitalt', 'hybrid'].includes(categoryName)) {
          attendanceTypeMap.set(categoryName, (attendanceTypeMap.get(categoryName) || 0) + 1);
        }
      });
    });

    const attendanceTypeStats: AttendanceTypeStat[] = [
      { type: 'Fysisk', count: attendanceTypeMap.get('fysisk') || 0 },
      { type: 'Digitalt', count: attendanceTypeMap.get('digitalt') || 0 },
      { type: 'Hybrid', count: attendanceTypeMap.get('hybrid') || 0 },
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
    const allCategoriesSet = new Set<string>();

    eventsThisYear.forEach(event => {
      event.categories.forEach(cat => {
        const categoryName = cat.name.toLowerCase().trim();
        allCategoriesSet.add(cat.name); // Collect all unique categories

        // Track Fagtorsdag arrangement type
        if (categoryName === 'fagtorsdag') {
          if (!arrangementTypeEventsMap.has('fagtorsdag')) {
            arrangementTypeEventsMap.set('fagtorsdag', []);
          }
          const categoryEvent: CategoryEvent = {
            id: event.event.id,
            title: event.event.public ? event.event.title : 'Privat arrangement',
            startTime: event.event.startTime,
            participants: event.participants.length,
            isPublic: event.event.public,
          };
          arrangementTypeEventsMap.get('fagtorsdag')?.push(categoryEvent);
        }
      });
    });

    const arrangementTypeStats: ArrangementTypeStat[] = [
      {
        type: 'Fagtorsdag',
        count: arrangementTypeEventsMap.get('fagtorsdag')?.length || 0,
        events: arrangementTypeEventsMap.get('fagtorsdag') || [],
      },
    ];

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
    };
  } catch (error) {
    console.error('Failed to fetch event statistics:', error);
    throw error;
  }
}
