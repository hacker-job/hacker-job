import { useEffect, useState } from 'react'
import { marked } from 'marked'
import { getFounder, getHackers, type Founder, type Hacker } from '../data.ts'
import GitHubButton from 'react-github-btn'
function HackerCard({ h }: { h: Hacker }) {
  const url = h.url || 'https://github.com/' + h.login
  const avatar = h.avatar || 'https://github.com/' + h.login + '.png'
  return (
    <a className="hacker" href={url} target="_blank" rel="noopener">
      <img src={avatar} alt={h.login} loading="lazy" />
      <div className="h-name">{h.name || h.login}</div>
      <div className="h-login">@{h.login}</div>
      {h.bio && <div className="h-bio">{h.bio}</div>}
    </a>
  )
}

function href(blog: string) {
  return /^https?:\/\//.test(blog) ? blog : 'https://' + blog
}

function FounderCard({ f }: { f: Founder }) {
  return (
    <section className="founder">
      <div className="founder-head">
        <img src={f.avatar} alt={f.login} />
        <div>
          <div className="founder-name">
            {f.name || f.login}{' '}
            <a href={f.html_url} target="_blank" rel="noopener">@{f.login}</a>
          </div>
          {f.bio && <div className="founder-bio">{f.bio}</div>}
          <div className="founder-links">
            {f.location && <span>📍 {f.location}</span>}
            {f.company && <span>🏢 {f.company}</span>}
            {f.blog && <a href={href(f.blog)} target="_blank" rel="noopener">🔗 {f.blog}</a>}
            {f.twitter && <a href={`https://x.com/${f.twitter}`} target="_blank" rel="noopener">𝕏 @{f.twitter}</a>}
            <span>★ {f.followers.toLocaleString()} followers</span>
          </div>
        </div>
      </div>
      {f.readme && (
        <div className="md" dangerouslySetInnerHTML={{ __html: marked.parse(f.readme) as string }} />
      )}
    </section>
  )
}

export default function Hackers() {
  const [founder, setFounder] = useState<Founder | null>(null)
  const [hackers, setHackers] = useState<Hacker[]>([])

  useEffect(() => {
    getFounder().then(setFounder).catch(console.error)
    getHackers().then(setHackers).catch(() => setHackers([]))
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <h1>Hackers</h1>
      <p className="sub">Talented people who back hacker·job. Reach out, collaborate, or hire them.</p>
      <div style={{ position: 'absolute', top: 0, right: 0, margin: '8px 12px 0 0' }}>
        <GitHubButton href="https://github.com/hacker-job/hacker-job-trends" data-color-scheme="no-preference: light; light: light; dark: dark;" data-size="large" data-show-count="true" aria-label="Star hacker-job/hacker-job-trends on GitHub">Star</GitHubButton>
      </div>
      {founder && <FounderCard f={founder} />}

      {hackers.length > 0 && (
        <div className="hackers-grid">{hackers.map((h) => <HackerCard key={h.login} h={h} />)}</div>
      )}

      <section className="join">
        <h2>Get listed here</h2>
        <ol className="steps">
          <li><a href="https://github.com/sponsors/timqian" target="_blank" rel="noopener">Sponsor <b>timqian</b></a> on GitHub.</li>
          <li>Your info will appear here soon. ✨</li>
        </ol>
      </section>
    </div>
  )
}
