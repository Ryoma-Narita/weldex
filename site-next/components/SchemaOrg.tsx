const faqs = [
  { q: "料金はどのくらいかかりますか？", a: "サイト制作は¥150,000〜、LINE・WEB予約システムは¥80,000〜です。ご要件によって変動しますので、まず無料相談でお気軽にご相談ください。大手制作会社と比べ3分の1以下のコストを実現しています。" },
  { q: "納期はどのくらいですか？", a: "シンプルなサイトであれば最短2〜3週間、標準的な構成で4〜6週間が目安です。ご要望の公開日がある場合はお早めにご相談ください。" },
  { q: "修正は何回までできますか？", a: "デザイン確認時に2回、コーディング完了後に2回まで無償で対応します。それ以上の修正や仕様変更は別途お見積もりとなります。" },
  { q: "公開後のサポートはありますか？", a: "公開後1ヶ月間は無料サポートが付きます。その後は月額¥5,000〜の保守プランへ移行可能です。内容の更新・SEO改善・トラブル対応まで継続してサポートします。" },
];

export default function SchemaOrg() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Weldex",
    description:
      "AIを活用した低コスト・高品質なWEBサイト制作・LINE予約システム・DX支援。医療・士業・建設など専門業種に特化したWEB制作会社。",
    url: "https://weldex.jp",
    email: "info@weldex.jp",
    areaServed: "JP",
    serviceType: ["WEBサイト制作", "LINE予約システム", "システム開発", "保守・運用"],
    priceRange: "¥¥",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Weldexサービス一覧",
      itemListElement: [
        { "@type": "Offer", name: "WEBサイト制作 Lightプラン", price: "150000", priceCurrency: "JPY" },
        { "@type": "Offer", name: "WEBサイト制作 Standardプラン", price: "350000", priceCurrency: "JPY" },
        { "@type": "Offer", name: "LINE予約システム導入", price: "80000", priceCurrency: "JPY" },
      ],
    },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Weldex",
    url: "https://weldex.jp",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://weldex.jp/?s={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    </>
  );
}
