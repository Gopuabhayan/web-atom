import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ElementCard from '../components/ElementCard'
import SearchBar from '../components/SearchBar'
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories'
import { ELEMENTS, matchesQuery } from '../data/elements'
import type { CategoryKey } from '../data/types'

export default function AllElementsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryKey | null>(null)

  const visible = useMemo(
    () => ELEMENTS.filter((el) => matchesQuery(el, query) && (category === null || el.category === category)),
    [query, category],
  )

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-ink-800/70 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
      >
        <span aria-hidden>←</span> Periodic table
      </Link>

      <header className="mt-6 mb-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-cyan-400/80 uppercase">
            Showing {visible.length} of {ELEMENTS.length}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">All elements</h1>
          <p className="mt-2 text-sm text-slate-400">Every element at a glance. Click a card for its 3D atom.</p>
        </div>
        <SearchBar value={query} onChange={setQuery} matchCount={visible.length} />
      </header>

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <Chip active={category === null} color="#e2e8f0" onClick={() => setCategory(null)}>
          All
        </Chip>
        {CATEGORY_ORDER.map((key) => (
          <Chip
            key={key}
            active={category === key}
            color={CATEGORIES[key].color}
            onClick={() => setCategory((cur) => (cur === key ? null : key))}
          >
            {CATEGORIES[key].label}
          </Chip>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-20 text-center text-slate-500">No elements match.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((el) => (
            <ElementCard key={el.atomicNumber} element={el} />
          ))}
        </div>
      )}
    </main>
  )
}

function Chip({ active, color, onClick, children }: { active: boolean; color: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="h-9 rounded-full border px-3 text-xs font-medium transition"
      style={{
        borderColor: active ? color : `${color}40`,
        background: active ? `${color}22` : 'transparent',
        color: active ? color : '#94a3b8',
      }}
    >
      {children}
    </button>
  )
}
