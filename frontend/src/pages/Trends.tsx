import { useEffect, useRef, useState } from 'react'
import chartXkcd from 'chart.xkcd'
import { getTrends, type Trends as TrendsData } from '../data.ts'

const PALETTE = ['#e85d04', '#1e7d34', '#3a5a8a', '#9b2226', '#7b2cbf', '#0096c7', '#c9184a',
  '#5f7d00', '#bc6c25', '#118ab2', '#d62828', '#2a9d8f', '#6a4c93', '#ef476f']

const XY = chartXkcd.XY as unknown as new (svg: SVGSVGElement, config: unknown) => void
const upLeft = chartXkcd.config.positionType.upLeft

const REPO = 'hacker-job/hacker-job'
const SUGGEST_URL = `https://github.com/${REPO}/issues/new?title=${encodeURIComponent('Suggest keyword: ')}`
  + `&body=${encodeURIComponent('Add this keyword to the Trends chart.\n\nKeyword: \nWhy it matters: ')}`

// chart.xkcd sizes the SVG to its parent's width and adds no viewBox. We always
// render it at a fixed large width so the layout (fonts, ticks, spacing) is the
// desktop one, then convert that fixed pixel size into a viewBox so the SVG
// scales down proportionally on small screens via CSS.
const CHART_WIDTH = 700

function useXkcdXY(build: () => unknown | null, deps: unknown[]) {
  const ref = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    const cfg = build()
    svg.innerHTML = ''
    svg.removeAttribute('viewBox'); svg.removeAttribute('width'); svg.removeAttribute('height')
    if (!cfg) return
    // Force the parent to the fixed render width so chart.xkcd always draws the
    // large chart regardless of the actual screen size, then restore.
    const parent = svg.parentElement as HTMLElement | null
    const prevWidth = parent?.style.width ?? ''
    if (parent) parent.style.width = CHART_WIDTH + 'px'
    new XY(svg, cfg)
    if (parent) parent.style.width = prevWidth
    const w = svg.getAttribute('width'), h = svg.getAttribute('height')
    if (w && h) {
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      svg.removeAttribute('width'); svg.removeAttribute('height')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return ref
}

export default function Trends() {
  const [data, setData] = useState<TrendsData | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    getTrends().then((t) => {
      setData(t)
      setSelected(new Set(t.keywords.filter((k) => k.default).map((k) => k.key)))
    }).catch(console.error)
  }, [])

  const base = { xTickCount: 8, yTickCount: 5, timeFormat: 'YYYY-MM', showLine: true, legendPosition: upLeft }

  const salaryRef = useXkcdXY(() => !data ? null : ({
    yLabel: 'USD',
    data: { datasets: [{ label: 'Avg mid salary', data: data.salary }] },
    options: { ...base, dotSize: 0.4, dataColors: ['#e85d04'] },
  }), [data])

  const volumeRef = useXkcdXY(() => !data ? null : ({
    yLabel: 'job posts',
    data: { datasets: [{ label: 'Posts / month', data: data.volume }] },
    options: { ...base, dotSize: 0.4, dataColors: ['#3a5a8a'] },
  }), [data])

  const kwRef = useXkcdXY(() => {
    if (!data) return null
    const active = data.keywords.filter((k) => selected.has(k.key))
    if (!active.length) return null
    const colorFor = (key: string) => PALETTE[data.keywords.findIndex((k) => k.key === key) % PALETTE.length]
    return {
      yLabel: '% of jobs',
      data: { datasets: active.map((k) => ({ label: k.label, data: k.data })) },
      options: { ...base, dotSize: 0.4, dataColors: active.map((k) => colorFor(k.key)) },
    }
  }, [data, selected])

  const toggle = (key: string) => setSelected((prev) => {
    const next = new Set(prev)
    if (next.has(key)) next.delete(key); else next.add(key)
    return next
  })

  return (
    <div style={{ position: 'relative' }}>
      <h1>Trends</h1>


      <p className="sub">
        {data
          ? `Signals from ${data.meta.jobs.toLocaleString()} HN hiring posts (${data.meta.from} → ${data.meta.to})`
          : 'Loading…'}
      </p>



      <section className="panel">
        <h2>Average salary over time</h2>
        <p className="hint">USD only · months with ≥5 salary disclosures · mid = (min + max) / 2</p>
        <div className="chart-box">
          <svg ref={salaryRef} className="chart"></svg>
        </div>
      </section>

      <section className="panel">
        <h2>Job posts per month</h2>
        <p className="hint">How many "Who is Hiring?" posts each month's thread collected.</p>
        <div className="chart-box">
          <svg ref={volumeRef} className="chart"></svg>
        </div>
        <p className="note">
          <b>Mar 2020</b> — COVID-19 declared a pandemic&nbsp;&nbsp;·&nbsp;&nbsp;<b>Nov 30, 2022</b> — ChatGPT released
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
          <a className="chip suggest" href={SUGGEST_URL} target="_blank" rel="noopener">+ Suggest new keyword</a>
        </div>
        <div className="chart-box">
          <svg ref={kwRef} className="chart"></svg>
        </div>
      </section>
    </div>
  )
}
