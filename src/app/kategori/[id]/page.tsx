import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFiltersCategory";
import { getAllCategories, getEvents } from "@/service/eventActions";
import { Metadata } from "next";

type CategoryPageProps = { params: Promise<{ id: string }> };

function getCategoryNameCandidates(id: string) {
    let decodedId = id;

    try {
        decodedId = decodeURIComponent(id);
    } catch {
    }

    return Array.from(new Set([
        id,
        decodedId,
        id.replace(/\+/g, " "),
        decodedId.replace(/\+/g, " "),
    ]));
}

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
    await checkToken(`/kategori/${id}`);
    const allCategories = await getAllCategories();
    const categoryNames = getCategoryNameCandidates(id);
    const categoryFromCatalog = allCategories.find(item => categoryNames.includes(item.name));
    const eventCategories = categoryFromCatalog
        ? []
        : (await getEvents({ onlyFuture: true })).flatMap(item => item.categories);
    const theCategory = categoryFromCatalog
        ?? eventCategories.find(item => categoryNames.includes(item.name));
    const category = theCategory?.name ?? id;
    const title = category.charAt(0).toUpperCase() + category.slice(1);

    return (
        <>
            <main className="flex flex-grow">
                {theCategory ? (
                    <CardWithBackground
                        title={title}
                        newEvent
                        home
                    >
                        <EventFilters categories={[{ id: theCategory.id, name: theCategory.name }]} searchName />
                    </CardWithBackground>
                ) : (<section className="w-screen flex-grow flex justify-center items-center">
                    404 - Kategorien finnes ikke
                </section>)}
            </main>
        </>
    );
}
