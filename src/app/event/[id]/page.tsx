import type { FullDeltaEvent } from "@/types/event";
import { checkToken, getUser } from "@/auth/token";
import EventDetails from "./eventDetails";
import CardWithBackground from "@/components/cardWithBackground";
import { getEvent } from "@/service/eventActions";
import { Metadata, ResolvingMetadata } from "next";
import Head from "next/head";

type EventPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
};

function normalizeSearchParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getSafeReturnTo(returnTo?: string | string[]) {
  const normalizedReturnTo = normalizeSearchParamValue(returnTo);

  if (
    !normalizedReturnTo ||
    !normalizedReturnTo.startsWith("/") ||
    normalizedReturnTo.startsWith("//")
  ) {
    return "/";
  }

  return normalizedReturnTo;
}

async function getOptionalEventFromId(id: string) {
  try {
    const { event }: FullDeltaEvent = await getEvent(id);
    return event;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata(
  { params }: EventPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  const event = await getOptionalEventFromId(id);
  if (!event) {
    return {
      title: "Delta Δ"
    };
  }

  return {
    title: `${event.title} Δ Delta`,
  };
}

export default async function Page({ params, searchParams }: EventPageProps) {
  const { id } = await params;
  const { returnTo } = await searchParams;
  await checkToken(`/event/${id}`);
  const hostname = process.env.NEXT_PUBLIC_HOSTNAME;
  const backLink = getSafeReturnTo(returnTo);

  const user = await getUser();
  const { event, participants, hosts, categories, recurringSeries }: FullDeltaEvent =
    await getEvent(id);

  return (
    <>
      <Head>
        <title>{event.title} Δ Delta</title>
      </Head>
      <CardWithBackground
        title={event.title}
        home
        backText="Arrangementer"
        backLink={backLink}
      >
        <EventDetails
          event={event}
          participants={participants}
          hosts={hosts}
          categories={categories}
          recurringSeries={recurringSeries}
          user={user}
          hostname={hostname}
        />
      </CardWithBackground>
    </>
  );
}
