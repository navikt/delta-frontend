import Header from "@/components/header";
import Footer from "@/components/footer";
import ScrollToTop from "@/components/ScrollToTop";
import "./globals.css";
import { Metadata } from "next";
import Script from 'next/script';

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
        <head>
            <Script strategy="afterInteractive" data-domains="delta.nav.no" defer src="https://cdn.nav.no/team-researchops/sporing/sporing.js"
                    data-host-url="https://umami.nav.no"
                    data-website-id="efe951d8-ebbb-4fad-938e-91eee190f6aa"></Script>
        </head>
        <body>
        <div className="flex flex-col min-h-screen" style={{background: "rgba(19,17,54)"}}>
            <Header/>
            <main className="svelte-reugtu winter bg-surface-subtle flex-grow flex justify-center">
                {children}
            </main>
            <Footer/>
            <ScrollToTop/>
        </div>
        <script>
          {`
            if (typeof window !== 'undefined') {
              window.history.scrollRestoration = 'auto';
            }
          `}
        </script>
        </body>
        </html>
    );
}