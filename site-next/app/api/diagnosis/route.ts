/**
 * app/api/diagnosis/route.ts
 * PageSpeed Insights API プロキシ
 * Google PageSpeed Insights v5 を呼び出してスコアと課題を返す
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 55; // Vercel Hobby: 60秒上限

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URLを入力してください" }, { status: 400 });
    }

    // プロトコルが省略されている場合は https:// を付与
    const target = url.startsWith("http") ? url : `https://${url}`;

    const endpoint =
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
      `?url=${encodeURIComponent(target)}&strategy=mobile&locale=ja`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 50_000);

    const psiRes = await fetch(endpoint, {
      signal: controller.signal,
      next: { revalidate: 0 },
    });
    clearTimeout(timer);

    if (!psiRes.ok) {
      const body = await psiRes.json().catch(() => ({})) as { error?: { message?: string } };
      const msg = body?.error?.message ?? "診断できませんでした。URLを確認してください。";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const data = await psiRes.json();
    const cats   = (data.lighthouseResult?.categories  ?? {}) as Record<string, { score: number }>;
    const audits = (data.lighthouseResult?.audits       ?? {}) as Record<string, { score: number | null; displayValue?: string; description?: string }>;

    const pct = (key: string) => Math.round((cats[key]?.score ?? 0) * 100);

    // 課題を抽出（スコアが 0.9 未満のものを重大度付きで返す）
    type Issue = { id: string; title: string; value: string; severity: "critical" | "warning" };
    const issues: Issue[] = [];

    const check = (id: string, title: string) => {
      const a = audits[id];
      if (!a) return;
      const s = a.score ?? 1;
      if (s < 0.9) {
        issues.push({
          id,
          title,
          value: a.displayValue ?? "",
          severity: s < 0.5 ? "critical" : "warning",
        });
      }
    };

    check("first-contentful-paint",    "初回表示速度（FCP）");
    check("largest-contentful-paint",  "主要コンテンツの表示速度（LCP）");
    check("total-blocking-time",       "操作可能になるまでの時間（TBT）");
    check("cumulative-layout-shift",   "レイアウトのずれ（CLS）");
    check("speed-index",               "ページ全体の表示速度");
    check("uses-text-compression",     "テキスト圧縮が未設定");
    check("render-blocking-resources", "表示を遅らせるリソースが存在");

    if ((audits["viewport"]?.score ?? 1) < 1) {
      issues.push({ id: "viewport", title: "スマートフォン対応が不十分（viewport未設定）", value: "", severity: "critical" });
    }
    if ((audits["is-on-https"]?.score ?? 1) < 1) {
      issues.push({ id: "https", title: "SSL未対応（HTTPS化が必要）", value: "", severity: "critical" });
    }
    if ((audits["meta-description"]?.score ?? 1) < 1) {
      issues.push({ id: "meta", title: "meta descriptionが設定されていない", value: "", severity: "warning" });
    }

    return NextResponse.json({
      url: data.id as string,
      scores: {
        performance:   pct("performance"),
        seo:           pct("seo"),
        accessibility: pct("accessibility"),
        bestPractices: pct("best-practices"),
      },
      issues: issues.slice(0, 6),
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      return NextResponse.json(
        { error: "診断がタイムアウトしました。しばらく待ってから再試行してください。" },
        { status: 408 }
      );
    }
    return NextResponse.json(
      { error: "エラーが発生しました。URLを確認してください。" },
      { status: 500 }
    );
  }
}
