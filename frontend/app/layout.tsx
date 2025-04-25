import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./services/client/ClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Riddle",
  description: "Rama's Interactive Wordle: A Wordle-like game with Web3 integration",
  keywords: ["Wordle", "Web3 Game", "Riddle", "Crypto Game", "Interactive"],
  authors: [{ name: "Rama" }],
  creator: "Rama",
  openGraph: {
    title: "Riddle",
    description: "Play and earn with Rama's Web3 Riddle game!",
    url: "https://riddle-rouge.vercel.app/",
    siteName: "Riddle by Rama",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Riddle - Web3 Game",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Riddle",
    description: "Play Rama’s Web3 Wordle game and earn rewards",
    creator: "@dntyk",
    images: ["/images/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/apple-touch-icon.png", rel: "apple-touch-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://riddle-rouge.vercel.app/"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white dark:bg-black`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
