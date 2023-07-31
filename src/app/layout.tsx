import Header from "@/components/header";
import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delta Δ",
  description: "Påmeldingsapp",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="no" className="min-h-screen">
      <body>
        <div id="main" className="flex flex-col min-h-screen">
          <Header />
          <main className="bg-surface-subtle flex-grow flex justify-center">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
