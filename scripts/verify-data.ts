// Sanity checks for the element dataset: `npm run verify`
import { ELEMENTS, getElementBySymbol } from '../src/data/elements'

const fail = (msg: string): never => {
  console.error('FAIL', msg)
  process.exit(1)
}

if (ELEMENTS.length !== 118) fail(`expected 118 elements, got ${ELEMENTS.length}`)
ELEMENTS.forEach((el, i) => {
  if (el.atomicNumber !== i + 1) fail(`gap at ${i + 1}`)
  const shellSum = el.shells.reduce((a, b) => a + b, 0)
  if (shellSum !== el.electrons) fail(`${el.symbol}: shells sum ${shellSum} != ${el.electrons}`)
  if (el.neutrons < 0) fail(`${el.symbol}: negative neutrons`)
})
const cells = new Set(ELEMENTS.map((e) => `${e.xpos},${e.ypos}`))
if (cells.size !== 118) fail('overlapping grid positions')

const expected: Record<string, [number, number, number]> = {
  H: [1, 0, 1],
  C: [6, 6, 6],
  Fe: [26, 30, 26],
  U: [92, 146, 92],
}
for (const [sym, [p, n, e]] of Object.entries(expected)) {
  const el = getElementBySymbol(sym) ?? fail(`${sym} missing`)
  const got: [number, number, number] = [el.protons, el.neutrons, el.electrons]
  if (got.join() !== [p, n, e].join()) fail(`${sym}: got ${got} expected ${[p, n, e]}`)
  console.log(`ok ${sym.padEnd(2)} p=${p} n=${n} e=${e} shells=${el.shells.join(',')} category=${el.category}`)
}
console.log('ok 118 elements, unique grid cells, shell sums match')
