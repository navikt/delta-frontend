import { getAuthApi, getAuthlessApi } from "@/api/instance";
import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventListSwitcher from "@/components/eventListSwitcher";
import { DeltaEvent } from "@/types/event";
import { Heading } from "@navikt/ds-react/esm/typography";

export default async function Home(context: any) {
  await checkToken();
  const api = getAuthlessApi();
  const authApi = await getAuthApi();

  const all: DeltaEvent[] = (await api.get("/event")).data;
  const my: DeltaEvent[] = (await authApi.get("/admin/event")).data;
  const joined: DeltaEvent[] = (await authApi.get("/user/event")).data;

  return (
    <CardWithBackground color="bg-blue-200" title="Arrangementer">
      <EventListSwitcher all={all} my={my} joined={joined} />
    </CardWithBackground>
  );
}
