import type { Metadata } from "next";
import Hero from "@/components/Hero";

export const metadata: Metadata = {
  title: "Weldex｜AI活用で大手の1/3以下のコストでWEB制作・LINE予約システム",
  description:
    "Weldex（ウェルデックス）は医療・歯科・士業・建設など社内エンジニアを持たない中小企業向けに、AIを活用したWEBサイト制作・LINE予約システム・システム開発を大手の1/3以下のコストで提供します。",
  alternates: { canonical: "https://weldex.jp" },
};
import Pillars from "@/components/Pillars";
import AISection from "@/components/AISection";
import Cases from "@/components/Cases";
import Process from "@/components/Process";
import FAQ from "@/components/FAQ";
import CTABand from "@/components/CTABand";

export default function Home() {
  return (
    <main>
      <Hero />
      <Pillars />
      <AISection />
      <Cases />
      <Process />
      <FAQ />
      <CTABand />
    </main>
  );
}
