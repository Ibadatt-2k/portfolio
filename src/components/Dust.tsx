import { useEffect, useImperativeHandle, useRef, type Ref, type RefObject } from 'react'

/**
 * A headline that forms from dust over `enter` and blows away as dust over
 * `exit` (progress windows). In between, and until it's first needed, it's
 * the page's own text.
 */
export type Snap = {
  target: RefObject<HTMLElement | null>
  enter?: [number, number]
  exit?: [number, number]
}

export type DustHandle = { setProgress: (p: number) => void }

type Props = { ref: Ref<DustHandle>; snaps: Snap[] }

// Each grain of a headline's dust is a CELL×CELL (CSS px) square of it.
const CELL = 2
// The share of a window each grain spends blowing away; the rest staggers
// when grains start, so the headline goes a patch at a time.
const LIFE = 0.45
const MAX_SCALE = 2

const INK = [0.047, 0.043, 0.039] // #0c0b0a
const CREAM = '0.937, 0.914, 0.875' // #efe9df

const COMMON = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 u_res;      // canvas px
uniform float u_time;
uniform float u_progress;

// A shaft of light slanting in from above the top-left, widening as it
// falls, and swinging a little as the story scrolls. 0 → 1.
float beam(vec2 px) {
  float h = u_res.y;
  vec2 source = vec2(0.1 * u_res.x, -0.4 * h);
  float angle = 0.6 + 0.035 * (u_progress - 2.);
  vec2 dir = vec2(sin(angle), cos(angle));
  vec2 d = px - source;
  float along = dot(d, dir);
  float across = abs(d.x * dir.y - d.y * dir.x);
  float width = 0.12 * h + along * 0.28;
  return smoothstep(width, width * 0.1, across) * smoothstep(0., 0.5 * h, along) * exp(-along / (1.9 * h));
}

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

// Canvas px (y down) to clip space.
vec4 clip(vec2 px) {
  vec2 c = px / u_res * 2. - 1.;
  return vec4(c.x, -c.y, 0., 1.);
}
`

// A headline's grid of cells, and when (0 → 1 of its dissolve) each one goes:
// mostly left to right, in ragged patches.
const SNAP = /* glsl */ `
uniform vec2 u_origin;   // the headline's top-left, canvas px
uniform vec2 u_cells;    // its grid, in cells
uniform float u_cell;    // a cell's size, canvas px
uniform float u_d;       // how far it's gone, 0 → 1
const float LIFE = ${LIFE.toFixed(2)};

float start(vec2 cell) {
  float sweep = cell.x / u_cells.x;
  float patches = 0.7 * noise(cell / 14.) + 0.3 * noise(cell / 4.);
  return clamp(0.6 * sweep + 0.32 * patches + 0.08 * hash(cell), 0., 1.) * (1. - LIFE);
}
`

const FULLSCREEN_VERT = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2. - 1., 0., 1.);
}
`

// Ink, the light shaft, a vignette, and film grain that changes 12 times a second.
const ROOM_FRAG = `${COMMON}
out vec4 color;
void main() {
  vec2 px = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec3 col = vec3(${INK.join(', ')}) + vec3(${CREAM}) * beam(px) * 0.06;
  vec2 uv = px / u_res - 0.5;
  col *= 1. - 0.45 * dot(uv, uv);
  col += (hash(gl_FragCoord.xy + floor(u_time * 12.) * vec2(17.3, 41.9)) - 0.5) * 0.035;
  color = vec4(col, 1.);
}
`

