import { memo } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import type { Element } from '../data/types'
import MiniBohr from './MiniBohr'

function ElementCard({ element }: { element: Element }) {
  const color = CATEGORIES[element.category].color
  return (
    <Link
      to={`/element/${element.symbol}`}
      className="group flex flex-col gap-3 rounded-2xl border bg-ink-800/60 p-4 transition duration-200 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
      style={{ borderColor: `${color}40` }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 28px ${color}40`)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl leading-none font-extrabold" style={{ color, textShadow: `0 0 12px ${color}77` }}>
              {element.symbol}
            </span>
            <span className="font-mono text-xs text-slate-500">#{element.atomicNumber}</span>
          </div>
          <h2 className="mt-1 truncate text-lg font-semibold text-white">{element.name}</h2>
          <p className="truncate text-xs capitalize" style={{ color }}>
            {element.categoryLabel}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-400">
            {element.atomicMass} u · {element.phase}
          </p>
        </div>
        <MiniBohr shells={element.shells} color={color} atomicNumber={element.atomicNumber} size={92} />
      </div>

      <dl className="grid grid-cols-3 gap-2 text-center">
        <Count label="Protons" value={element.protons} color="#ff4f79" />
        <Count label="Neutrons" value={element.neutrons} color="#8fa3c0" />
        <Count label="Electrons" value={element.electrons} color={color} />
      </dl>

      <div className="space-y-1 font-mono text-[11px] text-slate-400">
        <p>
          <span className="text-slate-600">shells </span>
          {element.shells.join(', ')}
        </p>
        <p className="truncate">
          <span className="text-slate-600">config </span>
          {element.electronConfigurationSemantic}
        </p>
      </div>

      <p className="line-clamp-3 text-xs leading-relaxed text-slate-400">{element.summary}</p>
    </Link>
  )
}

function Count({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] py-1.5">
      <dd className="font-mono text-lg font-bold" style={{ color }}>
        {value}
      </dd>
      <dt className="text-[9px] tracking-wider text-slate-500 uppercase">{label}</dt>
    </div>
  )
}

export default memo(ElementCard)
