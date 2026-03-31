import EventJSONFilters from "@/components/eventJSONFilters";
import { getAllCategories } from "@/service/eventQueries";
import { Metadata } from "next";

type CategoryPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata(
    { params }: CategoryPageProps
): Promise<Metadata> {
    const { id } = await params;
    return {
        title: `${id} Δ Delta`
    }
}

export default async function Page({ params }: CategoryPageProps) {
    const { id } = await params;
    const allCategories = await getAllCategories();
    const category = id
    const theCategory = allCategories.find(item => item.name === category);
    const title = category.charAt(0).toUpperCase() + category.slice(1);

    return (
        <>
            {theCategory ? (
                <EventJSONFilters categories={[{ id: theCategory.id, name: theCategory.name }]} />
            ) : (<section className="w-screen flex-grow flex justify-center items-center">
                404 - Kategorien ble ikke funnet
            </section>)}
        </>
    );
}
