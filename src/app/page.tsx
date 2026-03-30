import { checkToken, getUser } from "@/auth/token";
import CardWithBackground from "@/components/cardWithBackground";
import EventFilters from "@/components/eventFilters";
import { getAllCategories } from "@/service/eventActions";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Delta Δ Nav',
};

export default async function Home() {
  await checkToken("/");
  const [categories, user] = await Promise.all([getAllCategories(), getUser()]);

  return (
     <CardWithBackground
         title="Arrangementer"
         newEvent
         scrollToTopOnMount={false}
     >
      <EventFilters
        categories={categories}
        userEmail={user.email}
        selectCategory
        searchName
        homeTabs
        ctaLink
        joinedLink
        selectTimeRadio
      />
     </CardWithBackground>
  );
}
