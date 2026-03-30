import { checkToken } from "@/auth/token";
import CreateEventForm from "@/components/createEventForm";
import CardWithBackground from "@/components/cardWithBackground";
import { Metadata } from "next";
import { getAllCategories } from "@/service/eventQueries";
import { EditTypeEnum } from "@/types/event";

export const metadata: Metadata = {
  title: "Opprett nytt arrangement Δ Delta",
};

export default async function NewEvent(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await checkToken("/event/new");
  const categories = await getAllCategories();

  const searchParams = await props.searchParams;
  let eventId = searchParams?.template;
  if (eventId && typeof eventId !== "string") {
    eventId = eventId[0];
  }


  return (
    <CardWithBackground
      title="Opprett nytt arrangement"
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
