import { motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ElementInfo from '../components/ElementInfo'
import { CATEGORIES } from '../data/categories'
import { getElementBySymbol, getNeighbors } from '../data/elements'
import type { Element } from '../data/types'

// three.js and friends only load when someone opens an element.
const AtomModel = lazy(() => import('../components/AtomModel'))

export default function ElementPage() {
  const { symbol } = useParams()
  const element = getElementBySymbol(symbol)
  const navigate = useNavigate()
  const [paused, setPaused] = useState(false)
  const { prev, next } = element ? getNeighbors(element) : {}

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowLeft' && prev) navigate(`/element/${prev.symbol}`)
      else if (e.key === 'ArrowRight' && next) navigate(`/element/${next.symbol}`)
      else if (e.key === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, navigate])

  if (!element) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-white">No element called “{symbol}”</h1>
        <Link to="/" className="text-cyan-400 hover:underline">
          ← Back to the table
        </Link>
      </main>
    )
  }

  const color = CATEGORIES[element.category].color

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
      <nav className="mb-5 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-ink-800/70 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
        >
          <span aria-hidden>←</span> <span className="hidden min-[380px]:inline">Periodic</span> table
        </Link>
        <div className="flex items-center gap-2">
          <NeighborButton element={prev} direction="prev" />
          <NeighborButton element={next} direction="next" />
        </div>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-2 lg:sticky lg:top-6 lg:self-start">
          <div
            className="relative h-[42vh] min-h-[280px] overflow-hidden rounded-2xl sm:h-[55vh] sm:min-h-[340px] border bg-ink-950 lg:h-[calc(100vh-9rem)]"
            style={{ borderColor: `${color}44`, boxShadow: `0 0 60px ${color}14` }}
          >
            <Suspense fallback={<AtomFallback />}>
              <AtomModel element={element} paused={paused} />
            </Suspense>

            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="absolute top-3 right-3 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-ink-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur transition hover:border-white/30"
              aria-pressed={paused}
            >
              {paused ? '▶ Play' : '❚❚ Pause'}
            </button>

            <div className="pointer-events-none absolute bottom-3 left-3 flex gap-3 rounded-lg bg-ink-900/70 px-3 py-1.5 text-[11px] text-slate-300 backdrop-blur">
              <LegendDot color="#ff4f79" label="Proton" />
              <LegendDot color="#8fa3c0" label="Neutron" />
              <LegendDot color={color} label="Electron" />
            </div>
            <p className="pointer-events-none absolute right-3 bottom-3 hidden text-[11px] text-slate-500 sm:block">
              Drag to rotate · scroll to zoom
            </p>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            <strong className="font-semibold text-slate-400">Note:</strong> this is the Bohr model, a simplified picture.
            Real electrons don’t travel on neat circular orbits; they occupy fuzzy probability clouds (orbitals) described
            by quantum mechanics. Sizes and distances here are not to scale.
          </p>
        </section>

        {/* Keyed so the panel re-plays its entrance on prev/next. Enter-only: a nested
            AnimatePresence under the route-level one left the panel one element behind. */}
        <motion.div
          key={element.symbol}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <ElementInfo element={element} />
        </motion.div>
      </div>
    </main>
  )
}

function NeighborButton({ element, direction }: { element?: Element; direction: 'prev' | 'next' }) {
  const arrow = direction === 'prev' ? '←' : '→'
  const cls =
    'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition'
  if (!element) {
    return (
      <span className={`${cls} cursor-not-allowed border-white/5 text-slate-600`} aria-disabled>
        {arrow}
      </span>
    )
  }
  const color = CATEGORIES[element.category].color
  return (
    <Link
      to={`/element/${element.symbol}`}
      title={`${element.name} (${direction === 'prev' ? 'Left' : 'Right'} arrow)`}
      className={`${cls} border-white/10 bg-ink-800/70 text-slate-200 hover:border-white/30 hover:text-white`}
    >
      {direction === 'prev' && <span aria-hidden>{arrow}</span>}
      <span className="font-mono text-xs text-slate-500">{element.atomicNumber}</span>
      <span className="font-bold" style={{ color }}>
        {element.symbol}
      </span>
      {direction === 'next' && <span aria-hidden>{arrow}</span>}
    </Link>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      {label}
    </span>
  )
}

function AtomFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
    </div>
  )
}
