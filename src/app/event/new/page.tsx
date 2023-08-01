import { checkToken } from "@/auth/token";
import CreateEventForm from "@/components/createEventForm";
import CardWithBackground from "@/components/cardWithBackground";
import { Metadata } from "next";
import { getAllCategories } from "@/service/eventActions";

export const metadata: Metadata = {
  title: "Delta Δ - Opprett arrangement"
}


export default async function NewEvent() {
  await checkToken("/event/new");
  const categories = await getAllCategories();

  return (
    <CardWithBackground
      color="bg-green-200"
      title="Opprett arrangement"
      home
      backLink="/"
    >
      <CreateEventForm allCategories={categories} />
    </CardWithBackground>
  );
}
