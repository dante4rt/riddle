import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./services/client/ClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Riddle | Play Web3 Wordle and Win Crypto Rewards",
  description:
    "Riddle is a decentralized Wordle-inspired GameFi dApp. Solve riddles, win crypto prizes, and join Rama's Web3 gaming revolution. Play now!",
  keywords: [
    "Wordle Game",
    "Web3 Gaming",
    "Crypto Game",
    "Blockchain Game",
    "Play to Earn",
    "Riddle Game",
    "Web3 Wordle",
    "Crypto Rewards",
    "GameFi dApp",
    "Rama Interactive",
  ],
  authors: [{ name: "Rama" }],
  creator: "Rama",
  openGraph: {
    title: "Riddle | Solve, Play, and Earn Crypto Rewards",
    description:
      "Experience the first Web3 Wordle game! Solve daily riddles, compete for crypto prizes, and join Rama's blockchain gaming adventure.",
    url: "https://riddle-rouge.vercel.app/",
    siteName: "Riddle by Rama",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Riddle - Web3 Wordle Crypto Game",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Play Riddle – Solve Words, Win Crypto!",
    description:
      "Riddle brings Web3 to Wordle. Guess the correct word, claim rewards, and join the GameFi revolution with Rama!",
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
        <div className="background-container">
          <ClientProviders>{children}</ClientProviders>
        </div>
      </body>
    </html>
  );
}
