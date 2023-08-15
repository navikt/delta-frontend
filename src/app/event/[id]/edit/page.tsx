import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import CreateEventForm from "@/components/createEventForm";
import { getAllCategories } from "@/service/eventActions";
import { EditTypeEnum } from "@/types/event";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rediger arrangement Δ Delta",
};

export default async function EditEvent({
  params,
}: {
  params: { id: string };
}) {
  checkToken(`/event/${params.id}/edit`);
  const categories = await getAllCategories();
  return (
    <CardWithBackground
      title="Rediger arrangement"
      color="bg-green-200"
      home
      backLink={`/event/${params.id}/admin`}
    >
      <CreateEventForm
        editType={{ type: EditTypeEnum.EDIT, eventId: params.id }}
        allCategories={categories}
      />
    </CardWithBackground>
  );
}
