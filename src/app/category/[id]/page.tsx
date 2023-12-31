import {checkToken} from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFiltersCategory";
import {getAllCategories} from "@/service/eventActions";
import {Metadata} from "next";

type CategoryPageProps = { params: { id: string } };

export function generateMetadata(
    { params }: CategoryPageProps
  ): Metadata {
    return {
        title: `${params.id}-arrangementer Δ Delta`
    }
  }

export default async function Page({ params }: CategoryPageProps) {
    await checkToken(`/category/${params.id}`);
    const allCategories = await getAllCategories();
    const category = params.id
    const theCategory = allCategories.find(item => item.name === category);
    const title = category + "-arrangementer"

    return (
        <>
            <main className="flex flex-grow">
                {theCategory ? (
                    <CardWithBackground
                        color="bg-blue-200"
                        title={title}
                        newEvent
                        home
                    >
                        <EventFilters categories={[{id: theCategory.id, name: theCategory.name}]} searchName/>
                    </CardWithBackground>
                ) : (<section className="w-screen flex-grow flex justify-center items-center">
                    404 - Kategorien finnes ikke
                </section>)}
            </main>
        </>
    );
}
