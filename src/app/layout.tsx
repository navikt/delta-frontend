import Header from "@/components/header";
import "./globals.css";
import { Metadata } from "next";
import { checkToken, getUser } from "@/auth/token";

export const metadata: Metadata = {
  title: "Delta Δ",
  description: "Påmeldingsapp",
};

type RootLayoutProps = { children: React.ReactNode };
export default async function RootLayout({ children }: RootLayoutProps) {
  await checkToken();
  const user = getUser();
  return (
    <html lang="no" className="min-h-screen">
      <body className="flex flex-col min-h-screen">
        <Header user={user} />
        <main className="bg-surface-subtle flex-grow flex justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}
