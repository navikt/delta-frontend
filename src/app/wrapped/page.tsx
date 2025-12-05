import { checkToken } from "@/auth/token";
import { getUserWrappedStats } from "@/service/wrappedActions";
import { Metadata } from 'next';
import WrappedClient from "./wrappedClient";

export const metadata: Metadata = {
    title: "Din Wrapped 2025 - Delta Δ Nav",
    description: "Se ditt år i Delta - personlig statistikk over arrangementer du har deltatt på.",
};

export default async function WrappedPage() {
    await checkToken("/wrapped");

    const currentYear = new Date().getFullYear();
    const stats = await getUserWrappedStats(currentYear);

    if (!stats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
                <div className="text-center text-white p-8">
                    <h1 className="text-4xl font-bold mb-4">Oops! 😅</h1>
                    <p className="text-xl">Vi klarte ikke å hente dataene dine. Prøv igjen senere.</p>
                </div>
            </div>
        );
    }

    return <WrappedClient stats={stats} year={currentYear} />;
}
