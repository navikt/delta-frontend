import { getAuthApi, getAuthlessApi } from "@/api/instance";
import EventListSwitcher from "@/components/eventListSwitcher";
import { DeltaEvent } from "@/types/event";
import { Heading } from "@navikt/ds-react/esm/typography";

export default async function Home(context: any) {
  const api = getAuthlessApi();
  const authApi = await getAuthApi();

  const all: DeltaEvent[] = (await api.get("/event")).data;
  const my: DeltaEvent[] = (await authApi.get("/admin/event")).data;
  const joined: DeltaEvent[] = (await authApi.get("/user/event")).data;

  return (
    <section className="flex-col justify-center w-11/12 max-w-3xl flex-wrap items-start">
      <Heading size="large" className="pt-12 pb-3 text-center">
        Arrangementer
      </Heading>
      <EventListSwitcher all={all} my={my} joined={joined} />
    </section>
  );
}
