import { useEffect, useState } from 'react'
import { getHackers, type Hacker } from '../data.ts'

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

export default function Hackers() {
  const [hackers, setHackers] = useState<Hacker[] | null>(null)

  useEffect(() => {
    getHackers().then(setHackers).catch((e) => { console.error(e); setHackers([]) })
  }, [])

  return (
    <>
      <h1>Hackers</h1>
      <p className="sub">Talented people who back hacker·job. Reach out, collaborate, or hire them.</p>

      {hackers && hackers.length > 0 ? (
        <div className="hackers-grid">{hackers.map((h) => <HackerCard key={h.login} h={h} />)}</div>
      ) : (
        <div className="empty">
          <div className="empty-icon">🧑‍💻</div>
          <p>No hackers listed yet.</p>
          <p className="sub">Sponsors will appear here soon — be the first!</p>
        </div>
      )}

      <section className="join">
        <h2>Get listed here</h2>
        <ol className="steps">
          <li><a href="https://github.com/sponsors/timqian" target="_blank" rel="noopener">Sponsor <b>timqian</b></a> on GitHub.</li>
          <li>Your info will appear here soon. ✨</li>
        </ol>
      </section>
    </>
  )
}
