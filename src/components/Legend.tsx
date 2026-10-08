import { CATEGORIES, CATEGORY_ORDER } from '../data/categories'
import type { CategoryKey } from '../data/types'

interface LegendProps {
  active: CategoryKey | null
  locked: CategoryKey | null
  onHover: (key: CategoryKey | null) => void
  /** Click/tap toggles a sticky highlight, so the legend also works on touch screens */
  onToggleLock: (key: CategoryKey) => void
  /** 'grid' sits inside the table's empty top area; 'chips' is a swipeable row for small screens */
  variant?: 'grid' | 'chips'
}

export default function Legend({ active, locked, onHover, onToggleLock, variant = 'grid' }: LegendProps) {
  if (variant === 'chips') {
    return (
      <ul className="scroll-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6" aria-label="Categories">
        {CATEGORY_ORDER.map((key) => {
          const { label, color } = CATEGORIES[key]
          const isLocked = locked === key
          return (
            <li key={key} className="shrink-0">
              <button
                type="button"
                onClick={() => onToggleLock(key)}
                aria-pressed={isLocked}
                className="flex h-9 items-center gap-2 rounded-full border px-3 text-xs whitespace-nowrap transition"
                style={{
                  borderColor: isLocked ? color : `${color}40`,
                  background: isLocked ? `${color}22` : 'transparent',
                  color: isLocked ? color : '#cbd5e1',
                  opacity: active !== null && !isLocked ? 0.5 : 1,
                }}
              >
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="flex h-full flex-col justify-center gap-2 px-2" onMouseLeave={() => onHover(null)}>
      <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">Categories</p>
      <ul className="grid grid-cols-3 gap-x-2 gap-y-1">
        {CATEGORY_ORDER.map((key) => {
          const { label, color } = CATEGORIES[key]
          const isActive = active === key
          const dimmed = active !== null && !isActive
          return (
            <li key={key}>
              <button
                type="button"
                onMouseEnter={() => onHover(key)}
                onFocus={() => onHover(key)}
                onBlur={() => onHover(null)}
                onClick={() => onToggleLock(key)}
                aria-pressed={locked === key}
                className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-[11px] leading-tight transition"
                style={{
                  opacity: dimmed ? 0.35 : 1,
                  background: isActive ? `${color}1f` : 'transparent',
                  color: isActive ? color : '#cbd5e1',
                }}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
