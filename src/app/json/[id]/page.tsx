import {checkToken} from "@/auth/token";
import EventJSONFilters from "@/components/eventJSONFilters";
import {getAllCategories} from "@/service/eventActions";
import {Metadata} from "next";

type CategoryPageProps = { params: { id: string } };

export function generateMetadata(
    { params }: CategoryPageProps
  ): Metadata {
    return {
        title: `${params.id} Δ Delta`
    }
  }

export default async function Page({ params }: CategoryPageProps) {
    await checkToken(`/json/${params.id}`);
    const allCategories = await getAllCategories();
    const category = params.id
    const theCategory = allCategories.find(item => item.name === category);
    const title = category.charAt(0).toUpperCase() + category.slice(1);

    return (
        <>
            {theCategory ? (
                <EventJSONFilters categories={[{id: theCategory.id, name: theCategory.name}]} searchName/>
            ) : (<section className="w-screen flex-grow flex justify-center items-center">
                404 - Kategorien ble ikke funnet
            </section>)}
        </>
    );
}
