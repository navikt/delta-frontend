import FestivalEventPage, { type FestivalEventPageProps, generateFestivalMetadata } from "@/components/fagfestival/detail/festivalEventPage";
import { festivals } from "@/components/fagfestival/festivals";

export function generateMetadata(props: FestivalEventPageProps) {
  return generateFestivalMetadata(festivals.ips, props);
}

export default function Page(props: FestivalEventPageProps) {
  return <FestivalEventPage {...props} festival={festivals.ips} />;
}
