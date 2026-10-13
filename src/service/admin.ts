import "server-only";

import { getApi } from "@/api/instance";
import { checkToken, isDeltaMaintainer } from "@/auth/token";
import { fetchAllEventsForAdmin } from "@/service/eventActions";
import type { FullDeltaEvent, InviteMode } from "@/types/event";
import { notFound } from "next/navigation";

type AdminStatistics = {
  generatedAt: string;
  eventTypes: {
    inviteMode: InviteMode;
    total: number;
    upcomingOrOngoing: number;
  }[];
};

export async function getAdminStatistics(): Promise<AdminStatistics> {
  await checkAdminAccess();

  const api = await getApi();
  try {
    const response = await api.get<AdminStatistics>("/admin/statistics");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin statistics:", error);
    throw error;
  }
}

export async function getAdminSharedCalendarEvents(): Promise<FullDeltaEvent[]> {
  const events = await fetchAllEventsForAdmin();
  return events.filter(
    ({ event }) => event.public && event.inviteMode === "SHARED",
  );
}

async function checkAdminAccess(): Promise<void> {
  await checkToken("/admin");
  if (!(await isDeltaMaintainer())) notFound();
}
