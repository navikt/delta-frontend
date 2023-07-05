"use server";

export type DeltaEvent = {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
};

export async function createEvent(formData: FormData) {
  console.log(formData);
  const response = await fetch(
    "https://delta-backend.intern.dev.nav.no/event",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      //TODO:det her er ikke bra nok
      body: JSON.stringify({
        title: formData.get("title")?.toString() ?? "",
        description: formData.get("description")?.toString() ?? "",
        startTime: formData.get("startTime")?.toString() ?? "",
        endTime: formData.get("endTime")?.toString() ?? "",
      } satisfies DeltaEvent),
    }
  );

  console.log(response.status);
}
