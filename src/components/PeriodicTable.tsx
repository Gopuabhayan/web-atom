import { useState } from 'react'
import { CATEGORIES } from '../data/categories'
import { ELEMENTS, matchesQuery } from '../data/elements'
import type { CategoryKey } from '../data/types'
import ElementCell from './ElementCell'
import Legend from './Legend'

interface PeriodicTableProps {
  query: string
}

/** Labels for the separate lanthanide/actinide rows under the main table. */
const F_BLOCK = [
  { row: 9, range: '58–71', name: 'Lanthanides', category: 'lanthanide' },
  { row: 10, range: '90–103', name: 'Actinides', category: 'actinide' },
] as const

export default function PeriodicTable({ query }: PeriodicTableProps) {
  const [hovered, setHovered] = useState<CategoryKey | null>(null)
  const [locked, setLocked] = useState<CategoryKey | null>(null)
  const highlight = hovered ?? locked

  const toggleLock = (key: CategoryKey) => setLocked((cur) => (cur === key ? null : key))

  return (
    <>
      {/* Phones and tablets: legend as a swipeable chip row above the table */}
      <div className="mb-3 lg:hidden">
        <Legend variant="chips" active={highlight} locked={locked} onHover={setHovered} onToggleLock={toggleLock} />
        <p className="mt-2 text-xs text-slate-500 md:hidden">Swipe the table sideways to see all 18 groups →</p>
      </div>

      {/* Below lg the cells go compact (number + symbol) and the table scrolls sideways if it must. */}
      <div className="scroll-thin -mx-4 overflow-x-auto overscroll-x-contain px-4 pt-3 pb-6 sm:-mx-6 sm:px-6">
        <div
          className="mx-auto grid min-w-[680px] gap-[2px] lg:min-w-[960px] lg:gap-[3px]"
          style={{
            // Shrink with the window height so the lanthanide/actinide rows stay on screen.
            maxWidth: 'clamp(680px, calc((100vh - 200px) * 1.62), 1400px)',
            gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
            // Row 8 is a spacer between the main table and the lanthanide/actinide rows.
            gridTemplateRows: 'repeat(7, auto) 18px repeat(2, auto)',
          }}
        >
          <div className="hidden lg:block" style={{ gridColumn: '3 / 13', gridRow: '1 / 4' }}>
            <Legend active={highlight} locked={locked} onHover={setHovered} onToggleLock={toggleLock} />
          </div>

          {F_BLOCK.map(({ row, range, name, category }) => {
            const color = CATEGORIES[category].color
            const dimmed = highlight !== null && highlight !== category
            return (
              <div
                key={category}
                className="flex flex-col items-end justify-center pr-2 text-right transition-opacity"
                style={{ gridColumn: '1 / 4', gridRow: row, color, opacity: dimmed ? 0.15 : 1 }}
              >
                <span className="text-[10px] font-semibold lg:text-xs">{name}</span>
                <span className="font-mono text-[9px] text-slate-400 lg:text-[10px]">{range} →</span>
              </div>
            )
          })}

          {ELEMENTS.map((el) => (
            <ElementCell
              key={el.atomicNumber}
              element={el}
              dimmed={(highlight !== null && el.category !== highlight) || !matchesQuery(el, query)}
            />
          ))}
        </div>
      </div>
    </>
  )
}
