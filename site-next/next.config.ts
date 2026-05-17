import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Vercelデプロイ（SSR対応・output: 'export'は不要）
  // Cloudflare Pages静的エクスポートに切り替える場合は output: "export" を有効化
  // output: "export",

  images: {
    // 静的エクスポート時は unoptimized: true が必要
    // Vercel使用時はそのまま（最適化ON）
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
