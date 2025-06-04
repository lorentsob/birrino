import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import AnonSessionWrapper from "@/components/AnonSessionWrapper";

export const metadata: Metadata = {
  title: "5° Birrino | Quanti. Non come o perchè.",
  description:
    "Tra aperitivi improvvisati, brindisi seriali e serate infinite, è facile perdere il conto. Ma il tuo fegato lo sa benissimo. La domanda vera è: quante unità alcoliche ci sono in quello che hai nel bicchiere?",
  manifest: "/favicon/manifest.json",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/icon1.png", type: "image/png" },
    ],
    apple: [{ url: "/favicon/apple-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <meta name="apple-mobile-web-app-title" content="5° Birrino" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon/icon1.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon/apple-icon.png" />
        <link rel="manifest" href="/favicon/manifest.json" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <main className="min-h-screen bg-gray-50">
          <AnonSessionWrapper />
          <div className="container-custom py-8">{children}</div>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#333",
                borderRadius: "10px",
                padding: "16px",
                boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
              },
              success: {
                iconTheme: {
                  primary: "#ff5f5f",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </main>
      </body>
    </html>
  );
}
