import Header from "@/components/header";
import "./globals.css";
import { Metadata } from "next";
import { checkToken, getUser } from "@/auth/token";

export const metadata: Metadata = {
  title: "Delta Δ",
  description: "Påmeldingsapp",
};

type RootLayoutProps = { 
  children: React.ReactNode,
};

export default async function RootLayout({ children }: RootLayoutProps) {
  // checkToken blir flytta bort herfra, trenger å sende inn riktig url ved behov
  // const user = getUser(); // TODO: trenger vi? har gjort user i Header optional enn så lenge
  return (
    <html lang="no" className="min-h-screen">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="bg-surface-subtle flex-grow flex justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}
