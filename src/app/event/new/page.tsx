import { checkToken } from "@/auth/token";
import CreateEventForm from "@/components/createEventForm";
import CardWithBackground from "@/components/cardWithBackground";
import { Metadata } from "next";
import { getAllCategories } from "@/service/eventActions";
import { useSearchParams } from "next/navigation";
import { EditTypeEnum } from "@/types/event";

export const metadata: Metadata = {
  title: "Opprett arrangement Δ Delta",
};

export default async function NewEvent({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  await checkToken("/event/new");
  const categories = await getAllCategories();

  let eventId = searchParams?.template;
  if (eventId && typeof eventId !== "string") {
    eventId = eventId[0];
  }


  return (
    <CardWithBackground
      color="bg-green-200"
      title="Opprett arrangement"
      home
      backLink="/"
    >
      {/* @ts-ignore */}
      <CreateEventForm
        editType={
          eventId
            ? { type: EditTypeEnum.TEMPLATE, eventId }
            : { type: EditTypeEnum.NEW }
        }
        allCategories={categories}
      />
    </CardWithBackground>
  );
}
