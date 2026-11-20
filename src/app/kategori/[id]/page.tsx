import CategoryOverview from "@/components/categoryOverview";
import type { OverviewSearchParams } from "@/service/overviewState";
import type { Metadata } from "next";

type CategoryPageProps = { params: Promise<{ id: string }>; searchParams: Promise<OverviewSearchParams> };

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `${id} Δ Delta` };
}

export default async function Page({ params, searchParams }: CategoryPageProps) {
  const { id } = await params;
  return <CategoryOverview id={id} returnTo={`/kategori/${encodeURIComponent(id)}`} searchParams={searchParams} />;
}
