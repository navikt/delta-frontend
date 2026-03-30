import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import CreateEventForm from "@/components/createEventForm";
import { getAllCategories } from "@/service/eventQueries";
import { EditTypeEnum } from "@/types/event";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rediger arrangement Δ Delta",
};

export default async function EditEvent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  checkToken(`/event/${id}/edit`);
  const categories = await getAllCategories();
  return (
    <CardWithBackground
      title="Rediger arrangement"
      home
      backLink={`/event/${id}/admin`}
    >
      <CreateEventForm
        editType={{ type: EditTypeEnum.EDIT, eventId: id }}
        allCategories={categories}
      />
    </CardWithBackground>
  );
}
