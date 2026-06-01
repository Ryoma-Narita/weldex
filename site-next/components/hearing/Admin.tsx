'use client'

import { useState } from 'react'
import type { HearingRow } from '@/app/admin/hearing/actions'

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  initialList: HearingRow[]
  getHearings:  () => Promise<HearingRow[]>
  updateHearing: (id: number, data: { status?: string; memo?: string }) => Promise<void>
}

// ─── ステータス定義 ────────────────────────────────────────────────────────────

const STATUSES = [
  { label: '未対応',       color: '#ef4444', bg: '#fef2f2' },
  { label: '日程調整中',   color: '#f59e0b', bg: '#fffbeb' },
  { label: '提案書送付済', color: '#3b82f6', bg: '#eff6ff' },
  { label: '成約',         color: '#10b981', bg: '#ecfdf5' },
  { label: '失注',         color: '#9ca3af', bg: '#f9fafb' },
]

function statusStyle(s: string) {
  return STATUSES.find(x => x.label === s) ?? { color: '#9ca3af', bg: '#f9fafb' }
}

// ─── 日時フォーマット ─────────────────────────────────────────────────────────

function fmt(iso: string) {
  const d = new Date(iso)
  return [
    `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`,
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
  ].join(' ')
}

// ─── メインコンポーネント ─────────────────────────────────────────────────────

