import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFilters";
import { getAllCategories } from "@/service/eventActions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delta Δ NAV",
};

export default async function Home(context: any) {
  await checkToken("/");

  const allCategories = await getAllCategories();

  return (
    <CardWithBackground
      color="bg-blue-200"
      title="Kommende arrangementer"
      newEvent
    >
      <EventFilters categories={allCategories} selectCategory searchName joinedLink ctaLink />
    </CardWithBackground>
  );
}
