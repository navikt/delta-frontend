"use client";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ScrollToTop from "@/components/ScrollToTop";
import "./globals.css";
import {usePathname} from "next/navigation";
import FagfestivalHeader from "@/components/fagfestival/header";
import React from "react";

type RootLayoutProps = {
  children: React.ReactNode;
};
// eslint-disable-next-line @next/next/no-async-client-component
export default async function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname(); const is_fagfestival = pathname !== '/fagfestival';
  return (
    <html lang="no" className="min-h-screen">
      <body>
      {is_fagfestival ? (
          <div id="main" className="flex flex-col min-h-screen" style={{background: "rgba(0, 80, 119, 1)"}}>
              <Header/>
              <main className="bg-surface-subtle flex-grow flex justify-center pb-10">
                  {children}
              </main>
              <Footer/>
              <ScrollToTop/>
          </div>
      ) : (
          <div id="main" className="flex flex-col min-h-screen" style={{background: "rgba(0, 80, 119, 1)"}}>
              <FagfestivalHeader/>
              <main className="bg-surface-subtle flex-grow flex justify-center pb-10">
                  {children}
              </main>
              <Footer/>
              <ScrollToTop/>
          </div>
          )}
          </body>
          </html>
          );
      }
