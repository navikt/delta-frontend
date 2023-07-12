import type { DeltaEventWithParticipant } from "@/types/event";
import { notFound } from "next/navigation";
import { Event } from "@/components/event";
import { getAuthlessApi } from "@/api/instance";
import { getUser } from "@/auth/token";

export default async function Page({ params }: { params: { id: string } }) {
  const api = getAuthlessApi();
  const response = await api.get(`/event/${params.id}`);
  const user = getUser();

  // Feilhåndtering
  if (response.status === 404) {
    notFound();
  } else if (response.status === 400) {
    return (
      <section className="w-screen flex-grow flex justify-center items-center">
        Uventet feil
      </section>
    );
  } else if (response.status >= 300) {
    return (
      <section className="w-screen flex-grow flex justify-center items-center">
        Uventet feil
      </section>
    );
  }

  const { event, participants }: DeltaEventWithParticipant = response.data;

  return (
    <main className="flex flex-grow">
      <section className="w-screen flex-grow flex justify-center items-center flex-col gap-3">
        <Event event={event} participants={participants} user={user}></Event>
      </section>
    </main>
  );
}
