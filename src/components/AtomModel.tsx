import { OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, Group, InstancedMesh, Matrix4, Object3D, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { CATEGORIES } from '../data/categories'
import type { Element } from '../data/types'

const PROTON_COLOR = '#ff4f79'
const NEUTRON_COLOR = '#8fa3c0'
const NUCLEON_RADIUS = 0.2
const FIRST_SHELL_GAP = 1.1
const SHELL_SPACING = 0.95

interface AtomModelProps {
  element: Element
  paused: boolean
}

export default function AtomModel({ element, paused }: AtomModelProps) {
  const layout = useMemo(() => buildLayout(element), [element])

  return (
    <Canvas dpr={[1, 2]} camera={{ fov: 45, near: 0.1, far: 500 }} gl={{ antialias: true }}>
      <color attach="background" args={['#04060f']} />
      <ambientLight intensity={0.45} />
      <pointLight position={[10, 12, 10]} intensity={300} />
      <pointLight position={[-12, -6, -8]} intensity={120} color="#7dd3fc" />
      <Stars radius={120} depth={60} count={1500} factor={3} fade speed={0.5} />

      {/* Keyed by element so instance counts are rebuilt from scratch on navigation */}
      <group key={element.symbol}>
        <Nucleus positions={layout.nucleons} protons={element.protons} paused={paused} />
        {element.shells.map((count, i) => (
          <Shell
            key={i}
            index={i}
            radius={layout.shellRadii[i]}
            electrons={count}
            color={CATEGORIES[element.category].color}
            paused={paused}
          />
        ))}
      </group>

      <CameraRig distance={layout.outerRadius * 2.6 + 3} />
      <OrbitControls makeDefault enablePan={false} enableDamping minDistance={2} maxDistance={60} />
    </Canvas>
  )
}

/* ---------------------------------- layout ---------------------------------- */

interface AtomLayout {
  /** Nucleon centres; the first `protons` slots are not special — types are assigned by shuffled index */
  nucleons: Vector3[]
  shellRadii: number[]
  outerRadius: number
}

function buildLayout(element: Element): AtomLayout {
  const count = element.protons + element.neutrons
  const nucleons = packSphere(count, NUCLEON_RADIUS, element.atomicNumber)
  const nucleusRadius = nucleons.reduce((m, p) => Math.max(m, p.length()), 0) + NUCLEON_RADIUS
  const shellRadii = element.shells.map((_, i) => nucleusRadius + FIRST_SHELL_GAP + i * SHELL_SPACING)
  return { nucleons, shellRadii, outerRadius: shellRadii[shellRadii.length - 1] ?? nucleusRadius }
}

/** Deterministic PRNG so the same element always gets the same nucleus. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Packs `n` spheres of radius `r` into a ball: seed points with a low-discrepancy
 * distribution, then run a few rounds of pairwise repulsion plus a pull to the centre.
 */
function packSphere(n: number, r: number, seed: number): Vector3[] {
  if (n === 1) return [new Vector3()]
  const rand = mulberry32(seed * 9973)
  const ballRadius = r * Math.cbrt(n / 0.64)
  const pts: Vector3[] = []
  for (let i = 0; i < n; i++) {
    const u = (i * 0.7548776662 + rand() * 0.1) % 1
    const v = (i * 0.569840291 + rand() * 0.1) % 1
    const y = 1 - 2 * u
    const theta = 2 * Math.PI * v
    const s = Math.sqrt(1 - y * y)
    const rad = ballRadius * Math.cbrt((i + 0.5) / n)
    pts.push(new Vector3(s * Math.cos(theta) * rad, y * rad, s * Math.sin(theta) * rad))
  }

  const minDist = 2 * r * 0.92 // slight overlap reads as a tightly bound cluster
  const delta = new Vector3()
  for (let iter = 0; iter < 30; iter++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        delta.subVectors(pts[i], pts[j])
        const d = delta.length()
        if (d < minDist && d > 1e-6) {
          delta.multiplyScalar((minDist - d) / d / 2)
          pts[i].add(delta)
          pts[j].sub(delta)
        }
      }
    }
    for (const p of pts) p.multiplyScalar(0.985)
  }
  return pts
}

/* --------------------------------- nucleus ---------------------------------- */

interface NucleusProps {
  positions: Vector3[]
  protons: number
  paused: boolean
}