// Motes hanging in the air: far ones small and sharp, near ones big and out
// of focus, all drifting up and right, glinting where the light catches them.
// Nearer ones pass faster as the story scrolls.
const MOTE_VERT = `${COMMON}
in vec4 a_mote; // x, y (0 → 1), depth (0 far → 1 near), phase
uniform float u_scale;
out float v_alpha;
out float v_near;
void main() {
  float z = a_mote.z, t = u_time;
  vec2 p = a_mote.xy + vec2(0.006 + 0.012 * z, -0.004 - 0.008 * z) * t;
  p += vec2(sin(t * 0.21 + a_mote.w * 6.283), cos(t * 0.17 + a_mote.w * 4.1)) * 0.012;
  p.y -= u_progress * (0.04 + 0.2 * z);
  vec2 px = (fract(p) * 1.1 - 0.05) * u_res;
  gl_Position = clip(px);
  gl_PointSize = mix(1.5, 6., z * z) * u_scale;
  float twinkle = 0.75 + 0.25 * sin(t * 1.7 + a_mote.w * 40.);
  v_alpha = mix(0.16, 0.7, z) * (0.2 + 0.8 * beam(px)) * twinkle;
  v_near = z;
}
`

const MOTE_FRAG = /* glsl */ `#version 300 es
precision highp float;
in float v_alpha;
in float v_near;
out vec4 color;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.;
  float a = v_alpha * smoothstep(1., mix(0.5, 0., v_near), d);
  color = vec4(vec3(${CREAM}) * a, a);
}
`

// The part of a headline that hasn't gone yet: its picture, less the cells
// that have turned to dust.
const TEXT_VERT = `${COMMON}${SNAP}
out vec2 v_uv;
void main() {
  v_uv = vec2(gl_VertexID & 1, gl_VertexID >> 1);
  gl_Position = clip(u_origin + v_uv * u_cells * u_cell);
}
`

const TEXT_FRAG = `${COMMON}${SNAP}
uniform sampler2D u_text;
uniform vec2 u_texSize;
in vec2 v_uv;
out vec4 color;
void main() {
  vec2 px = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) - u_origin;
  if (u_d > start(floor(px / u_cell))) discard;
  color = texture(u_text, px / u_texSize);
}
`

// The cells that have gone, as grains blown up and to the right on eddying
// air, shrinking and greying to ash as they fade.
const GRAIN_VERT = `${COMMON}${SNAP}
in vec2 a_cell;
in vec4 a_color; // premultiplied
uniform float u_reach;   // how far the furthest grains fly, canvas px
uniform float u_travel;  // 0 to fade in place (reduced motion)
uniform float u_scale;
out vec4 v_color;
void main() {
  float q = clamp((u_d - start(a_cell)) / LIFE, 0., 1.);
  if (q <= 0. || q >= 1.) {
    gl_Position = vec4(2., 2., 0., 1.);
    gl_PointSize = 0.;
    return;
  }
  float r1 = hash(a_cell + 3.7), r2 = hash(a_cell + 9.1), r3 = hash(a_cell + 15.3);
  vec2 wind = vec2(1., -0.4 - 0.5 * r2) * u_reach * (0.3 + 0.7 * r1) * q * q;
  vec2 eddy = vec2(sin(q * 6. + r3 * 6.283), cos(q * 4.5 + r1 * 6.283)) * 26. * u_scale * q;
  gl_Position = clip(u_origin + (a_cell + 0.5) * u_cell + (wind + eddy) * u_travel);
  gl_PointSize = u_cell * mix(1., 0.35 + 0.45 * r2, q);
  vec3 ash = vec3(0.36, 0.33, 0.3) * a_color.a;
  v_color = vec4(mix(a_color.rgb, ash, q * 0.6), a_color.a) * pow(1. - q, 1.5);
}
`

