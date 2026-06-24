import { NavLink } from 'react-router-dom'

const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined)

export function Nav() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="brand">
          <svg className="mark" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="hacker·job logo">
            <rect width="32" height="32" rx="7" fill="#e85d04" />
            <path d="M10 10 L16 16 L10 22" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 22 H23" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
          <span>hacker<b>·</b>job</span>
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/hackers" className={navClass}>Hackers</NavLink>
          <NavLink to="/" end className={navClass}>Jobs</NavLink>
          <NavLink to="/trends" className={navClass}>Trends</NavLink>
        </nav>
      </div>
    </header>
  )
}
