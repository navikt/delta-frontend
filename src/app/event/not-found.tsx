import EventList from "@/components/eventList";
import { backendUrl } from "@/toggles/utils";
import { DeltaEvent } from "@/types/event";

export default async function NotFound() {

  return (
    <main className="flex flex-grow">
      <section className="w-screen flex-grow flex justify-center items-center">
        404 - Arrangementet finnes ikke
      </section>
    </main>
  );
}
