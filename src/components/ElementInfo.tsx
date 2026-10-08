import { animate } from 'framer-motion'
import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { CATEGORIES } from '../data/categories'
import type { Element } from '../data/types'

const SHELL_LETTERS = ['K', 'L', 'M', 'N', 'O', 'P', 'Q']

interface ElementInfoProps {
  element: Element
}

export default function ElementInfo({ element }: ElementInfoProps) {
  const color = CATEGORIES[element.category].color

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end gap-5">
        <div
          className="flex h-24 w-24 shrink-0 flex-col justify-between rounded-xl border p-2"
          style={{
            borderColor: `${color}88`,
            background: `linear-gradient(160deg, ${color}33, ${color}0a)`,
            boxShadow: `0 0 32px ${color}33`,
          }}
        >
          <span className="font-mono text-xs text-slate-300">{element.atomicNumber}</span>
          <span className="text-center text-4xl leading-none font-extrabold" style={{ color, textShadow: `0 0 16px ${color}aa` }}>
            {element.symbol}
          </span>
          <span className="text-right font-mono text-[10px] text-slate-400">{element.atomicMass.toFixed(3)}</span>
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-4xl font-bold tracking-tight text-white sm:text-5xl">{element.name}</h1>
          <p className="mt-1 text-sm font-medium capitalize" style={{ color }}>
            {element.categoryLabel}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-3" aria-label="Particle counts">
        <Counter label="Protons" value={element.protons} color="#ff4f79" />
        <Counter label="Neutrons" value={element.neutrons} color="#8fa3c0" note="most common isotope (approx)" />
        <Counter label="Electrons" value={element.electrons} color={color} />
      </section>

      <Card title="Electron configuration">
        <p className="font-mono text-lg text-white">
          <Configuration text={element.electronConfigurationSemantic} />
        </p>
        {element.electronConfiguration !== element.electronConfigurationSemantic && (
          <p className="mt-1 font-mono text-xs break-words text-slate-500">
            <Configuration text={element.electronConfiguration} />
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {element.shells.map((n, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
              <span className="text-[10px] font-semibold text-slate-500">{SHELL_LETTERS[i]}</span>
              <span className="font-mono text-sm" style={{ color }}>
                {n}
              </span>
            </div>
          ))}
          <span className="ml-1 font-mono text-xs text-slate-400">= {element.shells.join(', ')}</span>
        </div>
      </Card>

      <Card title="Properties">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {propertyRows(element).map(([label, value]) => (
            <Fragment key={label}>
              <dt className="text-slate-500">{label}</dt>
              <dd className="text-right font-mono text-slate-100">{value}</dd>
            </Fragment>
          ))}
        </dl>
      </Card>

      <Card title="Summary">
        <p className="text-sm leading-relaxed text-slate-300">{element.summary}</p>
        <a
          href={element.source}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
        >
          Read more on Wikipedia →
        </a>
      </Card>
    </div>
  )
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-ink-800/60 p-5 backdrop-blur">
      <h2 className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase">{title}</h2>
      {children}
    </section>
  )
}

function Counter({ label, value, color, note }: { label: string; value: number; color: string; note?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [value])

  return (
    <div
      className="flex flex-col items-center rounded-2xl border bg-ink-800/60 px-2 py-4 text-center"
      style={{ borderColor: `${color}44`, boxShadow: `inset 0 0 24px ${color}14` }}
    >
      <span
        className="font-mono text-4xl font-bold tabular-nums sm:text-5xl"
        style={{ color, textShadow: `0 0 18px ${color}88` }}
        aria-label={`${value} ${label.toLowerCase()}`}
      >
        {display}
      </span>
      <span className="mt-1 text-xs font-semibold tracking-wider text-slate-300 uppercase">{label}</span>
      {note && <span className="mt-0.5 text-[10px] leading-tight text-slate-500">{note}</span>}
    </div>
  )
}

/** Renders "[Ar] 3d6 4s2" with the electron counts as superscripts. */
function Configuration({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((token, i) => {
        const m = /^(\d+[spdfg])(\d+)(.*)$/.exec(token)
        return (
          <Fragment key={i}>
            {i > 0 && ' '}
            {m ? (
              <>
                {m[1]}
                <sup>{m[2]}</sup>
                {m[3]}
              </>
            ) : (
              token
            )}
          </Fragment>
        )
      })}
    </>
  )
}

function propertyRows(el: Element): [string, string][] {
  const isFBlock = el.ypos >= 9
  return [
    ['Atomic mass', `${el.atomicMass} u`],
    ['Category', el.categoryLabel],
    ['Phase (STP)', el.phase],
    ['Density', el.density == null ? '—' : `${el.density} ${el.densityUnit ?? ''}`.trim()],
    ['Melting point', formatTemp(el.meltK)],
    ['Boiling point', formatTemp(el.boilK)],
    ['Period', String(el.period)],
    ['Group', isFBlock ? '— (f-block)' : String(el.group)],
    ['Block', el.block],
    ['Discovered by', el.discoveredBy ?? '—'],
  ]
}

function formatTemp(kelvin: number | null): string {
  if (kelvin == null) return '—'
  return `${kelvin}\u00a0K (${(kelvin - 273.15).toFixed(1)}\u00a0°C)`
}
