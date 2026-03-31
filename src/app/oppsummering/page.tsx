import { getUserWrappedStats } from "@/service/wrappedActions";
import { Metadata } from 'next';
import WrappedClient from "./wrappedClient";
import { connection } from "next/server";

export const metadata: Metadata = {
    title: "Din deltakelse - Delta Δ Nav",
    description: "Se ditt år i Delta - personlig statistikk over arrangementer du har deltatt på.",
};

export default async function WrappedPage({
    params,
}: {
    params: Promise<{ year?: string }>;
}) {
    await connection();

    const resolvedParams = await params;

    // Default to current year if no year provided
    const currentYear = new Date().getFullYear();
    const queryYear = resolvedParams?.year ? parseInt(resolvedParams.year) : currentYear;

    // Validate year (simple check to avoid crazy inputs)
    const year = isNaN(queryYear) || queryYear < 2000 || queryYear > 2100 ? currentYear : queryYear;

    const stats = await getUserWrappedStats(year);

    if (!stats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ax-meta-purple-700 to-pink-500">
                <div className="text-center text-white p-8">
                    <h1 className="text-4xl font-ax-bold mb-4">Oops! 😅</h1>
                    <p className="text-xl">Vi klarte ikke å hente dataene dine. Prøv igjen senere.</p>
                </div>
            </div>
        );
    }

    return <WrappedClient stats={stats} year={year} />;
}
