"use server";

import { getApi } from "@/api/instance";
import { FullDeltaEvent } from "@/types/event";
import { getEvents } from "./eventActions";

export type EventStats = {
  totalEvents: number;
  totalEventsThisYear: number;
  totalParticipants: number;
  averageParticipants: number;
  categoryStats: CategoryStat[];
  attendanceTypeStats: AttendanceTypeStat[];
  upcomingEvents: number;
  pastEvents: number;
  publicEvents: number;
  privateEvents: number;
  eventsWithLimit: number;
  eventsWithoutLimit: number;
  mostPopularEvent: MostPopularEvent | null;
  fagTorsdagEvents: number;
};

export type CategoryStat = {
  category: string;
  count: number;
};

export type AttendanceTypeStat = {
  type: string;
  count: number;
};

export type MostPopularEvent = {
  title: string;
  participants: number;
  id: string;
};

export async function getEventStatistics(): Promise<EventStats> {
  try {
    // Fetch all events
    const allEvents = await getEvents({});

    const now = new Date();
    const currentYear = now.getFullYear();

    // Filter events for this year
    const eventsThisYear = allEvents.filter(event => {
      const eventDate = new Date(event.event.startTime);
      return eventDate.getFullYear() === currentYear;
    });

    // Calculate total participants
    const totalParticipants = allEvents.reduce((sum, event) =>
      sum + event.participants.length, 0
    );

    // Calculate average participants
    const averageParticipants = allEvents.length > 0
      ? Math.round(totalParticipants / allEvents.length)
      : 0;

    // Calculate category stats
    const categoryMap = new Map<string, number>();
    allEvents.forEach(event => {
      event.categories.forEach(cat => {
        const categoryName = cat.name.toLowerCase().trim();
        // Only count main categories
        if (['kompetanse', 'bedriftidrettslaget', 'sosialt'].includes(categoryName)) {
          categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
        }
      });
    });

    const categoryStats: CategoryStat[] = [
      { category: 'Kompetanse', count: categoryMap.get('kompetanse') || 0 },
      { category: 'Bedriftidrettslaget', count: categoryMap.get('bedriftidrettslaget') || 0 },
      { category: 'Sosialt', count: categoryMap.get('sosialt') || 0 },
    ];

    // Calculate attendance type stats
    const attendanceTypeMap = new Map<string, number>();
    allEvents.forEach(event => {
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

    // Count upcoming and past events
    const upcomingEvents = allEvents.filter(event =>
      new Date(event.event.startTime) > now
    ).length;

    const pastEvents = allEvents.length - upcomingEvents;

    // Count public and private events
    const publicEvents = allEvents.filter(event => event.event.public).length;
    const privateEvents = allEvents.length - publicEvents;

    // Count events with/without participant limit
    const eventsWithLimit = allEvents.filter(event =>
      event.event.participantLimit > 0
    ).length;
    const eventsWithoutLimit = allEvents.length - eventsWithLimit;

    // Find most popular event
    let mostPopularEvent: MostPopularEvent | null = null;
    if (allEvents.length > 0) {
      const sortedByParticipants = [...allEvents].sort((a, b) =>
        b.participants.length - a.participants.length
      );
      const topEvent = sortedByParticipants[0];
      mostPopularEvent = {
        title: topEvent.event.title,
        participants: topEvent.participants.length,
        id: topEvent.event.id,
      };
    }

    // Count Fagtorsdag events
    const fagTorsdagEvents = allEvents.filter(event =>
      event.categories.some(cat => cat.name.toLowerCase().trim() === 'fagtorsdag')
    ).length;

    return {
      totalEvents: allEvents.length,
      totalEventsThisYear: eventsThisYear.length,
      totalParticipants,
      averageParticipants,
      categoryStats,
      attendanceTypeStats,
      upcomingEvents,
      pastEvents,
      publicEvents,
      privateEvents,
      eventsWithLimit,
      eventsWithoutLimit,
      mostPopularEvent,
      fagTorsdagEvents,
    };
  } catch (error) {
    console.error('Failed to fetch event statistics:', error);
    throw error;
  }
}
