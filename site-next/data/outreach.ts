export type Pattern = 'A' | 'B' | 'C' | 'random'

export type OutreachTemplate = {
  pattern: 'A' | 'B' | 'C'
  subject: string
  body: string
  demoUrl?: string
}

export type IndustryTemplate = {
  industryId: string
  templates: OutreachTemplate[]
  painPoint: string
  solution: string
}

export type IndustryConfig = {
  id: string
  label: string
  enabled: boolean
  limitPerArea: number  // エリアごとの収集上限（デフォルト10）
}

export type Company = {
  id: string
  name: string
  industryId: string
  industryLabel: string
  website?: string
  email?: string
  address?: string
  hpLevel: 0 | 1 | 2 | 3
  hpReason?: string
  score: number
  excluded?: boolean
  // 詳細サイト診断フラグ
  hasLine?: boolean           // LINE公式アカウント連携あり
  hasOnlineBooking?: boolean  // オンライン予約あり
  phoneOnly?: boolean         // 電話番号のみ（フォームなし・予約なし）
  hasSSL?: boolean            // HTTPS対応
  hasContactForm?: boolean    // お問い合わせフォームあり
}

export type HistoryRecord = {
  id: string
  date: string
  companyName: string
  industryId: string
  industryLabel: string
  hpStatus: string
  pattern: string
  replied: 'none' | 'yes' | 'unnecessary'
  memo: string
}

export const DEFAULT_INDUSTRIES: IndustryConfig[] = [
  { id: 'physiotherapist',    label: '整骨院・接骨院',         enabled: true,  limitPerArea: 10 },
  { id: 'beauty_salon',       label: 'エステ・美容サロン',     enabled: true,  limitPerArea: 10 },
  { id: 'real_estate_agency', label: '不動産会社',             enabled: true,  limitPerArea: 10 },
  { id: 'moving_company',     label: '引越し業者',             enabled: true,  limitPerArea: 10 },
  { id: 'dentist',            label: '歯科クリニック',         enabled: true,  limitPerArea: 10 },
  { id: 'doctor',             label: '整形外科・内科',         enabled: true,  limitPerArea: 10 },
  { id: 'beauty_clinic',      label: '美容クリニック',         enabled: true,  limitPerArea: 10 },
  { id: 'general_contractor', label: '建設・工務店',           enabled: true,  limitPerArea: 10 },
  { id: 'veterinary_care',    label: '動物病院',               enabled: true,  limitPerArea: 10 },
  { id: 'school',             label: '学習塾',                 enabled: true,  limitPerArea: 10 },
  { id: 'lawyer',             label: '士業（弁護士・税理士）', enabled: true,  limitPerArea: 10 },
  { id: 'child_care',         label: '保育園・幼稚園',         enabled: false, limitPerArea: 10 },
  { id: 'nail_salon',         label: 'ネイルサロン',           enabled: false, limitPerArea: 10 },
  { id: 'home_goods_store',   label: 'リフォーム会社',         enabled: false, limitPerArea: 10 },
]

const SIGNATURE = `
Weldex 成田 涼真
info@weldex.jp
080-3404-1872
https://weldex.jp`

const DEMO_URL = 'https://weldex.jp/booking/'

function makeTemplates(
  industryLabel: string,
  subjectA: string,
  bodyA: string,
): OutreachTemplate[] {
  return [
    { pattern: 'A', subject: subjectA, body: `突然のご連絡失礼いたします。Weldexの成田と申します。\n\n${bodyA}\n${SIGNATURE}` },
    {
      pattern: 'B',
      subject: `【ご参考】${industryLabel}向けWEB予約デモのご案内`,
      body: `突然のご連絡失礼いたします。Weldexの成田と申します。\n\n${industryLabel}向けのWEB予約システムのデモをご用意しました。\n実際の動作をご確認いただけます。\n\n${DEMO_URL}\n\nご興味があればお気軽にご連絡ください。${SIGNATURE}`,
      demoUrl: DEMO_URL,
    },
    {
      pattern: 'C',
      subject: '大手制作会社の1/3のコストでWEB予約を導入する方法',
      body: `突然のご連絡失礼いたします。Weldexの成田と申します。\n\nWEBサイト制作＋予約システム導入を、通常の1/3のコストで提供しております。\n初期費用15万円〜、保守月額1万円〜です。\n\nご興味があればお気軽にご連絡ください。${SIGNATURE}`,
    },
  ]
}

