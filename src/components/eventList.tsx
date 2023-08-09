import { FullDeltaEvent } from "@/types/event";
import { EventCard } from "@/components/eventCard";
import { getEvents } from "@/service/eventActions";

type EventListProps = {
  fullEvents: FullDeltaEvent[];
};

export async function EventList({
  categories,
  onlyFuture = false,
  onlyPast = false,
  onlyMine = false,
}: any) {
  const events = await getEvents({
    categories: categories,
    onlyFuture: onlyFuture,
    onlyPast: onlyPast,
    onlyMine: onlyMine,
    onlyJoined: false,
  });

  return <EventListItems fullEvents={events} />;
}

function EventListItems({ fullEvents }: EventListProps) {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {fullEvents.length ? (
        fullEvents.map((fullEvent) => (
          <EventCard
            event={fullEvent.event}
            categories={fullEvent.categories}
            key={`event-${fullEvent.event.id}`}
          />
        ))
      ) : (
        <p className="text-center col-span-full italic text-xlarge">
          Fant ingen arrangementer :--(
        </p>
      )}
    </ul>
  );
}