export default function HearingAdmin({ initialList, getHearings, updateHearing }: Props) {
  const [list, setList]             = useState<HearingRow[]>(initialList)
  const [selected, setSelected]     = useState<HearingRow | null>(null)
  const [memo, setMemo]             = useState('')
  const [loading, setLoading]       = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [saveError, setSaveError]   = useState('')
  const [saving, setSaving]         = useState(false)

  // ─── 一覧再取得 ───────────────────────────────────────────────────────────

  const loadList = () => {
    setLoading(true)
    setFetchError('')
    getHearings()
      .then((data: HearingRow[]) => setList(data))
      .catch((e: Error) => setFetchError(e.message))
      .finally(() => setLoading(false))
  }

  // ─── 選択 ─────────────────────────────────────────────────────────────────

  const select = (h: HearingRow) => {
    setSelected(h)
    setMemo(h.memo ?? '')
    setSaveError('')
  }

  // ─── ステータス更新 ───────────────────────────────────────────────────────

  const updateStatus = async (id: number, status: string) => {
    try {
      await updateHearing(id, { status })
      const patch = (h: HearingRow) => h.id === id ? { ...h, status } : h
      setList(l => l.map(patch))
      setSelected(s => s?.id === id ? { ...s, status } : s)
    } catch (e) {
      setSaveError(`ステータス更新失敗：${(e as Error).message}`)
    }
  }

  // ─── メモ保存（onBlur） ───────────────────────────────────────────────────

  const saveMemo = async () => {
    if (!selected || memo === selected.memo) return
    setSaving(true)
    setSaveError('')
    try {
      await updateHearing(selected.id, { memo })
      const patch = (h: HearingRow) => h.id === selected.id ? { ...h, memo } : h
      setList(l => l.map(patch))
      setSelected(s => s ? { ...s, memo } : s)
    } catch (e) {
      setSaveError(`メモ保存失敗：${(e as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  // ─── レンダリング ─────────────────────────────────────────────────────────

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      display: 'grid',
      gridTemplateColumns: '340px 1fr',
      height: 'calc(100vh - 60px)',
      overflow: 'hidden',
    }}>

      {/* ── 左：一覧 ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0', background: '#fff' }}>

        <div style={{
          padding: '1rem', borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontWeight: 700, color: '#1a2540', fontSize: '0.875rem' }}>
            回答一覧 <span style={{ color: '#94a3b8', fontWeight: 400 }}>({list.length}件)</span>
          </span>
          <button
            onClick={loadList}
            style={{
              border: '1px solid #e2e8f0', background: '#fff', borderRadius: 6,
              padding: '4px 10px', fontSize: '0.72rem', cursor: 'pointer', color: '#64748b',
            }}
          >
            更新
          </button>
        </div>

        {fetchError && (
          <p style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#ef4444', background: '#fef2f2' }}>
            ⚠ {fetchError}
          </p>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && (
            <p style={{ padding: '1.5rem', color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center' }}>
              読み込み中...
            </p>
          )}
          {!loading && list.length === 0 && !fetchError && (
            <p style={{ padding: '1.5rem', color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center' }}>
              回答はまだありません
            </p>
          )}
          {list.map(h => {
            const st = statusStyle(h.status)
            const isSelected = selected?.id === h.id
            return (
              <div
                key={h.id}
                onClick={() => select(h)}
                style={{
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  borderBottom: '1px solid #f1f5f9',
                  padding: '0.85rem 1rem', cursor: 'pointer',
                  background: isSelected ? '#f0f4ff' : '#fff',
                  borderLeft: `3px solid ${isSelected ? '#1a2540' : 'transparent'}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1a2540', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.company}
                    </span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, flexShrink: 0, marginLeft: 6,
                      background: st.bg, color: st.color,
                      border: `1px solid ${st.color}44`, borderRadius: 4, padding: '1px 6px',
                    }}>
                      {h.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 3 }}>
                    {h.industry} · {fmt(h.created_at)}
                  </div>
                  {h.goal && (
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.goal}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 右：詳細 ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#f8fafc', overflowY: 'auto', padding: '1.5rem' }}>
        {!selected ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>左のリストから回答を選択してください</p>
          </div>
        ) : (
          <div style={{ maxWidth: 720 }}>

            {/* エラー表示 */}
            {saveError && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8,
                padding: '0.65rem 1rem', fontSize: '0.82rem', color: '#ef4444', marginBottom: '1rem',
              }}>
                ⚠ {saveError}
              </div>
            )}

            {/* 会社名ヘッダー */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, color: '#1a2540', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                {selected.company}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
                {selected.name} · {selected.industry} · {fmt(selected.created_at)}
              </p>
            </div>

            {/* ステータス変更 */}
            <Section label="STATUS">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {STATUSES.map(st => (
                  <button
                    key={st.label}
                    onClick={() => updateStatus(selected.id, st.label)}
                    style={{
                      border: `1.5px solid ${selected.status === st.label ? st.color : '#e2e8f0'}`,
                      background: selected.status === st.label ? st.bg : '#fff',
                      color: selected.status === st.label ? st.color : '#94a3b8',
                      borderRadius: 6, padding: '5px 12px',
                      fontSize: '0.78rem', fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* 基本情報 */}
            <Section label="基本情報">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <tbody>
                  {([
                    ['担当者',  selected.name],
                    ['業種',    selected.industry_other ? `${selected.industry}（${selected.industry_other}）` : selected.industry],
                    ['HP URL',  selected.url ? <a key="url" href={selected.url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>{selected.url}</a> : '—'],
                    ['流入元',  selected.source ?? '—'],
                    ['月間件数', selected.monthly ?? '—'],
                    ['予算',    selected.budget ?? '—'],
                    ['希望納期', selected.deadline ?? '—'],
                    ['Email',   <a key="email" href={`mailto:${selected.email}`} style={{ color: '#3b82f6' }}>{selected.email}</a>],
                    ['電話',    selected.phone ?? '—'],
                  ] as [string, React.ReactNode][]).map(([lbl, val]) => (
                    <tr key={lbl} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.45rem 0', color: '#94a3b8', fontWeight: 600, width: '7rem', verticalAlign: 'top' }}>{lbl}</td>
                      <td style={{ padding: '0.45rem 0', color: '#1a2540' }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            {/* 課題タグ */}
            {selected.issues?.length > 0 && (
              <Section label="現状の課題">
                {selected.issues.map(v => <Tag key={v} label={v} color="#1a2540" bg="#f0f4ff" />)}
              </Section>
            )}

            {/* サービスタグ */}
            {selected.services?.length > 0 && (
              <Section label="興味のあるサービス">
                {selected.services.map(v => <Tag key={v} label={v} color="#3b82f6" bg="#eff6ff" />)}
              </Section>
            )}

            {/* 解決したい課題 */}
            {selected.goal && (
              <Section label="解決したい課題">
                <p style={{ fontSize: '0.875rem', color: '#1a2540', lineHeight: 1.8, margin: 0 }}>{selected.goal}</p>
              </Section>
            )}

            {/* 顧客メモ */}
            {selected.note && (
              <Section label="その他メモ（顧客記入）">
                <p style={{ fontSize: '0.875rem', color: '#1a2540', lineHeight: 1.8, margin: 0 }}>{selected.note}</p>
              </Section>
            )}

            {/* 商談メモ */}
            <Section label={`商談メモ${saving ? '　保存中...' : ''}`}>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                onBlur={saveMemo}
                placeholder="商談内容・次のアクション・その他メモを入力..."
                style={{
                  width: '100%', minHeight: 120,
                  border: '1.5px solid #e2e8f0', borderRadius: 8,
                  padding: '0.65rem 0.85rem', fontSize: '0.875rem',
                  fontFamily: 'inherit', color: '#1a2540',
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '4px 0 0' }}>
                フォーカスを外すと保存されます
              </p>
            </Section>

          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tag ─────────────────────────────────────────────────────────────────────

function Tag({ label, color = '#1a2540', bg = '#e8f0fe' }: {
  label: string; color?: string; bg?: string
}) {
  return (
    <span style={{
      display: 'inline-block',
      background: bg, color, border: `1px solid ${color}22`,
      borderRadius: 4, fontSize: '0.72rem', fontWeight: 600,
      padding: '2px 8px', marginRight: 4, marginBottom: 4,
    }}>
      {label}
    </span>
  )
}

// ─── Section カード ───────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '0.65rem', textTransform: 'uppercase' }}>
        {label}
      </div>
      {children}
    </div>
  )
}
