import { Metadata } from "next";
export const metadata: Metadata = {
    title: "404 Δ Delta",
};

export default async function NotFound() {
  return (
    <main className="flex flex-grow">
      <section className="w-screen flex-grow flex justify-center items-center">
        404 - Siden finnes ikke
      </section>
    </main>
  );
}
