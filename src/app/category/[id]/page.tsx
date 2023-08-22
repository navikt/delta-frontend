import {checkToken} from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFiltersCategory";
import {getAllCategories} from "@/service/eventActions";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Kategori Δ Delta",
};

export default async function Page({
    params,
    }: {
    params: { id: string };
}) {
    await checkToken(`/category/${params.id}`);
    const allCategories = await getAllCategories();
    const category = params.id
    const theCatogery = allCategories.find(item => item.name === category);
    const title = category + "-arrangementer"

    return (
        <>
            <main className="flex flex-grow">
                {theCatogery ? (
                    <CardWithBackground
                        color="bg-blue-200"
                        title={title}
                        newEvent
                        home
                        backLink="/"
                    >
                        <EventFilters categories={[{id: theCatogery.id, name: theCatogery.name}]} searchName/>
                    </CardWithBackground>
                ) : (<section className="w-screen flex-grow flex justify-center items-center">
                    404 - Kategorien finnes ikke
                </section>)}
            </main>
        </>
    );
}
