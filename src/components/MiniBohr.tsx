interface MiniBohrProps {
  shells: number[]
  color: string
  atomicNumber: number
  size?: number
}

/** Flat SVG Bohr diagram: cheap enough to draw 118 of on one page, unlike the 3D view. */
export default function MiniBohr({ shells, color, atomicNumber, size = 120 }: MiniBohrProps) {
  const c = size / 2
  const nucleusR = size * 0.09
  const step = (c - nucleusR - 6) / Math.max(shells.length, 1)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="shrink-0">
      {shells.map((count, i) => {
        const r = nucleusR + step * (i + 1)
        return (
          <g key={i}>
            <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={0.75} />
            {Array.from({ length: count }, (_, j) => {
              const a = (j / count) * Math.PI * 2 + i * 0.6
              return <circle key={j} cx={c + Math.cos(a) * r} cy={c + Math.sin(a) * r} r={1.6} fill={color} />
            })}
          </g>
        )
      })}
      <circle cx={c} cy={c} r={nucleusR} fill="#ff4f79" fillOpacity={0.85} />
      <text x={c} y={c} textAnchor="middle" dominantBaseline="central" fontSize={nucleusR * 0.9} fontFamily="JetBrains Mono, monospace" fill="#fff">
        {atomicNumber}
      </text>
    </svg>
  )
}
