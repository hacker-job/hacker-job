import { useEffect, useRef, useState } from 'react'
import chartXkcd from 'chart.xkcd'
import { getTrends, type Trends as TrendsData } from '../data.ts'

const PALETTE = ['#e85d04', '#1e7d34', '#3a5a8a', '#9b2226', '#7b2cbf', '#0096c7', '#c9184a',
  '#5f7d00', '#bc6c25', '#118ab2', '#d62828', '#2a9d8f', '#6a4c93', '#ef476f']

const XY = chartXkcd.XY as unknown as new (svg: SVGSVGElement, config: unknown) => void
const upLeft = chartXkcd.config.positionType.upLeft

export default function Trends() {
  const [data, setData] = useState<TrendsData | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const volumeRef = useRef<SVGSVGElement>(null)
  const salaryRef = useRef<SVGSVGElement>(null)
  const kwRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    getTrends().then((t) => {
      setData(t)
      setSelected(new Set(t.keywords.filter((k) => k.default).map((k) => k.key)))
    }).catch(console.error)
  }, [])

  // Volume + salary charts — draw once when data arrives.
  useEffect(() => {
    if (!data) return
    if (volumeRef.current) {
      volumeRef.current.innerHTML = ''
      new XY(volumeRef.current, {
        yLabel: 'job posts',
        data: { datasets: [{ label: 'Posts / month', data: data.volume }] },
        options: { xTickCount: 8, yTickCount: 5, timeFormat: 'YYYY-MM', showLine: true, dotSize: 0,
          legendPosition: upLeft, dataColors: ['#3a5a8a'] },
      })
    }
    if (salaryRef.current) {
      salaryRef.current.innerHTML = ''
      new XY(salaryRef.current, {
        yLabel: 'USD',
        data: { datasets: [{ label: 'Avg mid salary', data: data.salary }] },
        options: { xTickCount: 8, yTickCount: 5, timeFormat: 'YYYY-MM', showLine: true, dotSize: 0.4,
          legendPosition: upLeft, dataColors: ['#e85d04'] },
      })
    }
  }, [data])

  // Keyword chart — redraw when the selection changes.
  useEffect(() => {
    if (!data || !kwRef.current) return
    kwRef.current.innerHTML = ''
    const active = data.keywords.filter((k) => selected.has(k.key))
    if (!active.length) return
    const colorFor = (key: string) => PALETTE[data.keywords.findIndex((k) => k.key === key) % PALETTE.length]
    new XY(kwRef.current, {
      yLabel: '% of jobs',
      data: { datasets: active.map((k) => ({ label: k.label, data: k.data })) },
      options: { xTickCount: 8, yTickCount: 5, timeFormat: 'YYYY-MM', showLine: true, dotSize: 0,
        legendPosition: upLeft, dataColors: active.map((k) => colorFor(k.key)) },
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
        <h2>Job posts per month</h2>
        <p className="hint">How many "Who is Hiring?" posts each month's thread collected.</p>
        <svg ref={volumeRef} className="chart"></svg>
        <p className="note">
          Hiring ran hot through <b>2018</b> and the <b>2021</b> boom (~840 posts/month), with a clear dip in
          <b> April 2020</b> as COVID hit. It then more than halved through <b>2022–2023</b> — the tech-layoff and
          rate-hike pullback, the same window <b>ChatGPT</b> launched (Nov 2022) — and has hovered near
          <b> ~330/month</b> since. So the recent drop tracks the macro downturn; whether AI is also denting demand
          is suggestive but not separable from it here.
        </p>
      </section>

      <section className="panel">
        <h2>Average salary over time</h2>
        <p className="hint">USD only · months with ≥5 salary disclosures · mid = (min + max) / 2</p>
        <svg ref={salaryRef} className="chart"></svg>
        <p className="note">
          Disclosed salaries trend steadily up — roughly <b>$100k (2015) → $175k (2026)</b>, about <b>+75%</b> over the
          decade, accelerating after the 2021 remote-hiring boom even as the <i>number</i> of postings fell. Early-year
          points are based on few disclosures, so read pre-2016 loosely.
        </p>
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
        <p className="note">
          Toggle stacks to compare trajectories. The clearest recent shift is the climb in <b>AI / LLM</b> mentions over
          the last few years; the big web frameworks have largely plateaued.
        </p>
      </section>
    </>
  )
}
