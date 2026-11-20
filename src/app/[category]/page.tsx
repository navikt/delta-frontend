import CategoryOverview from "@/components/categoryOverview";
import type { OverviewSearchParams } from "@/service/overviewState";
import type { Metadata } from "next";

type CategoryPageProps = { params: Promise<{ category: string }>; searchParams: Promise<OverviewSearchParams> };

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  return { title: `${category.charAt(0).toUpperCase() + category.slice(1)} Δ Delta` };
}

export default async function Page({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  return <CategoryOverview id={category} returnTo={`/${encodeURIComponent(category)}`} searchParams={searchParams} />;
}