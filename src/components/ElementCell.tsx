import { motion } from 'framer-motion'
import { memo, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import type { Element } from '../data/types'

const MotionLink = motion.create(Link)

interface ElementCellProps {
  element: Element
  dimmed: boolean
}

function ElementCell({ element, dimmed }: ElementCellProps) {
  const color = CATEGORIES[element.category].color
  return (
    <MotionLink
      to={`/element/${element.symbol}`}
      aria-label={`${element.name}, atomic number ${element.atomicNumber}`}
      className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded border p-0.5 lg:aspect-[5/6] lg:rounded-md lg:p-1 outline-none select-none focus-visible:ring-2 focus-visible:ring-white/70"
      style={
        {
          gridColumn: element.xpos,
          gridRow: element.ypos,
          '--c': color,
          borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
          background: `linear-gradient(160deg, color-mix(in srgb, ${color} 20%, #0b1124), color-mix(in srgb, ${color} 6%, #070b1a))`,
        } as CSSProperties
      }
      animate={{ opacity: dimmed ? 0.15 : 1, filter: dimmed ? 'saturate(0.2)' : 'saturate(1)' }}
      whileHover={{
        scale: 1.18,
        zIndex: 20,
        boxShadow: `0 0 22px 2px ${color}aa, inset 0 0 12px ${color}55`,
      }}
      whileTap={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
    >
      <span className="font-mono text-[8px] leading-none text-slate-300 lg:text-[9px]">{element.atomicNumber}</span>
      <span className="pb-1 text-center text-base leading-none font-bold lg:pb-0 lg:text-lg" style={{ color, textShadow: `0 0 10px ${color}88` }}>
        {element.symbol}
      </span>
      <span className="hidden flex-col items-center leading-tight lg:flex">
        <span className="w-full truncate text-center text-[8px] text-slate-200">{element.name}</span>
        <span className="font-mono text-[8px] text-slate-400">{formatMass(element.atomicMass)}</span>
      </span>
    </MotionLink>
  )
}

function formatMass(mass: number): string {
  return mass >= 100 ? mass.toFixed(2) : mass.toFixed(3)
}

export default memo(ElementCell)