/** Two instanced meshes (protons, neutrons) so even oganesson's 294 nucleons are 2 draw calls. */
function Nucleus({ positions, protons, paused }: NucleusProps) {
  const group = useRef<Group>(null)
  const protonMesh = useRef<InstancedMesh>(null)
  const neutronMesh = useRef<InstancedMesh>(null)
  const neutrons = positions.length - protons

  // Interleave protons and neutrons through the cluster rather than layering them.
  const isProton = useMemo(() => {
    const flags = positions.map((_, i) => i < protons)
    const rand = mulberry32(positions.length * 31 + protons)
    for (let i = flags.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[flags[i], flags[j]] = [flags[j], flags[i]]
    }
    return flags
  }, [positions, protons])

  useLayoutEffect(() => {
    const dummy = new Object3D()
    let p = 0
    let n = 0
    positions.forEach((pos, i) => {
      dummy.position.copy(pos)
      dummy.updateMatrix()
      const mesh = isProton[i] ? protonMesh.current : neutronMesh.current
      mesh?.setMatrixAt(isProton[i] ? p++ : n++, dummy.matrix)
    })
    for (const mesh of [protonMesh.current, neutronMesh.current]) {
      if (!mesh) continue
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
    }
  }, [positions, isProton])

  useFrame((_, dt) => {
    if (!paused && group.current) {
      group.current.rotation.y += dt * 0.25
      group.current.rotation.x += dt * 0.08
    }
  })

  return (
    <group ref={group}>
      {protons > 0 && (
        <instancedMesh ref={protonMesh} args={[undefined, undefined, protons]}>
          <sphereGeometry args={[NUCLEON_RADIUS, 20, 20]} />
          <meshStandardMaterial color={PROTON_COLOR} roughness={0.35} metalness={0.1} emissive={PROTON_COLOR} emissiveIntensity={0.25} />
        </instancedMesh>
      )}
      {neutrons > 0 && (
        <instancedMesh ref={neutronMesh} args={[undefined, undefined, neutrons]}>
          <sphereGeometry args={[NUCLEON_RADIUS, 20, 20]} />
          <meshStandardMaterial color={NEUTRON_COLOR} roughness={0.45} metalness={0.15} emissive={NEUTRON_COLOR} emissiveIntensity={0.1} />
        </instancedMesh>
      )}
    </group>
  )
}

/* ---------------------------------- shells ---------------------------------- */

interface ShellProps {
  index: number
  radius: number
  electrons: number
  color: string
  paused: boolean
}

function Shell({ index, radius, electrons, color, paused }: ShellProps) {
  const spinner = useRef<Group>(null)
  const mesh = useRef<InstancedMesh>(null)

  // Kepler-style falloff: outer shells orbit noticeably slower than inner ones.
  const speed = 2.4 / Math.pow(radius, 1.5)
  // Give each ring its own tilt so the atom reads as 3D while staying a clean Bohr picture.
  const tilt = useMemo(() => {
    const rand = mulberry32(index * 7919 + 17)
    return [(rand() - 0.5) * 0.5, (rand() - 0.5) * 0.5, 0] as const
  }, [index])
  const startAngle = index * 0.9

  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    const mat = new Matrix4()
    for (let i = 0; i < electrons; i++) {
      const a = (i / electrons) * Math.PI * 2 + startAngle
      mat.makeTranslation(Math.cos(a) * radius, Math.sin(a) * radius, 0)
      m.setMatrixAt(i, mat)
    }
    m.instanceMatrix.needsUpdate = true
    m.computeBoundingSphere()
  }, [electrons, radius, startAngle])

  useFrame((_, dt) => {
    if (!paused && spinner.current) spinner.current.rotation.z += dt * speed
  })

  const glow = useMemo(() => new Color(color), [color])

  return (
    <group rotation={[Math.PI / 2 + tilt[0], tilt[1], tilt[2]]}>
      <mesh>
        <torusGeometry args={[radius, 0.012, 8, 160]} />
        <meshBasicMaterial color={color} transparent opacity={0.28} />
      </mesh>
      <group ref={spinner}>
        <instancedMesh ref={mesh} args={[undefined, undefined, electrons]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={2.2} toneMapped={false} />
        </instancedMesh>
      </group>
    </group>
  )
}

/* ---------------------------------- camera ---------------------------------- */

/** Re-frames the camera whenever the atom's size changes (prev/next navigation). */
function CameraRig({ distance }: { distance: number }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null

  useLayoutEffect(() => {
    const dir = new Vector3(0, 0.75, 1).normalize()
    camera.position.copy(dir.multiplyScalar(distance))
    camera.lookAt(0, 0, 0)
    if (controls) {
      controls.target.set(0, 0, 0)
      controls.maxDistance = distance * 2.5
      controls.update()
    }
  }, [camera, controls, distance])

  return null
}
