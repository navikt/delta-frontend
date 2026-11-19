import { checkToken } from "@/auth/token";
import { getEventStatistics } from "@/service/statsActions";
import { loadStatisticsState } from "@/service/statisticsState";
import type { Metadata } from "next";
import StatsClient from "./statsClient";

type StatsPageProps = {
  searchParams: Promise<{ year?: string }>;
};

export async function generateMetadata({ searchParams }: StatsPageProps): Promise<Metadata> {
  const { year } = await loadStatisticsState(searchParams);
  return { title: `Statistikk ${year ?? new Date().getFullYear()} - Delta Δ Nav` };
}

export default async function StatsPage({ searchParams }: StatsPageProps) {
  await checkToken("/statistikk");
  const currentYear = new Date().getFullYear();
  const { year } = await loadStatisticsState(searchParams);
  const selectedYear = year ?? currentYear;
  const years = [...new Set([
    ...Array.from({ length: Math.max(1, currentYear - 2024 + 1) }, (_, index) => 2024 + index),
    currentYear,
    selectedYear,
  ])];
  const statsByYear = await getEventStatistics(years);
  return <StatsClient statsByYear={statsByYear} currentYear={currentYear} />;
}
