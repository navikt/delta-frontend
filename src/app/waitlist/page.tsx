import { checkToken } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import { getMyWaitlists } from "@/service/waitlistQueries";
import Link from "next/link";

export const metadata = { title: "Mine ventelister Δ Delta" };

export default async function WaitlistsPage() {
  await checkToken("/waitlist");
  const entries = await getMyWaitlists();
  return <CardWithBackground title="Mine ventelister" home backText="Arrangementer" backLink="/">
    <p>Du blir automatisk påmeldt hvis du får plass før fristen. Du kan forlate ventelisten på arrangementssiden.</p>
    {entries.length === 0 ? <p>Du står ikke på noen ventelister for kommende arrangementer.</p>
      : <ul>{entries.map(({ event, position, open }) => <li key={event.id}>
        <Link href={`/event/${event.id}`}>{event.title}</Link>
        {` – nummer ${position} i køen${open ? "" : " (fristen er utløpt)"}`}
      </li>)}</ul>}
  </CardWithBackground>;
}
