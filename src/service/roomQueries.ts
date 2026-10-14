import "server-only";
import { checkToken } from "@/auth/token";
import { getApi } from "@/api/instance";
import { type Features, NO_FEATURES } from "@/types/room";
import { AxiosError } from "axios";

export async function getFeatures(): Promise<Features> {
  await checkToken();
  const api = await getApi();
  try {
    const response = await api.get<Partial<Features>>("/features");
    return {
      roomBooking: response.data?.roomBooking === true,
      teamsMeeting: response.data?.teamsMeeting === true,
      sharedCalendar: response.data?.sharedCalendar === true,
      peopleSearch: response.data?.peopleSearch === true,
    };
  } catch (error) {
    console.error("Failed to fetch features", { status: error instanceof AxiosError ? error.status : undefined });
    return NO_FEATURES;
  }
}
