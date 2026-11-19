import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import { getEvents } from "@/service/eventQueries";
import type { Metadata } from "next";
import MimretidClient from "./mimretidClient";

export const metadata: Metadata = {
  title: "Mimretid - Delta Δ Nav",
  description: "Historiske arrangementer du har deltatt på.",
};

export default async function MimretidPage() {
  await checkToken("/mimretid");

  const events = await getEvents({ onlyJoined: true }, "/mimretid");
  const nowMs = Date.now();
  const summaries = events.map(({ event }) => ({
    id: event.id,
    title: event.public ? event.title : "Privat arrangement",
    date: event.startTime,
    isPublic: event.public,
  }));

  return (
    <CardWithBackground title="Mimretid" subtitle="Historiske arrangementer du har deltatt på">
      <MimretidClient events={summaries} currentYear={new Date(nowMs).getFullYear()} nowMs={nowMs} />
    </CardWithBackground>
  );
}
