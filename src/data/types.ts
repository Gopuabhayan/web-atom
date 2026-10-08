/** Shape of one record in src/data/elements.json (trimmed Bowserinator dataset). */
export interface RawElement {
  name: string
  symbol: string
  number: number
  atomic_mass: number
  category: string
  period: number
  group: number
  phase: string
  density: number | null
  density_unit: string | null
  /** Kelvin */
  melt: number | null
  /** Kelvin */
  boil: number | null
  electron_configuration: string
  electron_configuration_semantic: string
  shells: number[]
  discovered_by: string | null
  summary: string
  /** 1-18 column in the display grid */
  xpos: number
  /** 1-7 main rows, 9-10 for the lanthanide/actinide rows */
  ypos: number
  block: string
  source: string
}

export type CategoryKey =
  | 'alkali-metal'
  | 'alkaline-earth-metal'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'diatomic-nonmetal'
  | 'polyatomic-nonmetal'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide'
  | 'unknown'

export type Phase = 'Solid' | 'Liquid' | 'Gas'

export interface Element {
  name: string
  symbol: string
  atomicNumber: number
  atomicMass: number
  /** Category string exactly as given by the dataset */
  categoryLabel: string
  category: CategoryKey
  period: number
  group: number
  phase: Phase
  density: number | null
  densityUnit: string | null
  meltK: number | null
  boilK: number | null
  electronConfiguration: string
  electronConfigurationSemantic: string
  /** Electrons per shell, innermost first */
  shells: number[]
  discoveredBy: string | null
  summary: string
  xpos: number
  ypos: number
  block: string
  source: string
  protons: number
  /** Most common isotope (approx): round(atomic mass) − atomic number */
  neutrons: number
  electrons: number
}