export const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  dentist: {
    industryId: 'dentist', painPoint: '電話予約の取りこぼし', solution: '24時間WEB予約導入',
    templates: makeTemplates('歯科クリニック', '電話予約の取りこぼしを減らす方法',
      '歯科医院様では、診療時間外の予約電話を取りこぼしてしまうことはございませんか？\n\n弊社では、24時間WEB予約システムを大手比1/3のコストで導入いただけます。\nLINE連携で患者様へのリマインドも自動送信いたします。\n\nご興味があればお気軽にご連絡ください。'),
  },
  physiotherapist: {
    industryId: 'physiotherapist', painPoint: '予約管理の手間', solution: '自動化による業務効率化',
    templates: makeTemplates('整骨院・接骨院', '予約管理の手間を半分にする方法',
      '整骨院・接骨院様では、予約電話の対応や管理に手間がかかっていませんか？\n\n弊社のWEB予約システムで予約管理を自動化できます。\nLINEリマインド送信で無断キャンセルも削減。\n\nご興味があればお気軽にご連絡ください。'),
  },
  real_estate_agency: {
    industryId: 'real_estate_agency', painPoint: '問い合わせの取りこぼし', solution: '24時間問い合わせ受付',
    templates: makeTemplates('不動産会社', '物件問い合わせを逃さない仕組み',
      '不動産会社様では、営業時間外の物件問い合わせを逃してしまうことはありませんか？\n\n弊社のWEB予約・問い合わせシステムで24時間対応が可能になります。\n\nご興味があればお気軽にご連絡ください。'),
  },
  moving_company: {
    industryId: 'moving_company', painPoint: '見積もり依頼の機会損失', solution: '24時間受付システム',
    templates: makeTemplates('引越し業者', '見積もり依頼を24時間受け付ける方法',
      '引越し業者様では、夜間・休日の見積もり依頼を取りこぼすことはございませんか？\n\n弊社のWEB予約システムで24時間見積もり依頼を受け付けられます。\n\nご興味があればお気軽にご連絡ください。'),
  },
  beauty_salon: {
    industryId: 'beauty_salon', painPoint: '顧客リピート率', solution: 'LINE予約でリピート促進',
    templates: makeTemplates('エステ・美容サロン', 'LINE予約で顧客リピート率を上げる方法',
      'エステ・美容サロン様では、LINEを活用した予約管理をされていますか？\n\nLINE予約システムで再来店を促すリマインドを自動送信。\n顧客満足度とリピート率の向上につながります。\n\nご興味があればお気軽にご連絡ください。'),
  },
}

const GENERIC_SUBJECT_A = '業務効率化とWEB集客を同時に実現する方法'
const GENERIC_BODY_A = 'WEBサイト制作・予約システム導入・LINE連携を一社で対応いたします。\n大手制作会社の1/3のコストで、DXを支援します。\n\nご興味があればお気軽にご連絡ください。'

export function getTemplate(industryId: string, pattern: 'A' | 'B' | 'C'): OutreachTemplate {
  const t = INDUSTRY_TEMPLATES[industryId]
  if (t) {
    return t.templates.find((x) => x.pattern === pattern) ?? t.templates[0]
  }
  const label = DEFAULT_INDUSTRIES.find((i) => i.id === industryId)?.label ?? '事業者'
  return makeTemplates(label, GENERIC_SUBJECT_A, GENERIC_BODY_A).find((x) => x.pattern === pattern)!
}

export const HP_LEVEL_LABEL: Record<number, string> = {
  0: '✅ 正常',
  1: '❌ なし',
  2: '⚠️ 実質なし',
  3: '📱 非対応',
}

export const PREFECTURES: Record<string, string[]> = {
  '北海道':   ['札幌市', '旭川市', '函館市', '釧路市', '帯広市'],
  '宮城県':   ['仙台市', '石巻市', '塩竈市', '大崎市'],
  '東京都':   ['新宿区', '渋谷区', '港区', '中央区', '品川区', '世田谷区', '江東区', '豊島区'],
  '神奈川県': ['横浜市', '川崎市', '相模原市', '横須賀市', '藤沢市', '平塚市'],
  '埼玉県':   ['さいたま市', '川口市', '越谷市', '川越市', '所沢市', '熊谷市'],
  '千葉県':   ['千葉市', '船橋市', '市川市', '松戸市', '柏市', '市原市', '習志野市', '浦安市', '流山市', '我孫子市', '鎌ケ谷市', '木更津市', '成田市'],
  '愛知県':   ['名古屋市', '豊田市', '岡崎市', '一宮市', '豊橋市', '安城市'],
  '大阪府':   ['大阪市', '堺市', '東大阪市', '枚方市', '豊中市', '吹田市'],
  '兵庫県':   ['神戸市', '姫路市', '尼崎市', '西宮市', '明石市'],
  '福岡県':   ['福岡市', '北九州市', '久留米市', '春日市', '太宰府市'],
}

export const ALL_PREFECTURES = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県',
  '静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県',
  '奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県',
  '熊本県','大分県','宮崎県','鹿児島県','沖縄県',
]
