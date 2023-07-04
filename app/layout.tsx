import Header from "@/components/header";
import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LOL Δ",
  description: "Påmeldingsapp",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body className="min-h-screen flex flex-col">
        <Header />
        {children}
      </body>
    </html>
  );
}
