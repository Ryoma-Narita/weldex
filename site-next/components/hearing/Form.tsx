'use client'

import { useState } from 'react'

// ─── 定数 ────────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  '歯科クリニック', '内科・小児科・皮膚科', '美容クリニック・美容外科',
  '整形外科・リハビリ', '整骨院・接骨院・鍼灸院',
  'エステ・美容サロン', 'ネイルサロン・まつげサロン',
  '理容・美容室', 'マッサージ・整体', '飲食店・カフェ',
  '建設・工務店・リフォーム', '不動産', '引越し・運送',
  '士業（税理士・弁護士等）', '保険・金融', '学習塾・習い事',
  'フィットネス・スポーツ', 'ホテル・旅館', '小売・物販', 'その他',
]

const SOURCES = [
  'メールを受け取った', 'Google検索', 'SNS', '知人の紹介', 'その他',
]

const ISSUES = [
  'HPがない', 'スマホで見づらい', '更新できていない',
  'デザインが古い', 'SEOで上位に出てこない',
  '予約はすべて電話対応', 'その他',
]

const MONTHLY = ['ほぼない', '月1〜10件', '月10〜30件', '月30件以上']

const SERVICES = [
  'WEBサイト制作', 'WEB予約システム', 'LINE連携',
  '管理画面・システム開発', '保守・運用サポート', 'まだわからない',
]

const BUDGETS = [
  '¥200,000以下', '¥200,000〜¥300,000',
  '¥300,000〜¥500,000', '¥500,000以上', '未定・わからない',
]

const DEADLINES = ['1ヶ月以内', '2〜3ヶ月以内', '半年以内', '未定']

const TOTAL_STEPS = 4

// ─── スタイル ─────────────────────────────────────────────────────────────────

const S = {
  wrap: {
    fontFamily: "'Zen Kaku Gothic New', sans-serif",
    minHeight: '100vh',
    background: '#f4f6fb',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    background: '#1a2540',
    padding: '1.1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  headerLogo: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 800,
    fontSize: '1.05rem',
    color: '#fff',
    letterSpacing: '-0.01em',
  },
  headerDot: { color: '#b8960c' },
  body: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '2rem 1rem 4rem',
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 24px rgba(0,0,0,0.07)',
    padding: 'clamp(1.5rem, 5vw, 2.5rem)',
    width: '100%',
    maxWidth: 620,
  },
  stepBar: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '2rem',
    gap: 0,
  },
  stepLabel: {
    fontSize: '0.65rem',
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center' as const,
  },
  stepTitle: {
    fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
    fontWeight: 700,
    color: '#1a2540',
    marginBottom: '0.4rem',
  },
  stepSub: {
    fontSize: '0.82rem',
    color: '#64748b',
    marginBottom: '1.75rem',
  },
  qBlock: {
    marginBottom: '1.5rem',
  },
  qLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1a2540',
    marginBottom: '0.6rem',
    display: 'flex',
    gap: '0.35rem',
    alignItems: 'center',
  },
  required: {
    fontSize: '0.65rem',
    background: '#ef4444',
    color: '#fff',
    borderRadius: 3,
    padding: '1px 5px',
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  textInput: {
    width: '100%',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    padding: '0.65rem 0.85rem',
    fontSize: '0.9375rem',
    fontFamily: "'Zen Kaku Gothic New', sans-serif",
    color: '#1a2540',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s',
  },
  textarea: {
    width: '100%',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    padding: '0.65rem 0.85rem',
    fontSize: '0.9375rem',
    fontFamily: "'Zen Kaku Gothic New', sans-serif",
    color: '#1a2540',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: 100,
    boxSizing: 'border-box' as const,
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.55rem',
  },
  radioItem: (checked: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.6rem 0.85rem',
    border: `1.5px solid ${checked ? '#1a2540' : '#e2e8f0'}`,
    borderRadius: 8,
    cursor: 'pointer',
    background: checked ? '#f0f4ff' : '#fff',
    transition: 'all 0.15s',
    fontSize: '0.875rem',
    color: '#1a2540',
  }),
  checkGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.45rem',
  },
  checkItem: (checked: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.55rem 0.85rem',
    border: `1.5px solid ${checked ? '#1a2540' : '#e2e8f0'}`,
    borderRadius: 8,
    cursor: 'pointer',
    background: checked ? '#f0f4ff' : '#fff',
    transition: 'all 0.15s',
    fontSize: '0.875rem',
    color: '#1a2540',
  }),
  btnRow: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '2rem',
    justifyContent: 'flex-end',
  },
  btnBack: {
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    fontFamily: "'Zen Kaku Gothic New', sans-serif",
    cursor: 'pointer',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    background: '#fff',
    color: '#64748b',
  },
  btnNext: {
    padding: '0.75rem 1.75rem',
    fontSize: '0.875rem',
    fontWeight: 700,
    fontFamily: "'Zen Kaku Gothic New', sans-serif",
    cursor: 'pointer',
    border: 'none',
    borderRadius: 8,
    background: '#1a2540',
    color: '#fff',
    flex: 1,
    maxWidth: 200,
  },
}

