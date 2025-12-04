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
  mostPopularEvents: MostPopularEvent[];
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

    // Calculate category stats for selected year
    const categoryMap = new Map<string, number>();
    eventsThisYear.forEach(event => {
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

    // Count Fagtorsdag events for selected year
    const fagTorsdagEvents = eventsThisYear.filter(event =>
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
      mostPopularEvents,
      fagTorsdagEvents,
    };
  } catch (error) {
    console.error('Failed to fetch event statistics:', error);
    throw error;
  }
}
