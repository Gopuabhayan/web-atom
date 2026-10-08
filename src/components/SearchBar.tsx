interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  /** Called on Enter, e.g. to jump straight to a single match */
  onSubmit?: () => void
  matchCount: number
}

export default function SearchBar({ value, onChange, onSubmit, matchCount }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <svg
        className="pointer-events-none absolute top-1/2 left-3.5 z-10 h-4 w-4 -translate-y-1/2 text-slate-500"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <circle cx="9" cy="9" r="6" />
        <path d="m14 14 4 4" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit?.()
          if (e.key === 'Escape') onChange('')
        }}
        placeholder="Search name, symbol or atomic number…"
        aria-label="Search elements"
        className="w-full rounded-xl border border-white/10 bg-ink-800/80 py-2.5 pr-24 pl-10 text-sm text-slate-100 placeholder-slate-500 shadow-inner outline-none backdrop-blur transition focus:border-cyan-400/60 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]"
      />
      {value && (
        <span className="absolute top-1/2 right-3.5 -translate-y-1/2 font-mono text-xs text-slate-400">
          {matchCount} match{matchCount === 1 ? '' : 'es'}
        </span>
      )}
    </div>
  )
}
