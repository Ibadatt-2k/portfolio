import { useEffect, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from 'react'
import {
  Box3,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  Shape,
  ShapeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { asset } from '../asset'

/**
 * Scene 3's own progress: below 0 the laptop is out of sight, 0 → 1 it rises
 * in folded, 1 → 2 it turns to face the viewer and opens, 2 → 3 it zooms in
 * on the display, where `children` fade in.
 */
export type LaptopHandle = { setProgress: (p: number) => void }

const { lerp, smoothstep, degToRad } = MathUtils

const FOV = 30
// The camera looks down on the laptop a little, like a product shot.
const ELEVATION = degToRad(10)
// How much bigger the open laptop gets on the final zoom, at most. It's capped
// to leave room (px) for the slide arrows and journey rail: beside it on wide
// screens, where it's a close-up (the lid stays in view, the base may run off
// the bottom), and below it on phones.
const ZOOM = 1.4
const ROOM = { side: 136, top: 24, phoneSide: 16, phoneBottom: 96 }
// How far the laptop leans towards the mouse (radians) before it zooms in.
const LEAN = { x: degToRad(4), y: degToRad(7) }

// The display (the lit area inside the bezel), in the lid's frame (origin on
// the hinge, lid open): ±halfWidth across, from `bottom` to `top` along the
// lid, `face` in front of the hinge, with rounded corners. Measured off a
// straight-on render of the model, whose lid corners have a ~0.028 radius.
const DISPLAY = { halfWidth: 0.478, bottom: 0.0046, top: 0.6539, face: 0.0125, radius: 0.018 }
// When zoomed in, black "glass" covers the lid's whole front inside its rim
// (display, bezel and the strip below), rounded in step with the lid's corners
// and the display's, so they read as one sheet of glass the slides sit in.
const GLASS = { halfWidth: 0.485, bottom: -0.003, top: 0.664, radius: 0.025 }
// CSS px size of the page laid onto the display (same aspect as the display).
const DISPLAY_W = 1280
const DISPLAY_H = Math.round(
  (DISPLAY_W * (DISPLAY.top - DISPLAY.bottom)) / (2 * DISPLAY.halfWidth),
)
const DISPLAY_RADIUS_PX = (DISPLAY_W * DISPLAY.radius) / (2 * DISPLAY.halfWidth)
// The display is too small to read on a phone, so there the page grows out of
// it into a panel filling the screen, shown at its true size: `margin` around
// it, and `below` it the room kept for the slide arrows (px).
const SHEET = { margin: 12, below: 92 }

type Size = { w: number; h: number }

type Props = { ref: Ref<LaptopHandle>; children: ReactNode }

export default function Laptop({ ref, children }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const display = useRef<HTMLDivElement>(null)
  const setProgress = useRef<(p: number) => void>(() => {})
  // The phone panel's size, or null when the page sits on the display.
  const [sheet, setSheet] = useState<Size | null>(null)

  useImperativeHandle(ref, () => ({ setProgress: (p) => setProgress.current(p) }), [])

  useEffect(() => {
    const el = canvas.current!
    const screen = display.current!
    const renderer = new WebGLRenderer({ canvas: el, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))

    // The model is unlit (see scripts/build-laptop.mjs), so no lights needed.
    const scene = new Scene()

    const camera = new PerspectiveCamera(FOV, 1, 0.1, 50)

    // rig spins the whole laptop. The model's "lid" node pivots on the hinge
    // and is authored open; see scripts/build-laptop.mjs.
    const rig = new Group()
    scene.add(rig)

    let progress = 0
    let viewHeight = 1 // world units visible top to bottom at the laptop
    let zoomTo = 1
    let lid: Object3D | null = null
    // The GLASS: blacks out the display's wallpaper when zoomed in, so the
    // slides (screen-blended on top) look lit by the display, not pasted on.
    let blank: Mesh<ShapeGeometry, MeshBasicMaterial> | null = null
    let bounds: Box3 | null = null // of the open laptop, in model space
    let tilt = 0 // how far the open lid leans back past vertical
    // Height to hold at the screen's centre once zoomed so the display's
    // centre lands there (it sits behind the base, and the camera looks down).
    let displayMiddle = 0
    let sheetSize: Size | null = null

    // A point on the display (x across, `along` the lid) in the lid's frame.
    const onDisplay = (x: number, along: number) =>
      new Vector3(
        x,
        along * Math.cos(tilt) + DISPLAY.face * Math.sin(tilt),
        -along * Math.sin(tilt) + DISPLAY.face * Math.cos(tilt),
      )

    // Lay the children's page over the rendered display by mapping its
    // corners onto the display's projected corners. On phones it then grows
    // from there into the full-screen panel as it fades in.
    const placeDisplay = (opacity: number) => {
      screen.style.opacity = String(opacity)
      screen.style.visibility = opacity > 0 ? 'visible' : 'hidden'
      if (!opacity || !lid) return
      const { halfWidth: x, top, bottom } = DISPLAY
      const corners = [onDisplay(-x, top), onDisplay(x, top), onDisplay(x, bottom), onDisplay(-x, bottom)]
      let quad = corners.map((corner) => {
        const { x, y } = lid!.localToWorld(corner).project(camera)
        return [((x + 1) / 2) * el.clientWidth, ((1 - y) / 2) * el.clientHeight]
      })
      const { w, h } = sheetSize ?? { w: DISPLAY_W, h: DISPLAY_H }
      if (sheetSize) {
        const m = SHEET.margin
        const panel = [[m, m], [m + w, m], [m + w, m + h], [m, m + h]]
        quad = quad.map(([qx, qy], i) => [lerp(qx, panel[i][0], opacity), lerp(qy, panel[i][1], opacity)])
      }
      screen.style.transform = quadTransform(w, h, quad)
    }

    // Where the mouse is (-1 → 1 across and down the window), eased towards.
    const lean = { x: 0, y: 0, toX: 0, toY: 0, frame: 0 }

    const render = () => {
      if (!lid) return
      const arrive = smoothstep(progress, 0.15, 1)
      const turn = smoothstep(progress, 1, 1.8)
      const open = smoothstep(progress, 1.15, 1.95)
      const zoom = smoothstep(progress, 2, 2.8)
      const scale = lerp(1, zoomTo, zoom)
      const spin = 1 - arrive // extra tumble that unwinds as it rises in
      // Rises from below the screen, settles folded and tilted, turns to face
      // the viewer as the lid opens, then zooms in. The last term keeps the
      // laptop's middle centred, moving to the display's middle as it zooms.
      rig.visible = progress > 0
      rig.scale.setScalar(scale)
      // A slight lean towards the mouse, gone once zoomed so the screen holds
      // still for reading.
      const sway = 1 - zoom
      rig.rotation.set(
        lerp(0.9, 0, turn) + spin * 0.5 + lean.y * LEAN.x * sway,
        lerp(-0.6, 0, turn) - spin * 2.4 + lean.x * LEAN.y * sway,
        lerp(0.15, 0, turn) + spin * 0.3,
      )
      rig.position.y =
        viewHeight * lerp(-0.85, 0, arrive) - lerp(0, lerp(0.3, displayMiddle, zoom), open) * scale
      lid.rotation.x = lid.userData.closeAngle * (1 - open)
      blank!.material.opacity = smoothstep(zoom, 0.3, 0.8)
      blank!.visible = blank!.material.opacity > 0
      renderer.render(scene, camera)
      placeDisplay(smoothstep(zoom, 0.5, 1))
    }

    setProgress.current = (p) => {
      progress = p
      render()
    }

    // Pick the final zoom, and tell overlays beside the laptop (the slide
    // arrows) where its sides land once zoomed in (--laptop-half, from the
    // screen's centre).
    const fitZoom = () => {
      if (!bounds) return
      const { clientWidth: w, clientHeight: h } = el
      camera.updateMatrixWorld()
      const onScreen = (x: number, y: number, z: number, scale: number) => {
        const v = new Vector3(x, y - displayMiddle, z).multiplyScalar(scale).project(camera)
        return { x: v.x * (w / 2), y: ((1 - v.y) / 2) * h }
      }
      // The base's front corner is the laptop's widest and lowest point on
      // screen; the lid's top edge is its highest.
      const { min, max } = bounds
      const extent = (scale: number) => {
        const corner = onScreen(max.x, 0, max.z, scale)
        return { half: corner.x, bottom: corner.y, top: onScreen(0, max.y, min.z, scale).y }
      }
      const fits = ({ half, bottom, top }: ReturnType<typeof extent>) =>
        w < 768
          ? half <= w / 2 - ROOM.phoneSide && bottom <= h - ROOM.phoneBottom
          : half <= w / 2 - ROOM.side && top >= ROOM.top
      zoomTo = ZOOM
      while (zoomTo > 1 && !fits(extent(zoomTo))) zoomTo -= 0.01
      el.parentElement!.style.setProperty('--laptop-half', `${extent(zoomTo).half}px`)
    }

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      // Back the camera off until the laptop (≈1 unit wide, 0.75 tall open)
      // fills its share of the screen.
      const t = Math.tan(degToRad(FOV / 2))
      const widthShare = w < 768 ? 0.8 : 0.55
      const dist = Math.max(1 / (widthShare * 2 * t * camera.aspect), 0.75 / (0.6 * 2 * t))
      camera.position.set(0, dist * Math.sin(ELEVATION), dist * Math.cos(ELEVATION))
      camera.lookAt(0, 0, 0)
      viewHeight = 2 * dist * t
      sheetSize = w < 768 ? { w: w - 2 * SHEET.margin, h: h - SHEET.margin - SHEET.below } : null
      setSheet(sheetSize)
      fitZoom()
      render()
    }
    const settleLean = () => {
      lean.x += (lean.toX - lean.x) * 0.08
      lean.y += (lean.toY - lean.y) * 0.08
      if (progress > 0) render()
      const moving = Math.abs(lean.toX - lean.x) + Math.abs(lean.toY - lean.y) > 0.002
      lean.frame = moving ? requestAnimationFrame(settleLean) : 0
    }
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      lean.toX = (e.clientX / innerWidth) * 2 - 1
      lean.toY = (e.clientY / innerHeight) * 2 - 1
      if (!lean.frame) lean.frame = requestAnimationFrame(settleLean)
    }
    window.addEventListener('pointermove', onPointerMove)

    const observer = new ResizeObserver(resize)
    observer.observe(el)

    // The 8K texture only pays off where the laptop is drawn wider than a 4K
    // one can cover (big high-DPI screens); elsewhere it'd just cost memory.
    const detailed =
      innerWidth * devicePixelRatio >= 2000 && renderer.capabilities.maxTextureSize >= 8192
    const url = asset(detailed ? 'models/laptop-8k.glb' : 'models/laptop.glb')

    let disposed = false
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(url, (gltf) => {
      if (disposed) return
      // Keep the texture sharp where it's seen at a slant, like the keyboard.
      gltf.scene.traverse((object) => {
        const map = object instanceof Mesh && (object.material as MeshBasicMaterial).map
        if (map) map.anisotropy = renderer.capabilities.getMaxAnisotropy()
      })
      bounds = new Box3().setFromObject(gltf.scene)
      rig.add(gltf.scene)
      lid = gltf.scene.getObjectByName('lid')!
      tilt = lid.userData.closeAngle - Math.PI / 2
      // Drawn over the lid regardless of depth: the generated display isn't
      // quite flat, and nothing's ever in front of it while it shows.
      blank = new Mesh(
        roundedRect(2 * GLASS.halfWidth, GLASS.top - GLASS.bottom, GLASS.radius),
        new MeshBasicMaterial({ color: 0x000000, transparent: true, depthTest: false }),
      )
      blank.position.copy(onDisplay(0, (GLASS.top + GLASS.bottom) / 2))
      blank.rotation.x = -tilt
      lid.add(blank)
      const middle = onDisplay(0, (DISPLAY.top + DISPLAY.bottom) / 2).add(lid.position)
      displayMiddle = middle.y - Math.tan(ELEVATION) * middle.z
      fitZoom()
      render()
      el.style.opacity = '1'
    })

    return () => {
      disposed = true
      observer.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      cancelAnimationFrame(lean.frame)
      renderer.dispose()
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvas}
        aria-hidden
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700"
      />
      {/* On the display it's screen-blended, so its black shows the blacked-out
          display beneath and only lit content appears, as if from the screen
          itself; as the phone panel it's an ordinary opaque card. Either way
          it's a size container, so the slides can lay out for the narrow panel. */}
      <div
        ref={display}
        className={`invisible absolute top-0 left-0 origin-top-left overflow-hidden bg-black [container-type:size] ${sheet ? 'border border-white/10' : 'mix-blend-screen'}`}
        style={
          sheet
            ? { width: sheet.w, height: sheet.h, borderRadius: 28 }
            : { width: DISPLAY_W, height: DISPLAY_H, borderRadius: DISPLAY_RADIUS_PX }
        }
      >
        {children}
        {!sheet && (
          <div
            aria-hidden
            className="absolute top-0 left-1/2 h-[24px] w-[144px] -translate-x-1/2 rounded-b-[14px] bg-black"
          />
        )}
      </div>
    </>
  )
}

// A width×height rectangle centred on the origin with all corners rounded.
function roundedRect(width: number, height: number, radius: number) {
  const [x, y] = [width / 2 - radius, height / 2 - radius]
  const shape = new Shape()
  shape.absarc(x, y, radius, 0, Math.PI / 2)
  shape.absarc(-x, y, radius, Math.PI / 2, Math.PI)
  shape.absarc(-x, -y, radius, Math.PI, (3 * Math.PI) / 2)
  shape.absarc(x, -y, radius, (3 * Math.PI) / 2, 2 * Math.PI)
  return new ShapeGeometry(shape, 24)
}

// CSS matrix3d mapping a w×h box onto a quad given as [top-left, top-right,
// bottom-right, bottom-left] points (Heckbert's square-to-quad projection).
function quadTransform(w: number, h: number, quad: number[][]) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = quad
  const sx = x0 - x1 + x2 - x3
  const sy = y0 - y1 + y2 - y3
  const [dx1, dx2, dy1, dy2] = [x1 - x2, x3 - x2, y1 - y2, y3 - y2]
  const den = dx1 * dy2 - dx2 * dy1
  const g = (sx * dy2 - dx2 * sy) / den
  const k = (dx1 * sy - sx * dy1) / den
  const [a, b, d, e] = [x1 - x0 + g * x1, x3 - x0 + k * x3, y1 - y0 + g * y1, y3 - y0 + k * y3]
  return `matrix3d(${[a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1]})`
}
