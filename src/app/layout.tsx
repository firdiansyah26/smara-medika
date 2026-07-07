import type { Metadata, Viewport } from "next";
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  "http://localhost:3000";

const description =
  "Platform Rekam Medis Elektronik (RME) multi-tenant untuk Rumah Sakit, Klinik, dan Apotek — dengan transfer obat antar rekanan, tracking, dan berbagi pasien terkontrol.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SmaraMedika — Platform Rekam Medis Elektronik",
    template: "%s — SmaraMedika",
  },
  description,
  applicationName: "SmaraMedika",
  keywords: [
    "rekam medis elektronik",
    "RME",
    "EMR",
    "SIMRS",
    "rumah sakit",
    "klinik",
    "apotek",
    "multi-tenant",
    "transfer obat",
    "antrian",
    "telemedicine",
    "SATUSEHAT",
    "BPJS",
  ],
  authors: [{ name: "SmaraMedika" }],
  creator: "SmaraMedika",
  category: "healthcare",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "SmaraMedika",
    title: "SmaraMedika — Platform Rekam Medis Elektronik",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "SmaraMedika — Platform Rekam Medis Elektronik",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
