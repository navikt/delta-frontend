import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFilters";
import { getAllCategories } from "@/service/eventActions";

type EventPageProps = { params: { id: string } };

export default async function Page({ params }: EventPageProps) {
  await checkToken("/");
  const allCategories = await getAllCategories();
  const category = params.id
  const title = category + " arrangementer"

  return (
      <main className="flex flex-grow">
        <CardWithBackground
            color="bg-blue-200"
            title={title}
            newEvent
        >
          <EventFilters categories={allCategories} selectCategory searchName />
        </CardWithBackground>
      </main>
  );
}
