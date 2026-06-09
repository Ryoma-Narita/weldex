import type { Metadata } from "next";
import LoadingScreen from "@/components/LoadingScreen";
import Hero from "@/components/Hero";
import PainPoints from "@/components/PainPoints";
import KineticSection from "@/components/KineticSection";
import Pillars from "@/components/Pillars";
import PriceTeaser from "@/components/PriceTeaser";
import Process from "@/components/Process";
import CTABand from "@/components/CTABand";

export const metadata: Metadata = {
  title: "Weldex｜AI活用で大手の1/3以下のコストでWEB制作・LINE予約システム",
  description:
    "Weldex（ウェルデックス）は医療・歯科・士業・建設など中小企業向けに、AIを活用したWEBサイト制作・LINE予約システム・システム開発を低コストで提供します。",
  alternates: { canonical: "https://weldex.jp" },
};

export default function Home() {
  return (
    <main>
      <LoadingScreen />
      <Hero />
      <KineticSection />
      <PainPoints />
      <Pillars />
      <PriceTeaser />
      <Process />
      <CTABand />
    </main>
  );
}
