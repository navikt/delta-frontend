import Header from "@/components/header";
import Footer from "@/components/footer";
import ScrollToTop from "@/components/ScrollToTop";
import "./globals.css";
import AmplitudeContextProvider from "@/context/AmplitudeContext";

type RootLayoutProps = {
    children: React.ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="no" className="min-h-screen">
        <body>
        <div id="main" className="flex flex-col min-h-screen" style={{background : "rgba(0, 80, 119, 1)"}}>
            <Header />
            <main className="bg-surface-subtle flex-grow flex justify-center pb-10">
                <AmplitudeContextProvider>{children}</AmplitudeContextProvider>
            </main>
            <Footer />
            <ScrollToTop />
        </div>
        </body>
        </html>
    );
}