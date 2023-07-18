import { checkToken } from "@/auth/token";
import CreateEventForm from "./createEventForm";
import { Heading } from "@navikt/ds-react/esm/typography";

export default async function NewEvent() {
  await checkToken("/event/new");

  return (
    <div className="p-20 max-w-[95%] w-[80rem] m-auto gap-7 flex flex-col">
      <div className="flex flex-col gap-2">
        <Heading level="1" size="large">
          Opprett arrangement
        </Heading>
        <p className="italic break-words">
          Arrangementet vil være synlig for alle som har tilgang til Delta, og
          vil bli publisert på deltakalenderen.
        </p>
      </div>
      <style>
        {`.navds-date__wrapper {
          max-width: 100%;
        }`}
      </style>
      <CreateEventForm />
    </div>
  );
}

