"use server";

import { getAuthApi } from "@/api/instance";
import { redirect } from "next/navigation";

export async function createEvent(formData: FormData) {
  console.log(`${Date.now()}: createEvent`);
  const api = await getAuthApi();
  console.log(`${Date.now()}: got auth api`);

  const response = await api.put("/admin/event", {
    title: getFormDataString(formData, "title"),
    description: getFormDataString(formData, "description"),
    location: getFormDataString(formData, "location"),
    startTime: `${formatDate(
      getFormDataString(formData, "startDate")
    )}T${getFormDataString(formData, "startTime")}:00`,
    endTime: `${formatDate(
      getFormDataString(formData, "endDate")
    )}T${getFormDataString(formData, "endTime")}:00`,
  });
  console.log(`${Date.now()}: got response`);
  redirect(`/event/${response.data.id}`);
}

function getFormDataString(formData: FormData, key: string): string {
  return formData.get(key)?.toString() ?? "";
}

/**
 * Converts a date on the format dd.mm.yyyy to yyyy-mm-dd
 * @param date string on the format dd.mm.yyyy
 * @returns string on the format yyyy-mm-dd
 */
function formatDate(date: string): string {
  const [day, month, year] = date.split(".").map((s) => parseInt(s));
  return `${year.toString().padStart(4, "0")}-${month
    .toString()
    .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}
