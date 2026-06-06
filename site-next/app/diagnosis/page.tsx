import type { Metadata } from "next";
import DiagnosisTool from "./DiagnosisTool";

export const metadata: Metadata = {
  title: "ホームページ無料診断ツール｜表示速度・スマホ対応・SEOを即時チェック | Weldex",
  description:
    "URLを入力するだけ。医院・歯科・士業・建設業のホームページを60秒で無料診断。表示速度・スマホ対応・SEOスコアの課題を特定し、改善提案まで無料です。",
  alternates: { canonical: "https://weldex.jp/diagnosis" },
  openGraph: {
    title: "ホームページ無料診断ツール | Weldex",
    description: "URLを入力するだけで、表示速度・スマホ・SEO・セキュリティを無料診断。",
    type: "website",
  },
};

export default function DiagnosisPage() {
  return <DiagnosisTool />;
}
