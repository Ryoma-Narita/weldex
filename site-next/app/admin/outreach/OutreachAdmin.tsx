'use client'

import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  DEFAULT_INDUSTRIES, HP_LEVEL_LABEL, ALL_PREFECTURES, PREFECTURES, getTemplate,
  type IndustryConfig, type Company, type HistoryRecord, type Pattern,
} from '@/data/outreach'

// ─── Styles ───────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 4,
  padding: '1.5rem', marginBottom: '1.5rem',
}
const sectionTitle: React.CSSProperties = {
  fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem',
  display: 'flex', alignItems: 'center', gap: '0.5rem',
}
const label: React.CSSProperties = {
  fontSize: '0.78rem', color: 'var(--gray)', fontWeight: 500,
}
const input: React.CSSProperties = {
  border: '1px solid var(--border)', padding: '0.5rem 0.75rem',
  fontSize: '0.875rem', color: 'var(--navy)', outline: 'none',
  fontFamily: 'inherit', borderRadius: 2, background: '#fff',
}
const btn = (variant: 'primary' | 'outline' | 'danger' = 'outline'): React.CSSProperties => ({
  padding: '0.6rem 1.25rem', fontSize: '0.82rem', fontWeight: 500,
  cursor: 'pointer', border: 'none', borderRadius: 2, fontFamily: 'inherit',
  background: variant === 'primary' ? 'var(--gold)' : variant === 'danger' ? '#dc2626' : '#fff',
  color: variant === 'primary' ? 'var(--navy)' : variant === 'danger' ? '#fff' : 'var(--navy)',
  ...(variant === 'outline' ? { border: '1px solid var(--border)' } : {}),
})
const toggle = (on: boolean): React.CSSProperties => ({
  width: 36, height: 20, borderRadius: 10, cursor: 'pointer', border: 'none',
  background: on ? 'var(--gold)' : 'var(--border)', position: 'relative',
  transition: 'background 0.2s', flexShrink: 0,
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LS_INDUSTRIES = 'weldex_outreach_industries'
const LS_HISTORY    = 'weldex_outreach_history'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function hpLabel(level: number) {
  return HP_LEVEL_LABEL[level] ?? '?'
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function OutreachAdmin() {
  // § Industries
  const [industries, setIndustries] = useState<IndustryConfig[]>(DEFAULT_INDUSTRIES)

  // § HP Filter
  const [hpFilter, setHpFilter] = useState<'1' | '12' | '123' | 'all'>('1')

  // § Area
  const [prefecture, setPrefecture] = useState('千葉県')
  const [selectedCities, setSelectedCities] = useState<string[]>(['市原市'])
  const [customCity, setCustomCity] = useState('')

  // § Send settings
  const [pattern, setPattern] = useState<Pattern>('A')
  const [sendCount, setSendCount] = useState(10)

  // § Companies
  const [companies, setCompanies] = useState<Company[]>([])
  const [isCollecting, setIsCollecting] = useState(false)

  // § Send modal
  const [showModal, setShowModal] = useState(false)
  const [modalCompanies, setModalCompanies] = useState<Company[]>([])

  // § History
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [hFilter, setHFilter] = useState({ industry: '', period: '', replied: '' })

  // § Load from localStorage
  useEffect(() => {
    try {
      const ind = localStorage.getItem(LS_INDUSTRIES)
      if (ind) setIndustries(JSON.parse(ind))
      const hist = localStorage.getItem(LS_HISTORY)
      if (hist) setHistory(JSON.parse(hist))
    } catch { /* ignore */ }
  }, [])

  // § Save industries to localStorage
  useEffect(() => {
    localStorage.setItem(LS_INDUSTRIES, JSON.stringify(industries))
  }, [industries])

  // ─── Drag & Drop ──────────────────────────────────────────────────────────

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return
    const arr = [...industries]
    const [moved] = arr.splice(result.source.index, 1)
    arr.splice(result.destination.index, 0, moved)
    setIndustries(arr)
  }, [industries])

  const toggleIndustry = (id: string) => {
    setIndustries((prev) => prev.map((i) => i.id === id ? { ...i, enabled: !i.enabled } : i))
  }

  // ─── Area ─────────────────────────────────────────────────────────────────

  const cities = PREFECTURES[prefecture] ?? []
  const toggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    )
  }
  const addCustomCity = () => {
    const c = customCity.trim()
    if (c && !selectedCities.includes(c)) {
      setSelectedCities((prev) => [...prev, c])
    }
    setCustomCity('')
  }
  const removeCity = (city: string) => setSelectedCities((prev) => prev.filter((c) => c !== city))

  // ─── Collect ──────────────────────────────────────────────────────────────

  const collect = async () => {
    setIsCollecting(true)
    try {
      // Placeholder: in production, call the local outreach Python API
      // e.g. POST http://localhost:8000/api/collect { industries, areas }
      await new Promise((r) => setTimeout(r, 1500))

      // Mock result for UI demonstration
      const enabledInds = industries.filter((i) => i.enabled)
      const mock: Company[] = enabledInds.slice(0, 6).map((ind, i) => ({
        id: uid(),
        name: `サンプル企業${i + 1}`,
        industryId: ind.id,
        industryLabel: ind.label,
        website: i % 3 === 0 ? undefined : `https://example${i}.co.jp`,
        email: `info@example${i}.co.jp`,
        address: `${prefecture}${selectedCities[0] ?? ''}`,
        hpLevel: ([1, 2, 0, 1, 3, 2][i] as 0 | 1 | 2 | 3),
        score: 14 - i,
      }))
      setCompanies(mock)
    } finally {
      setIsCollecting(false)
    }
  }

  // ─── Send Preview Modal ───────────────────────────────────────────────────

  const openModal = () => {
    const filtered = companies
      .filter((c) => !c.excluded)
      .filter((c) => {
        if (hpFilter === '1')   return c.hpLevel === 1
        if (hpFilter === '12')  return c.hpLevel <= 2
        if (hpFilter === '123') return c.hpLevel <= 3
        return true
      })
      .slice(0, sendCount)
    setModalCompanies(filtered.map((c) => ({ ...c, excluded: false })))
    setShowModal(true)
  }

  const toggleModalExclude = (id: string) => {
    setModalCompanies((prev) =>
      prev.map((c) => c.id === id ? { ...c, excluded: !c.excluded } : c)
    )
  }

  const executeSend = () => {
    const toSend = modalCompanies.filter((c) => !c.excluded)
    const pickedPattern: 'A' | 'B' | 'C' = pattern === 'random'
      ? (['A', 'B', 'C'] as const)[Math.floor(Math.random() * 3)]
      : pattern

    const newRecords: HistoryRecord[] = toSend.map((c) => ({
      id: uid(),
      date: new Date().toISOString().slice(0, 10),
      companyName: c.name,
      industryId: c.industryId,
      industryLabel: c.industryLabel,
      hpStatus: hpLabel(c.hpLevel),
      pattern: pickedPattern,
      replied: 'none',
      memo: '',
    }))

    const updated = [...newRecords, ...history]
    setHistory(updated)
    localStorage.setItem(LS_HISTORY, JSON.stringify(updated))
    setShowModal(false)
    alert(`${toSend.length}社への送信をキューに追加しました。`)
  }

  // ─── History ──────────────────────────────────────────────────────────────

  const updateReply = (id: string, replied: HistoryRecord['replied']) => {
    const updated = history.map((h) => h.id === id ? { ...h, replied } : h)
    setHistory(updated)
    localStorage.setItem(LS_HISTORY, JSON.stringify(updated))
  }

  const filteredHistory = history.filter((h) => {
    if (hFilter.industry && h.industryId !== hFilter.industry) return false
    if (hFilter.replied && h.replied !== hFilter.replied) return false
    if (hFilter.period) {
      const days = parseInt(hFilter.period)
      const from = new Date()
      from.setDate(from.getDate() - days)
      if (new Date(h.date) < from) return false
    }
    return true
  })

  // ─── Stats ────────────────────────────────────────────────────────────────

  const totalSent = history.length
  const totalReplied = history.filter((h) => h.replied === 'yes').length
  const replyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0

  const byIndustry = Object.fromEntries(
    DEFAULT_INDUSTRIES.map((ind) => {
      const sent = history.filter((h) => h.industryId === ind.id)
      const replied = sent.filter((h) => h.replied === 'yes').length
      return [ind.id, { label: ind.label, sent: sent.length, replied, rate: sent.length > 0 ? Math.round((replied / sent.length) * 100) : 0 }]
    })
  )
  const industryChartData = Object.values(byIndustry)
    .filter((d) => d.sent > 0)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 8)

  const byPattern = (['A', 'B', 'C'] as const).map((p) => {
    const sent = history.filter((h) => h.pattern === p)
    const replied = sent.filter((h) => h.replied === 'yes').length
    return { name: `Pattern ${p}`, sent: sent.length, replied, rate: sent.length > 0 ? Math.round((replied / sent.length) * 100) : 0 }
  })

  // ─── Template Preview ─────────────────────────────────────────────────────

  const [previewIndustry, setPreviewIndustry] = useState('dentist')
  const [previewPattern, setPreviewPattern] = useState<'A' | 'B' | 'C'>('A')
  const previewTemplate = getTemplate(previewIndustry, previewPattern)

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off)', paddingTop: '7rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 1.25rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="sec-label">Outreach</div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 700, color: 'var(--navy)' }}>
            営業自動化ダッシュボード
          </h1>
        </div>

        {/* ①  業種設定 */}
        <div style={card}>
          <div style={sectionTitle}>① 業種ターゲット設定</div>
          <p style={{ fontSize: '0.78rem', color: 'var(--gray)', marginBottom: '1rem' }}>
            ドラッグで優先順位を変更。有効な業種のみ収集・送信対象になります。
          </p>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="industries">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {industries.map((ind, index) => (
                    <Draggable key={ind.id} draggableId={ind.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.6rem 0.75rem', marginBottom: 4,
                            background: snapshot.isDragging ? '#f0f4ff' : ind.enabled ? '#fff' : '#f8f9fc',
                            border: '1px solid var(--border)', borderRadius: 2,
                            opacity: ind.enabled ? 1 : 0.5,
                            ...provided.draggableProps.style,
                          }}
                        >
                          <span
                            {...provided.dragHandleProps}
                            style={{ cursor: 'grab', color: 'var(--light)', fontSize: '1rem', lineHeight: 1 }}
                          >
                            ⠿
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--light)', minWidth: 20, textAlign: 'right' }}>
                            {index + 1}
                          </span>
                          <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--navy)' }}>
                            {ind.label}
                          </span>
                          <button
                            style={toggle(ind.enabled)}
                            onClick={() => toggleIndustry(ind.id)}
                            aria-label={ind.enabled ? '無効にする' : '有効にする'}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* ②  HP フィルター */}
        <div style={card}>
          <div style={sectionTitle}>② HP状況フィルター</div>
          {([
            ['1',   'HPなし企業のみ（レベル1・最優先）'],
            ['12',  'HP実質なし含む（レベル1+2）'],
            ['123', 'スマホ非対応含む（レベル1+2+3）'],
            ['all', '全企業'],
          ] as const).map(([val, lbl]) => (
            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="radio" name="hpFilter" value={val} checked={hpFilter === val} onChange={() => setHpFilter(val)} />
              {lbl}
            </label>
          ))}
        </div>

        {/* ③  エリア設定 */}
        <div style={card}>
          <div style={sectionTitle}>③ エリア設定</div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ ...label, marginBottom: '0.4rem' }}>都道府県</div>
            <select
              value={prefecture}
              onChange={(e) => { setPrefecture(e.target.value); setSelectedCities([]) }}
              style={{ ...input, width: 180 }}
            >
              {ALL_PREFECTURES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>

          {cities.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ ...label, marginBottom: '0.5rem' }}>市区町村</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {cities.map((city) => (
                  <label key={city} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={selectedCities.includes(city)} onChange={() => toggleCity(city)} />
                    {city}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
            <input
              style={{ ...input, flex: 1 }}
              placeholder="市区町村を直接入力して追加"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomCity()}
            />
            <button style={btn('outline')} onClick={addCustomCity}>追加</button>
          </div>

          {selectedCities.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {selectedCities.map((city) => (
                <span key={city} style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.2rem 0.6rem', background: 'var(--navy)', color: '#fff',
                  borderRadius: 999, fontSize: '0.78rem',
                }}>
                  {prefecture} {city}
                  <button
                    onClick={() => removeCity(city)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', lineHeight: 1, padding: 0 }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ④  送信設定 */}
        <div style={card}>
          <div style={sectionTitle}>④ 送信設定</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <div style={{ ...label, marginBottom: '0.5rem' }}>メールパターン</div>
              {([
                ['A',      'Pattern A — 課題訴求型'],
                ['B',      'Pattern B — デモ訴求型'],
                ['C',      'Pattern C — コスト比較型'],
                ['random', 'ランダム（ABテスト用）'],
              ] as const).map(([val, lbl]) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input type="radio" name="pattern" value={val} checked={pattern === val} onChange={() => setPattern(val)} />
                  {lbl}
                </label>
              ))}
            </div>
            <div>
              <div style={{ ...label, marginBottom: '0.4rem' }}>1回の送信数（最大50）</div>
              <input
                type="number" min={1} max={50}
                value={sendCount}
                onChange={(e) => setSendCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                style={{ ...input, width: 100 }}
              />
            </div>
          </div>

          {/* Template Preview */}
          <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--off)', border: '1px solid var(--border)', borderRadius: 2 }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <select value={previewIndustry} onChange={(e) => setPreviewIndustry(e.target.value)} style={{ ...input, fontSize: '0.78rem' }}>
                {industries.filter((i) => i.enabled).map((i) => (
                  <option key={i.id} value={i.id}>{i.label}</option>
                ))}
              </select>
              {(['A', 'B', 'C'] as const).map((p) => (
                <button key={p} onClick={() => setPreviewPattern(p)} style={{ ...btn(previewPattern === p ? 'primary' : 'outline'), padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                  Pattern {p}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray)', marginBottom: '0.25rem' }}>
              件名：<strong style={{ color: 'var(--navy)' }}>{previewTemplate.subject}</strong>
            </div>
            <pre style={{ fontSize: '0.75rem', color: 'var(--gray)', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7, margin: 0 }}>
              {previewTemplate.body}
            </pre>
          </div>
        </div>

        {/* ⑤  企業リスト収集 */}
        <div style={card}>
          <div style={sectionTitle}>⑤ 企業リスト収集</div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
            <button style={btn('primary')} onClick={collect} disabled={isCollecting}>
              {isCollecting ? '収集中…' : 'リスト収集'}
            </button>
            {companies.length > 0 && (
              <span style={{ fontSize: '0.78rem', color: 'var(--gray)' }}>{companies.length}件収集済み</span>
            )}
          </div>

          {companies.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: 'var(--off)', borderBottom: '1px solid var(--border)' }}>
                    {['スコア', '企業名', '業種', 'HP状況', 'メール', '除外'].map((h) => (
                      <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--gray)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', opacity: c.excluded ? 0.4 : 1 }}>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'var(--gold)', fontWeight: 600 }}>{c.score}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>{c.name}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'var(--gray)' }}>{c.industryLabel}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>{hpLabel(c.hpLevel)}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'var(--gray)' }}>{c.email ?? '—'}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <input type="checkbox" checked={!!c.excluded}
                          onChange={() => setCompanies((prev) => prev.map((x) => x.id === c.id ? { ...x, excluded: !x.excluded } : x))} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {companies.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <button style={btn('primary')} onClick={openModal}>
                {sendCount}社に送信する
              </button>
            </div>
          )}
        </div>

        {/* ⑥  送信履歴 */}
        <div style={card}>
          <div style={sectionTitle}>⑥ 送信履歴</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <select value={hFilter.industry} onChange={(e) => setHFilter((f) => ({ ...f, industry: e.target.value }))} style={{ ...input, fontSize: '0.78rem' }}>
              <option value="">業種：すべて</option>
              {DEFAULT_INDUSTRIES.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
            </select>
            <select value={hFilter.period} onChange={(e) => setHFilter((f) => ({ ...f, period: e.target.value }))} style={{ ...input, fontSize: '0.78rem' }}>
              <option value="">期間：すべて</option>
              <option value="7">直近7日</option>
              <option value="30">直近30日</option>
              <option value="90">直近90日</option>
            </select>
            <select value={hFilter.replied} onChange={(e) => setHFilter((f) => ({ ...f, replied: e.target.value }))} style={{ ...input, fontSize: '0.78rem' }}>
              <option value="">返信：すべて</option>
              <option value="yes">返信あり</option>
              <option value="none">未返信</option>
              <option value="unnecessary">不要</option>
            </select>
          </div>

          {filteredHistory.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--light)' }}>履歴がありません</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: 'var(--off)', borderBottom: '1px solid var(--border)' }}>
                    {['日付', '企業名', '業種', 'HP状況', 'Pattern', '返信', 'メモ'].map((h) => (
                      <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--gray)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((h) => (
                    <tr key={h.id} style={{ borderBottom: '1px solid var(--border)', background: h.replied === 'yes' ? '#f0fdf4' : undefined }}>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'var(--light)' }}>{h.date}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>{h.companyName}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: 'var(--gray)' }}>{h.industryLabel}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>{h.hpStatus}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>{h.pattern}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <select
                          value={h.replied}
                          onChange={(e) => updateReply(h.id, e.target.value as HistoryRecord['replied'])}
                          style={{ ...input, fontSize: '0.75rem', padding: '0.25rem 0.4rem' }}
                        >
                          <option value="none">未</option>
                          <option value="yes">有</option>
                          <option value="unnecessary">不要</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <input
                          style={{ ...input, fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: 120 }}
                          value={h.memo}
                          onChange={(e) => {
                            const updated = history.map((x) => x.id === h.id ? { ...x, memo: e.target.value } : x)
                            setHistory(updated)
                            localStorage.setItem(LS_HISTORY, JSON.stringify(updated))
                          }}
                          placeholder="メモ"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ⑦  統計 */}
        <div style={card}>
          <div style={sectionTitle}>⑦ 統計サマリー</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: '総送信数', value: totalSent },
              { label: '返信数', value: totalReplied },
              { label: '返信率', value: `${replyRate}%` },
              { label: '業種数（送信済み）', value: Object.values(byIndustry).filter((d) => d.sent > 0).length },
            ].map(({ label: l, value }) => (
              <div key={l} style={{ padding: '1rem', background: 'var(--off)', border: '1px solid var(--border)', borderRadius: 2, textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-cormorant)' }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gray)', marginTop: '0.25rem' }}>{l}</div>
              </div>
            ))}
          </div>

          {industryChartData.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ ...label, marginBottom: '0.5rem' }}>業種別返信率</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={industryChartData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="rate" radius={[0, 2, 2, 0]}>
                    {industryChartData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#c9a84c' : '#0c1a35'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ ...label, marginBottom: '0.5rem' }}>パターン別返信率</div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {byPattern.map((p) => (
              <div key={p.name} style={{ padding: '0.75rem 1rem', background: 'var(--off)', border: '1px solid var(--border)', borderRadius: 2, minWidth: 100 }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>{p.rate}%</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gray)' }}>{p.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--light)' }}>{p.replied}/{p.sent}件</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── 送信確認モーダル ─────────────────────────────────────────── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
        }}>
          <div style={{ background: '#fff', borderRadius: 4, maxWidth: 680, width: '100%', maxHeight: '80vh', overflow: 'auto', padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--navy)' }}>
              送信確認
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray)', marginBottom: '1rem' }}>
              {modalCompanies.filter((c) => !c.excluded).length}社に送信します。除外する場合はチェックを入れてください。
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '1rem' }}>
              <thead>
                <tr style={{ background: 'var(--off)', borderBottom: '1px solid var(--border)' }}>
                  {['企業名', '業種', 'HP状況', '除外'].map((h) => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 500, color: 'var(--gray)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modalCompanies.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', opacity: c.excluded ? 0.4 : 1 }}>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{c.name}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--gray)' }}>{c.industryLabel}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{hpLabel(c.hpLevel)}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <input type="checkbox" checked={!!c.excluded} onChange={() => toggleModalExclude(c.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button style={btn('outline')} onClick={() => setShowModal(false)}>キャンセル</button>
              <button style={btn('primary')} onClick={executeSend}>
                送信実行（{modalCompanies.filter((c) => !c.excluded).length}社）
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
