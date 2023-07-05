import Header from "@/components/header";
import "./globals.css";
import { Metadata } from "next";
import { checkToken } from "@/auth/token";

export const metadata: Metadata = {
  title: "Delta Δ",
  description: "Påmeldingsapp",
};

type RootLayoutProps = { children: React.ReactNode };
export default async function RootLayout({ children }: RootLayoutProps) {
  await checkToken();
  return (
    <html lang="no">
      <body className="min-h-screen flex flex-col">
        <Header />
        {children}
      </body>
    </html>
  );
}
