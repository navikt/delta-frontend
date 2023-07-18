import { checkToken } from "@/auth/token";
import CreateEventForm from "./createEventForm";
import { Heading } from "@navikt/ds-react/esm/typography";
import CardWithBackground from "@/components/cardWithBackground";

export default async function NewEvent() {
  await checkToken("/event/new");

  return (
    <CardWithBackground color="bg-green-200" title="Opprett arrangement">
      <p className="italic break-words">
        Arrangementet vil være synlig for alle som har tilgang til Delta, og vil
        bli publisert på deltakalenderen.
      </p>
      <CreateEventForm />
    </CardWithBackground>
  );
}
