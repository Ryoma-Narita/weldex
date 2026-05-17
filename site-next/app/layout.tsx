import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SchemaOrg from "@/components/SchemaOrg";

/* next/font でセルフホスト化（CDN読み込み不要・INP改善） */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Weldex｜AI活用で大手の1/3以下のコストでWEB制作・LINE予約システム",
    template: "%s | Weldex",
  },
  description:
    "Weldex（ウェルデックス）は医療・歯科・士業・建設など社内エンジニアを持たない中小企業向けに、AIを活用したWEBサイト制作・LINE予約システム・システム開発を大手の1/3以下のコストで提供します。",
  metadataBase: new URL("https://weldex.jp"),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://weldex.jp",
    siteName: "Weldex",
    title: "Weldex｜AI活用で大手の1/3以下のコストでWEB制作・LINE予約システム",
    description:
      "医療・歯科・士業・建設など社内エンジニアを持たない中小企業向けに、AIを活用したWEBサイト制作・LINE予約システムを提供。",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Weldex" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Weldex｜AI活用WEB制作・LINE予約システム",
    description: "大手の1/3以下のコストでWEBサイト制作・LINE予約システムを提供。",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://weldex.jp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <SchemaOrg />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
