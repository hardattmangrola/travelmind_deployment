import type { Metadata } from "next";
import { Outfit, Quicksand } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const quicksand = Quicksand({
  variable: "--font-display",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TravelMind | Plan Beautiful Trips",
  description: "TravelMind helps you discover destinations, compare stays, and build premium itineraries with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${quicksand.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