const GRAIN_FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec4 v_color;
out vec4 color;
void main() {
  color = v_color;
}
`

type Program = { program: WebGLProgram; uniform: (name: string) => WebGLUniformLocation | null }

type Built = {
  texture: WebGLTexture
  vao: WebGLVertexArrayObject
  buffers: WebGLBuffer[]
  count: number
  origin: [number, number]
  cells: [number, number]
  cell: number
  texSize: [number, number]
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const through = ([a, b]: [number, number], p: number) => clamp01((p - a) / (b - a))

/** How far a snap has turned to dust at progress `p`: 1 before it forms, 0 while it's whole. */
const dissolved = ({ enter, exit }: Snap, p: number) =>
  Math.max(enter ? 1 - through(enter, p) : 0, exit ? through(exit, p) : 0)

/**
 * The room behind everything (ink, a shaft of light, dust in the air) and
 * the headlines' turning to dust. Headlines stay the page's own text while
 * they're whole; this draws them only while they're going or coming back.
 */
export default function Dust({ ref, snaps }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const setProgress = useRef<(p: number) => void>(() => {})

  useImperativeHandle(ref, () => ({ setProgress: (p) => setProgress.current(p) }), [])

  useEffect(() => {
    const el = canvas.current!
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let progress = 0
    // Show a headline's own text as much as `opacity`. Once it's started to
    // go it's marked data-dust, so its letters (still laid out, where the
    // laptop's screen ends up) stop catching clicks; see .letter in index.css.
    const showText = ({ target }: Snap, opacity: string, d: number) => {
      const el = target.current
      if (!el) return
      if (el.style.opacity !== opacity) el.style.opacity = opacity
      el.toggleAttribute('data-dust', d > 0)
    }
    // Without WebGL the headlines simply fade.
    const fade = () =>
      snaps.forEach((snap) => {
        const d = dissolved(snap, progress)
        showText(snap, String(1 - d), d)
      })
    const gl = el.getContext('webgl2', { alpha: false, antialias: false, premultipliedAlpha: true })
    if (!gl) {
      setProgress.current = (p) => {
        progress = p
        fade()
      }
      fade()
      return
    }

    const room = compile(gl, FULLSCREEN_VERT, ROOM_FRAG)
    const motes = compile(gl, MOTE_VERT, MOTE_FRAG)
    const text = compile(gl, TEXT_VERT, TEXT_FRAG)
    const grains = compile(gl, GRAIN_VERT, GRAIN_FRAG)
    gl.enable(gl.BLEND)

    let scale = 1
    let built: (Built | null)[] = snaps.map(() => null)

    // The motes: one per ~3500 CSS px² of the first screen.
    const moteCount = Math.round(Math.min(700, Math.max(120, (innerWidth * innerHeight) / 3500)))
    const moteData = new Float32Array(moteCount * 4).map((_, i) =>
      i % 4 === 2 ? Math.random() ** 1.6 : Math.random(),
    )
    const moteVao = gl.createVertexArray()!
    gl.bindVertexArray(moteVao)
    const moteBuffer = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, moteBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, moteData, gl.STATIC_DRAW)
    const moteAttr = gl.getAttribLocation(motes.program, 'a_mote')
    gl.enableVertexAttribArray(moteAttr)
    gl.vertexAttribPointer(moteAttr, 4, gl.FLOAT, false, 0, 0)
    const emptyVao = gl.createVertexArray()!

    const free = (b: Built | null) => {
      if (!b) return
      gl.deleteTexture(b.texture)
      gl.deleteVertexArray(b.vao)
      b.buffers.forEach((buffer) => gl.deleteBuffer(buffer))
    }

    // Picture each headline where it's laid out, and cut it into grains.
    const build = () => {
      built.forEach(free)
      const offset = el.getBoundingClientRect()
      built = snaps.map(({ target }) => {
        const pic = target.current && picture(target.current, scale, offset)
        if (!pic) return null
        const { canvas: raster, origin } = pic
        const texture = gl.createTexture()!
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, raster)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        const cell = Math.max(1, Math.round(CELL * scale))
        const { width: w, height: h } = raster
        const [cx, cy] = [Math.ceil(w / cell), Math.ceil(h / cell)]
        const pixels = raster.getContext('2d')!.getImageData(0, 0, w, h).data
        const cells = new Uint16Array(cx * cy * 2)
        const colors = new Uint8Array(cx * cy * 4)
        let count = 0
        for (let j = 0; j < cy; j++) {
          for (let i = 0; i < cx; i++) {
            const x = Math.min(w - 1, i * cell + (cell >> 1))
            const y = Math.min(h - 1, j * cell + (cell >> 1))
            const k = (y * w + x) * 4
            const a = pixels[k + 3]
            if (a < 12) continue
            cells.set([i, j], count * 2)
            colors.set([(pixels[k] * a) / 255, (pixels[k + 1] * a) / 255, (pixels[k + 2] * a) / 255, a], count * 4)
            count++
          }
        }

        const vao = gl.createVertexArray()!
        gl.bindVertexArray(vao)
        const cellBuffer = gl.createBuffer()!
        gl.bindBuffer(gl.ARRAY_BUFFER, cellBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, cells.subarray(0, count * 2), gl.STATIC_DRAW)
        const cellAttr = gl.getAttribLocation(grains.program, 'a_cell')
        gl.enableVertexAttribArray(cellAttr)
        gl.vertexAttribPointer(cellAttr, 2, gl.UNSIGNED_SHORT, false, 0, 0)
        const colorBuffer = gl.createBuffer()!
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, colors.subarray(0, count * 4), gl.STATIC_DRAW)
        const colorAttr = gl.getAttribLocation(grains.program, 'a_color')
        gl.enableVertexAttribArray(colorAttr)
        gl.vertexAttribPointer(colorAttr, 4, gl.UNSIGNED_BYTE, true, 0, 0)

        return {
          texture,
          vao,
          buffers: [cellBuffer, colorBuffer],
          count,
          origin,
          cells: [cx, cy],
          cell,
          texSize: [w, h],
        } satisfies Built
      })
    }

    const shared = (p: Program, time: number) => {
      gl.useProgram(p.program)
      gl.uniform2f(p.uniform('u_res'), el.width, el.height)
      gl.uniform1f(p.uniform('u_time'), time)
      gl.uniform1f(p.uniform('u_progress'), progress)
    }

    const render = (now: number) => {
      const time = reduced ? 20 : now / 1000
      gl.viewport(0, 0, el.width, el.height)

      gl.bindVertexArray(emptyVao)
      gl.disable(gl.BLEND)
      shared(room, time)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE)
      shared(motes, time)
      gl.uniform1f(motes.uniform('u_scale'), scale)
      gl.bindVertexArray(moteVao)
      gl.drawArrays(gl.POINTS, 0, moteCount)

      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      snaps.forEach((snap, i) => {
        const b = built[i]
        const d = dissolved(snap, progress)
        // The page's text shows while the headline's whole (or until it's
        // been pictured), this picture of it while it's going.
        showText(snap, b ? (d > 0 ? '0' : '') : String(1 - d), d)
        if (!b || d <= 0 || d >= 1) return

        for (const p of [text, grains]) {
          shared(p, time)
          gl.uniform2f(p.uniform('u_origin'), ...b.origin)
          gl.uniform2f(p.uniform('u_cells'), ...b.cells)
          gl.uniform1f(p.uniform('u_cell'), b.cell)
          gl.uniform1f(p.uniform('u_d'), d)
        }
        gl.useProgram(text.program)
        gl.uniform2f(text.uniform('u_texSize'), ...b.texSize)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, b.texture)
        gl.uniform1i(text.uniform('u_text'), 0)
        gl.bindVertexArray(emptyVao)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        gl.useProgram(grains.program)
        gl.uniform1f(grains.uniform('u_reach'), 0.3 * el.width)
        gl.uniform1f(grains.uniform('u_travel'), reduced ? 0 : 1)
        gl.uniform1f(grains.uniform('u_scale'), scale)
        gl.bindVertexArray(b.vao)
        gl.drawArrays(gl.POINTS, 0, b.count)
      })
    }

    // Always moving (the motes), unless motion's reduced: then only on change.
    let frame = 0
    const loop = (now: number) => {
      render(now)
      frame = requestAnimationFrame(loop)
    }
    const draw = () => {
      if (reduced) render(0)
    }
    setProgress.current = (p) => {
      progress = p
      draw()
    }

    // Pictures are retaken once resizing settles, when the fonts are in.
    let timer = 0
    let fontsIn = false
    const observer = new ResizeObserver(() => {
      scale = Math.min(devicePixelRatio, MAX_SCALE)
      el.width = Math.round(el.clientWidth * scale)
      el.height = Math.round(el.clientHeight * scale)
      draw()
      clearTimeout(timer)
      if (fontsIn) timer = setTimeout(() => (build(), draw()), 150)
    })
    observer.observe(el)
    document.fonts.ready.then(() => {
      fontsIn = true
      build()
      draw()
    })
    if (!reduced) frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      observer.disconnect()
      built.forEach(free)
      gl.deleteBuffer(moteBuffer)
      gl.deleteVertexArray(moteVao)
      gl.deleteVertexArray(emptyVao)
      for (const { program } of [room, motes, text, grains]) gl.deleteProgram(program)
    }
  }, [])

  return <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" />
}

function compile(gl: WebGL2RenderingContext, vertex: string, fragment: string): Program {
  const program = gl.createProgram()!
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? '')
    gl.attachShader(program, shader)
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? '')
  const locations = new Map<string, WebGLUniformLocation | null>()
  const uniform = (name: string) => {
    if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name))
    return locations.get(name)!
  }
  return { program, uniform }
}

/**
 * Draw a headline's letters (and their text-shadows) where the page lays
 * them out, at `scale` canvas px per CSS px, lined up with the canvas's
 * pixels. Returns the picture and its top-left in canvas px.
 */
function picture(headline: HTMLElement, scale: number, offset: DOMRect) {
  const letters = [...headline.querySelectorAll<HTMLElement>('.letter')].map((letter) => {
    const range = document.createRange()
    range.selectNodeContents(letter)
    return { letter, style: getComputedStyle(letter), box: range.getBoundingClientRect() }
  })
  if (!letters.length) return null
  // Room around the letters for their shadows and italic overhangs.
  const pad = Math.max(...letters.map(({ style }) => parseFloat(style.fontSize))) * 0.25
  const left = Math.floor((Math.min(...letters.map(({ box }) => box.left)) - offset.left - pad) * scale)
  const top = Math.floor((Math.min(...letters.map(({ box }) => box.top)) - offset.top - pad) * scale)
  const right = Math.ceil((Math.max(...letters.map(({ box }) => box.right)) - offset.left + pad) * scale)
  const bottom = Math.ceil((Math.max(...letters.map(({ box }) => box.bottom)) - offset.top + pad) * scale)

  const canvas = document.createElement('canvas')
  canvas.width = right - left
  canvas.height = bottom - top
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.setTransform(scale, 0, 0, scale, -left - offset.left * scale, -top - offset.top * scale)
  for (const { letter, style, box } of letters) {
    const char = style.textTransform === 'uppercase' ? letter.textContent!.toUpperCase() : letter.textContent!
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    // The range spans the font's ascent above the baseline to its descent below.
    const baseline = box.top + ctx.measureText(char).fontBoundingBoxAscent
    const shadow = style.textShadow.match(/^(.+?)\s+(-?[\d.]+)px\s+(-?[\d.]+)px/)
    if (shadow) {
      ctx.fillStyle = shadow[1]
      ctx.fillText(char, box.left + Number(shadow[2]), baseline + Number(shadow[3]))
    }
    ctx.fillStyle = style.color
    ctx.fillText(char, box.left, baseline)
  }
  return { canvas, origin: [left, top] as [number, number] }
}
