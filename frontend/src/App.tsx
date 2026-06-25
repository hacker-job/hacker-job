import { Routes, Route } from 'react-router-dom'
import { Nav } from './components/Nav.tsx'
import { Footer } from './components/Footer.tsx'
import Jobs from './pages/Jobs.tsx'
import Trends from './pages/Trends.tsx'
import Hackers from './pages/Hackers.tsx'

export default function App() {
  return (
    <>
      <Nav />
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Jobs />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/hackers" element={<Hackers />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
