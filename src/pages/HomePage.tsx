import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PeriodicTable from '../components/PeriodicTable'
import SearchBar from '../components/SearchBar'
import { ELEMENTS, matchesQuery } from '../data/elements'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const matches = useMemo(() => ELEMENTS.filter((el) => matchesQuery(el, query)), [query])

  const jumpToMatch = () => {
    const q = query.trim().toLowerCase()
    const exact = matches.find((el) => el.symbol.toLowerCase() === q || el.name.toLowerCase() === q)
    const target = exact ?? (matches.length === 1 ? matches[0] : undefined)
    if (target) navigate(`/element/${target.symbol}`)
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
      <header className="mb-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-cyan-400/80 uppercase">118 elements</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Periodic Table{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
              Explorer
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Pick an element to see its atom in 3D, or{' '}
            <Link to="/elements" className="text-cyan-400 hover:text-cyan-300 hover:underline">
              view all elements on one page →
            </Link>
          </p>
        </div>
        <SearchBar value={query} onChange={setQuery} onSubmit={jumpToMatch} matchCount={matches.length} />
      </header>

      <PeriodicTable query={query} />

      <p className="mt-2 text-center text-xs text-slate-600">
        Data: Bowserinator/Periodic-Table-JSON · Tap or hover a category to highlight it
      </p>
    </main>
  )
}
