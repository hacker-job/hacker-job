import { useEffect, useRef, useState } from 'react'
import { getTrends, type Trends as TrendsData } from '../data.ts'

declare global {
  interface Window { chartXkcd: any }
}

const PALETTE = ['#e85d04', '#1e7d34', '#3a5a8a', '#9b2226', '#7b2cbf', '#0096c7', '#c9184a',
  '#5f7d00', '#bc6c25', '#118ab2', '#d62828', '#2a9d8f', '#6a4c93', '#ef476f']

export default function Trends() {
  const [data, setData] = useState<TrendsData | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const salaryRef = useRef<SVGSVGElement>(null)
  const kwRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    getTrends().then((t) => {
      setData(t)
      setSelected(new Set(t.keywords.filter((k) => k.default).map((k) => k.key)))
    }).catch(console.error)
  }, [])

  // Salary chart — draw once when data arrives.
  useEffect(() => {
    const xkcd = window.chartXkcd
    if (!data || !salaryRef.current || !xkcd) return
    salaryRef.current.innerHTML = ''
    new xkcd.XY(salaryRef.current, {
      yLabel: 'USD',
      data: { datasets: [{ label: 'Avg mid salary', data: data.salary }] },
      options: { xTickCount: 8, yTickCount: 5, timeFormat: 'YYYY-MM', showLine: true, dotSize: 0.4,
        legendPosition: xkcd.config.positionType.upLeft, dataColors: ['#e85d04'] },
    })
  }, [data])

  // Keyword chart — redraw when the selection changes.
  useEffect(() => {
    const xkcd = window.chartXkcd
    if (!data || !kwRef.current || !xkcd) return
    kwRef.current.innerHTML = ''
    const active = data.keywords.filter((k) => selected.has(k.key))
    if (!active.length) return
    const colorFor = (key: string) => PALETTE[data.keywords.findIndex((k) => k.key === key) % PALETTE.length]
    new xkcd.XY(kwRef.current, {
      yLabel: '% of jobs',
      data: { datasets: active.map((k) => ({ label: k.label, data: k.data })) },
      options: { xTickCount: 8, yTickCount: 5, timeFormat: 'YYYY-MM', showLine: true, dotSize: 0,
        legendPosition: xkcd.config.positionType.upLeft, dataColors: active.map((k) => colorFor(k.key)) },
    })
  }, [data, selected])

  const toggle = (key: string) => setSelected((prev) => {
    const next = new Set(prev)
    if (next.has(key)) next.delete(key); else next.add(key)
    return next
  })

  return (
    <>
      <h1>Trends</h1>
      <p className="sub">
        {data
          ? `Signals from ${data.meta.months} months of HN hiring posts (${data.meta.from} → ${data.meta.to})`
          : 'Loading…'}
      </p>

      <section className="panel">
        <h2>Average salary over time</h2>
        <p className="hint">USD only · months with ≥5 salary disclosures · mid = (min + max) / 2</p>
        <svg ref={salaryRef} className="chart"></svg>
      </section>

      <section className="panel">
        <h2>Keyword popularity</h2>
        <p className="hint">% of each month's jobs mentioning the keyword. Toggle keywords to compare.</p>
        <div className="chips">
          {data?.keywords.map((k) => (
            <button key={k.key} className={'chip' + (selected.has(k.key) ? ' on' : '')} onClick={() => toggle(k.key)}>
              {k.label}
            </button>
          ))}
        </div>
        <svg ref={kwRef} className="chart"></svg>
      </section>
    </>
  )
}
