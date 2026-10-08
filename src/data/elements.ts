import data from './elements.json'
import { toCategoryKey } from './categories'
import type { Element, Phase, RawElement } from './types'

// Assigning (not casting) makes TypeScript check the JSON against RawElement.
const raw: RawElement[] = data

/**
 * The dataset puts La and Ac at the start of the f-block rows. We use the common
 * textbook layout instead: La and Ac sit in group 3 (under Sc and Y), and the
 * rows below hold Ce–Lu and Th–Lr.
 */
const GRID_OVERRIDES: Record<number, { xpos: number; ypos: number }> = {
  57: { xpos: 3, ypos: 6 },
  89: { xpos: 3, ypos: 7 },
}

function toPhase(p: string): Phase {
  return p === 'Gas' || p === 'Liquid' ? p : 'Solid'
}

function toElement(r: RawElement): Element {
  return {
    name: r.name,
    symbol: r.symbol,
    atomicNumber: r.number,
    atomicMass: r.atomic_mass,
    categoryLabel: r.category,
    category: toCategoryKey(r.category),
    period: r.period,
    group: r.group,
    phase: toPhase(r.phase),
    density: r.density,
    densityUnit: r.density_unit,
    meltK: r.melt,
    boilK: r.boil,
    electronConfiguration: r.electron_configuration,
    electronConfigurationSemantic: r.electron_configuration_semantic,
    shells: r.shells,
    discoveredBy: r.discovered_by,
    summary: r.summary,
    xpos: GRID_OVERRIDES[r.number]?.xpos ?? r.xpos,
    ypos: GRID_OVERRIDES[r.number]?.ypos ?? r.ypos,
    block: r.block,
    source: r.source,
    protons: r.number,
    neutrons: Math.round(r.atomic_mass) - r.number,
    electrons: r.number,
  }
}

export const ELEMENTS: readonly Element[] = raw
  .map(toElement)
  .sort((a, b) => a.atomicNumber - b.atomicNumber)

const bySymbol = new Map(ELEMENTS.map((e) => [e.symbol.toLowerCase(), e]))

export function getElementBySymbol(symbol: string | undefined): Element | undefined {
  return symbol ? bySymbol.get(symbol.toLowerCase()) : undefined
}

export function getNeighbors(el: Element): { prev?: Element; next?: Element } {
  const i = el.atomicNumber - 1
  return { prev: ELEMENTS[i - 1], next: ELEMENTS[i + 1] }
}

export function matchesQuery(el: Element, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (/^\d+$/.test(q)) return el.atomicNumber === Number(q)
  return el.symbol.toLowerCase() === q || el.name.toLowerCase().includes(q) || el.symbol.toLowerCase().startsWith(q)
}