// ─── 型 ──────────────────────────────────────────────────────────────────────

interface FormData {
  company: string
  name: string
  industry: string
  industry_other: string
  url: string
  source: string
  issues: string[]
  goal: string
  monthly: string
  services: string[]
  budget: string
  deadline: string
  email: string
  phone: string
  note: string
}

const initForm = (): FormData => ({
  company: '', name: '', industry: '', industry_other: '',
  url: '', source: '', issues: [], goal: '', monthly: '',
  services: [], budget: '', deadline: '',
  email: '', phone: '', note: '',
})

// ─── ステップインジケーター ────────────────────────────────────────────────────

function StepBar({ step }: { step: number }) {
  const labels = ['基本情報', '現状・課題', 'ご要望', '連絡先']
  return (
    <div style={S.stepBar}>
      {labels.map((lbl, i) => {
        const num = i + 1
        const done = num < step
        const active = num === step
        return (
          <div key={lbl} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {i > 0 && (
                <div style={{
                  flex: 1, height: 2,
                  background: done || active ? '#1a2540' : '#e2e8f0',
                  transition: 'background 0.3s',
                }} />
              )}
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 700,
                background: done ? '#1a2540' : active ? '#1a2540' : '#e2e8f0',
                color: done || active ? '#fff' : '#94a3b8',
                transition: 'all 0.3s',
              }}>
                {done ? '✓' : num}
              </div>
              {i < labels.length - 1 && (
                <div style={{
                  flex: 1, height: 2,
                  background: done ? '#1a2540' : '#e2e8f0',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
            <div style={{
              ...S.stepLabel,
              color: active ? '#1a2540' : done ? '#64748b' : '#94a3b8',
              fontWeight: active ? 700 : 400,
            }}>{lbl}</div>
          </div>
        )
      })}
    </div>
  )
}

// ─── ラジオ・チェック共通 ──────────────────────────────────────────────────────

function Radio({ checked, onChange, label }: {
  value?: string; checked: boolean; onChange: () => void; label: string
}) {
  return (
    <label style={S.radioItem(checked)} onClick={onChange}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${checked ? '#1a2540' : '#cbd5e1'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a2540' }} />}
      </div>
      {label}
    </label>
  )
}

function Check({ checked, onChange, label }: {
  checked: boolean; onChange: () => void; label: string
}) {
  return (
    <label style={S.checkItem(checked)} onClick={onChange}>
      <div style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
        border: `2px solid ${checked ? '#1a2540' : '#cbd5e1'}`,
        background: checked ? '#1a2540' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>}
      </div>
      {label}
    </label>
  )
}

// ─── メインコンポーネント ─────────────────────────────────────────────────────

export default function HearingForm() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initForm())
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: keyof FormData, value: string) =>
    setForm(f => ({ ...f, [field]: value }))

  const toggleArr = (field: 'issues' | 'services', val: string) =>
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val)
        ? f[field].filter(v => v !== val)
        : [...f[field], val],
    }))

  // バリデーション
  const canNext = () => {
    if (step === 1) return form.company && form.name && form.industry && form.source
    if (step === 2) return !!form.goal
    if (step === 4) return !!form.email
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/hearing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('送信失敗')
      setSubmitted(true)
    } catch {
      setError('送信に失敗しました。しばらくしてから再度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  // ─── サンクス ───────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={S.wrap}>
        <div style={S.header}>
          <span style={S.headerLogo}>Weldex<span style={S.headerDot}>.</span></span>
        </div>
        <div style={{ ...S.body, alignItems: 'center' }}>
          <div style={{ ...S.card, textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontWeight: 700, color: '#1a2540', fontSize: '1.25rem', marginBottom: '1rem' }}>
              ご回答ありがとうございます。
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 2 }}>
              内容を確認の上、担当の成田より<br />
              改めてご連絡いたします。
            </p>
            <a
              href="mailto:info@weldex.jp"
              style={{ display: 'inline-block', marginTop: '1.5rem', color: '#1a2540', fontWeight: 600, fontSize: '0.875rem' }}
            >
              info@weldex.jp
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      {/* ヘッダー */}
      <div style={S.header}>
        <span style={S.headerLogo}>Weldex<span style={S.headerDot}>.</span></span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
          ヒアリングシート
        </span>
      </div>

      <div style={S.body}>
        <div style={S.card}>
          <StepBar step={step} />

          {/* ─── Step 1 ─── */}
          {step === 1 && (
            <>
              <div style={S.stepTitle}>基本情報</div>
              <div style={S.stepSub}>まずは貴社・ご担当者について教えてください。</div>

              <div style={S.qBlock}>
                <div style={S.qLabel}>Q1. 会社名・屋号 <span style={S.required}>必須</span></div>
                <input
                  style={S.textInput}
                  placeholder="例：さくら歯科クリニック"
                  value={form.company}
                  onChange={e => set('company', e.target.value)}
                />
              </div>

              <div style={S.qBlock}>
                <div style={S.qLabel}>Q2. ご担当者名 <span style={S.required}>必須</span></div>
                <input
                  style={S.textInput}
                  placeholder="例：山田 太郎"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
              </div>

              <div style={S.qBlock}>
                <div style={S.qLabel}>Q3. 業種 <span style={S.required}>必須</span></div>
                <div style={S.radioGroup}>
                  {INDUSTRIES.map(ind => (
                    <Radio
                      key={ind} value={ind}
                      checked={form.industry === ind}
                      onChange={() => set('industry', ind)}
                      label={ind}
                    />
                  ))}
                </div>
                {form.industry === 'その他' && (
                  <input
                    style={{ ...S.textInput, marginTop: '0.5rem' }}
                    placeholder="業種を入力してください"
                    value={form.industry_other}
                    onChange={e => set('industry_other', e.target.value)}
                  />
                )}
              </div>

              <div style={S.qBlock}>
                <div style={S.qLabel}>Q4. 現在のHP URL <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>任意</span></div>
                <input
                  style={S.textInput}
                  placeholder="https://example.com"
                  value={form.url}
                  onChange={e => set('url', e.target.value)}
                />
              </div>

              <div style={S.qBlock}>
                <div style={S.qLabel}>Q5. Weldexをどこで知りましたか <span style={S.required}>必須</span></div>
                <div style={S.radioGroup}>
                  {SOURCES.map(s => (
                    <Radio key={s} value={s} checked={form.source === s}
                      onChange={() => set('source', s)} label={s} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── Step 2 ─── */}
          {step === 2 && (
            <>
              <div style={S.stepTitle}>現状と課題</div>
              <div style={S.stepSub}>現在のWEB・集客について教えてください。</div>

              <div style={S.qBlock}>
                <div style={S.qLabel}>Q6. 現在のHPについて（複数選択可）</div>
                <div style={S.checkGroup}>
                  {ISSUES.map(v => (
                    <Check key={v} checked={form.issues.includes(v)}
                      onChange={() => toggleArr('issues', v)} label={v} />
                  ))}
                </div>
              </div>

              <div style={S.qBlock}>
                <div style={S.qLabel}>Q7. 最も解決したい課題 <span style={S.required}>必須</span></div>
                <textarea
                  style={S.textarea}
                  placeholder="例：スマホで予約を受け付けられるようにしたい。現在電話だけで対応しているため夜間や休診日に機会損失がある。"
                  value={form.goal}
                  onChange={e => set('goal', e.target.value)}
                />
              </div>

              <div style={S.qBlock}>
                <div style={S.qLabel}>Q8. 月間問い合わせ・予約件数</div>
                <div style={S.radioGroup}>
                  {MONTHLY.map(m => (
                    <Radio key={m} value={m} checked={form.monthly === m}
                      onChange={() => set('monthly', m)} label={m} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── Step 3 ─── */}
          {step === 3 && (
            <>
              <div style={S.stepTitle}>ご要望</div>
              <div style={S.stepSub}>ご希望のサービスと予算・納期を教えてください。</div>

              <div style={S.qBlock}>
                <div style={S.qLabel}>Q9. 興味のあるサービス（複数選択可）</div>
                <div style={S.checkGroup}>
                  {SERVICES.map(v => (
                    <Check key={v} checked={form.services.includes(v)}
                      onChange={() => toggleArr('services', v)} label={v} />
                  ))}
                </div>
              </div>

              <div style={S.qBlock}>
                <div style={S.qLabel}>Q10. ご予算</div>
                <div style={S.radioGroup}>
                  {BUDGETS.map(b => (
                    <Radio key={b} value={b} checked={form.budget === b}
                      onChange={() => set('budget', b)} label={b} />
                  ))}
                </div>
              </div>

              <div style={S.qBlock}>
                <div style={S.qLabel}>Q11. ご希望納期</div>
                <div style={S.radioGroup}>
                  {DEADLINES.map(d => (
                    <Radio key={d} value={d} checked={form.deadline === d}
                      onChange={() => set('deadline', d)} label={d} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── Step 4 ─── */}
          {step === 4 && (
            <>
              <div style={S.stepTitle}>連絡先・その他</div>
              <div style={S.stepSub}>最後にご連絡先を教えてください。</div>

              <div style={S.qBlock}>
                <div style={S.qLabel}>Q12. メールアドレス <span style={S.required}>必須</span></div>
                <input
                  style={S.textInput}
                  type="email"
                  placeholder="example@company.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
              </div>

              <div style={S.qBlock}>
                <div style={S.qLabel}>Q13. 電話番号 <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>任意</span></div>
                <input
                  style={S.textInput}
                  type="tel"
                  placeholder="090-0000-0000"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                />
              </div>

              <div style={S.qBlock}>
                <div style={S.qLabel}>Q14. その他・伝えておきたいこと <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>任意</span></div>
                <textarea
                  style={S.textarea}
                  placeholder="ご質問・補足事項など何でもご記入ください。"
                  value={form.note}
                  onChange={e => set('note', e.target.value)}
                />
              </div>

              {error && (
                <p style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.5rem' }}>{error}</p>
              )}
            </>
          )}

          {/* ボタン行 */}
          <div style={S.btnRow}>
            {step > 1 && (
              <button style={S.btnBack} onClick={() => setStep(s => s - 1)}>
                ← 戻る
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                style={{ ...S.btnNext, opacity: canNext() ? 1 : 0.45 }}
                onClick={() => { if (canNext()) setStep(s => s + 1) }}
              >
                次へ →
              </button>
            ) : (
              <button
                style={{ ...S.btnNext, opacity: (canNext() && !loading) ? 1 : 0.45 }}
                onClick={() => { if (canNext() && !loading) handleSubmit() }}
              >
                {loading ? '送信中...' : '送信する'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
