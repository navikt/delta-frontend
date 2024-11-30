import Header from "@/components/header";
import Footer from "@/components/footer";
import ScrollToTop from "@/components/ScrollToTop";
import "./globals.css";
import AmplitudeContextProvider from "@/context/AmplitudeContext";
import { Metadata } from "next";
import {UmamiTracker} from "@/components/umami/umami";

type RootLayoutProps = {
    children: React.ReactNode;
};

export const metadata: Metadata = {
    icons: [
      {
        rel: "icon",
        type: "image/x-icon",
        sizes: "16x16",
        url: "/favicon/favicon.ico",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/favicon/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/favicon/favicon-16x16.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        url: "/favicon/apple-touch-icon.png",
      },
    ],
  };

export default async function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="no" className="min-h-screen">
        <body>
        <UmamiTracker />
        <div id="main" className="flex flex-col min-h-screen" style={{background: "rgba(19,17,54)"}}>
            <Header/>
            <main className="bg-surface-subtle flex-grow flex justify-center">
            <AmplitudeContextProvider>{children}</AmplitudeContextProvider>
            </main>
            <Footer />
            <ScrollToTop />
        </div>
        </body>
        </html>
    );
}