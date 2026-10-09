import "server-only";

import { getApi } from "@/api/instance";
import { checkToken, isDeltaMaintainer } from "@/auth/token";
import type { InviteMode } from "@/types/event";
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
  await checkToken("/admin");
  if (!(await isDeltaMaintainer())) notFound();

  const api = await getApi();
  try {
    const response = await api.get<AdminStatistics>("/admin/statistics");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin statistics:", error);
    throw error;
  }
}
