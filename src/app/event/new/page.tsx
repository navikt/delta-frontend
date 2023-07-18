import { checkToken } from "@/auth/token";
import CreateEventForm from "./createEventForm";
import { Heading } from "@navikt/ds-react/esm/typography";

export default async function NewEvent() {
  await checkToken("/event/new");

  return (
    <div className="w-full flex flex-col align-center items-center">
      <div className="w-full text-center h-fit bg-green-200 p-18 pb-24">
        <Heading level="1" size="xlarge">
          Opprett arrangement
        </Heading>
      </div>
      <div className="bg-white drop-shadow-lg border-gray-200 border-2 rounded relative w-5/6 top-[-5rem] z-10 flex flex-col p-4 h-fit max-w-[80rem] gap-4">
        <p className="italic break-words">
          Arrangementet vil være synlig for alle som har tilgang til Delta, og
          vil bli publisert på deltakalenderen.
        </p>
        <CreateEventForm />
      </div>
    </div>
  );
}
