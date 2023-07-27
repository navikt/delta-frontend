import { checkToken } from "@/auth/token";
import CreateEventForm from "@/components/createEventForm";
import CardWithBackground from "@/components/cardWithBackground";

export default async function NewEvent() {
  await checkToken("/event/new");

  return (
    <CardWithBackground
      color="bg-green-200"
      title="Opprett arrangement"
      home
      backLink="/"
    >
      <CreateEventForm />
    </CardWithBackground>
  );
}
