"use server";

type DeltaEvent = {
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
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
        startTime: formData.get("startTime"),
        endTime: formData.get("endTime"),
      } satisfies DeltaEvent),
    }
  );

  console.log(response.status);
}
