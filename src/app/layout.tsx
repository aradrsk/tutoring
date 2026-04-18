import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tutoring · K-12 English in Toronto",
    template: "%s · tutor.",
  },
  description:
    "1:1 English tutoring for K-12 students. In-person in Toronto. 30, 45, or 60 minute sessions. No DMs — just a confirmed slot.",
  openGraph: {
    title: "tutor. — K-12 English Tutoring in Toronto",
    description:
      "Book a 1:1 English tutoring session. In-person, Toronto, free while in prototype.",
    type: "website",
    locale: "en_CA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#191A23]">
        {children}
      </body>
    </html>
  );
}
