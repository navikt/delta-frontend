import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import { getUserWrappedStats } from "@/service/wrappedActions";
import { Metadata } from "next";
import MimretidClient from "./mimretidClient";

export const metadata: Metadata = {
  title: "Mimretid - Delta Δ Nav",
  description: "Historiske arrangementer du har deltatt på.",
};

export default async function MimretidPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  await checkToken("/mimretid");

  const params = await searchParams;
  const currentYear = new Date().getFullYear();
  const queryYear = params.year ? parseInt(params.year, 10) : currentYear;
  const selectedYear = Number.isNaN(queryYear) || queryYear < 2000 || queryYear > 2100 ? currentYear : queryYear;
  const nowMs = new Date().getTime();

  const stats = await getUserWrappedStats(selectedYear);

  if (!stats) {
    return (
      <CardWithBackground title="Mimretid" subtitle="Vi klarte ikke å hente dataene dine akkurat nå.">
        <p className="text-ax-neutral-900">Prøv igjen senere.</p>
      </CardWithBackground>
    );
  }

  return (
    <CardWithBackground title="Mimretid" subtitle="Historiske arrangementer du har deltatt på">
      <MimretidClient stats={stats} year={selectedYear} nowMs={nowMs} />
    </CardWithBackground>
  );
}
