import type { CategoryKey } from './types'

export interface CategoryStyle {
  label: string
  /** Neon accent used for borders, glows and the atom's electrons */
  color: string
}

export const CATEGORIES: Record<CategoryKey, CategoryStyle> = {
  'alkali-metal': { label: 'Alkali metal', color: '#ff4d6d' },
  'alkaline-earth-metal': { label: 'Alkaline earth metal', color: '#ff9f1c' },
  'transition-metal': { label: 'Transition metal', color: '#facc15' },
  'post-transition-metal': { label: 'Post-transition metal', color: '#4ade80' },
  metalloid: { label: 'Metalloid', color: '#2dd4bf' },
  'diatomic-nonmetal': { label: 'Diatomic nonmetal', color: '#38bdf8' },
  'polyatomic-nonmetal': { label: 'Polyatomic nonmetal', color: '#818cf8' },
  'noble-gas': { label: 'Noble gas', color: '#c084fc' },
  lanthanide: { label: 'Lanthanide', color: '#f472b6' },
  actinide: { label: 'Actinide', color: '#fb7185' },
  unknown: { label: 'Unknown properties', color: '#94a3b8' },
}

export const CATEGORY_ORDER = Object.keys(CATEGORIES) as CategoryKey[]

/** Maps the dataset's free-text category onto one of our keys. */
export function toCategoryKey(raw: string): CategoryKey {
  if (raw.startsWith('unknown')) return 'unknown'
  const key = raw.replace(/\s+/g, '-')
  return key in CATEGORIES ? (key as CategoryKey) : 'unknown'
}
