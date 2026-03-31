import { Category } from "@/types/event";
import { getEvents } from "@/service/eventQueries";
import EventListClient from "./eventListClient";

type Props = {
  categoryIds: number[];
  onlyFuture: boolean;
  onlyPast: boolean;
  onlyMine: boolean;
  tabname: string;
  userEmail?: string;
};

export default async function EventListSection({
  categoryIds,
  onlyFuture,
  onlyPast,
  onlyMine,
  tabname,
  userEmail,
}: Props) {
  const categories: Category[] = categoryIds.map((id) => ({ id, name: "" }));

  const events = await getEvents({
    categories,
    onlyFuture,
    onlyPast,
    onlyMine,
  });

  return (
    <EventListClient
      events={events}
      tabname={tabname}
      userEmail={userEmail}
    />
  );
}
