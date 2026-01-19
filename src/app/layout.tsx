import "./globals.css";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { SafeThemeProvider } from "./app/providers/safe-theme-provider";
import QueryProvider from "./app/providers/provider";
import NextTopLoader from 'nextjs-toploader'

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "700"], // optional: specify weights you need
});

export const metadata: Metadata = {
  title: {
    default: "Beitrag",
    template: "%s | Beitrag",
  },
  description:
    "Beitrag visualizes your GitHub contributions with precision. A clean, German-inspired developer activity dashboard.",
  keywords: [
    "GitHub contributions",
    "developer activity",
    "contribution graph",
    "GitHub stats",
    "Beitrag",
    "developer dashboard",
    "code analytics",
  ],
  authors: [{ name: "Athul Vinod" }],
  creator: "Athul Vinod",
  openGraph: {
    title: "Beitrag",
    description:
      "Precision-driven GitHub contribution analytics with a German engineering touch.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beitrag",
    description:
      "Visualize your GitHub contributions with precision and clarity.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <NextTopLoader
          color="#1447e6"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #1447e6,0 0 5px #1447e6"
        />

        <QueryProvider>
          <SafeThemeProvider>
            <Toaster />
            {children}
          </SafeThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
