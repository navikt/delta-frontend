import type { DeltaEventWithParticipant } from "@/types/event";
import { notFound } from "next/navigation";
import { getAuthlessApi } from "@/api/instance";
import { getUser } from "@/auth/token";
import { Heading } from "@navikt/ds-react/esm/typography";
import { dates } from "@/components/format";
import { nb } from "date-fns/locale";
import { format } from "date-fns";
import JoinEventButton from "./joinEventButton";
import EventDescription from "./eventDescription";

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
  const [start, end] = dates(event);

  return (
    <div className="w-full flex flex-col align-center items-center">
      <Heading
        size="xlarge"
        className="w-full text-center h-fit bg-blue-200 p-18 pb-24"
      >
        {event.title}
      </Heading>
      <div className="bg-white drop-shadow-lg border-gray-200 border-2 rounded relative w-5/6 top-[-5rem] z-10 flex flex-col p-4 h-fit max-w-[80rem]">
        <div className="flex flex-row w-full justify-between items-start">
          <div className="flex flex-col w-fit bg-red-100 p-2 rounded">
            <span>
              {format(start, "MMMM", { locale: nb }).slice(0, 3).toUpperCase()}
            </span>
            <span className="font-semibold text-3xl">{format(start, "d")}</span>
          </div>
          <JoinEventButton
            event={event}
            user={user}
            participants={participants}
          />
        </div>
        <div className="flex-row flex justify-between gap-36 pt-4">
          <EventDescription event={event} participants={participants} />
          <div className="flex-grow flex flex-col gap-2">
            <Heading size="medium">Detaljer:</Heading>
            <p className="italic">{event.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
