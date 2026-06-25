import { useEffect, useState } from 'react'
import { marked } from 'marked'
import { getHackers, type Hacker } from '../data.ts'

function href(blog: string) {
  return /^https?:\/\//.test(blog) ? blog : 'https://' + blog
}

function HackerCard({ h }: { h: Hacker }) {
  const url = h.url || 'https://github.com/' + h.login
  const avatar = h.avatar || 'https://github.com/' + h.login + '.png'
  return (
    <section className="hacker">
      <a className="hacker-head" href={url} target="_blank" rel="noopener">
        <img src={avatar} alt={h.login} loading="lazy" />
        <div className="h-text">
          <div className="h-name">{h.name || h.login}</div>
          <div className="h-login">@{h.login}</div>
        </div>
      </a>
      {h.bio && <div className="h-bio">{h.bio}</div>}
      {(h.location || h.blog || h.twitter) && (
        <div className="h-meta">
          {h.location && <span>📍 {h.location}</span>}
          {h.blog && <a href={href(h.blog)} target="_blank" rel="noopener">🔗 {h.blog}</a>}
          {h.twitter && <a href={`https://x.com/${h.twitter}`} target="_blank" rel="noopener">𝕏 @{h.twitter}</a>}
        </div>
      )}
      {h.readme && (
        <div className="md" dangerouslySetInnerHTML={{ __html: marked.parse(h.readme) as string }} />
      )}
    </section>
  )
}

export default function Hackers() {
  const [hackers, setHackers] = useState<Hacker[]>([])

  useEffect(() => {
    getHackers().then(setHackers).catch(() => setHackers([]))
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <h1>Hackers</h1>
      <p className="sub">Talented people who back hacker·job. Reach out, collaborate, or hire them.</p>

      <div className="hackers-grid">
        {hackers.map((h) => <HackerCard key={h.login} h={h} />)}
        <section className="hacker hacker-join">
          <h2>Get listed here</h2>
          <ol className="steps">
            <li>Sponsor hacker-job or <a href="https://github.com/sponsors/timqian" target="_blank" rel="noopener">timqian</a> on GitHub.</li>
            <li>Have <code>work with me</code> or <code>hire me</code> on your GitHub profile README (e.g. <a href="https://github.com/timqian/timqian" target="_blank" rel="noopener">timqian/timqian</a>).</li>
            <li>Your info will appear here soon. ✨</li>
          </ol>
        </section>
      </div>
    </div>
  )
}
