// Turns the raw Tripo laptop export (one fused 67 MB mesh) into a web-ready
// GLB whose lid can hinge shut:
//
//   laptop
//   ├── base          (mesh)
//   └── lid           (pivot on the hinge; extras.closeAngle closes it)
//       └── lid-mesh
//
//   node scripts/build-laptop.mjs "<path to laptop 3d model.glb>"

import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, KHRMaterialsUnlit } from '@gltf-transform/extensions'
import {
  compactPrimitive,
  dedup,
  meshopt,
  prune,
  simplify,
  textureCompress,
  weld,
} from '@gltf-transform/functions'
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer'
import sharp from 'sharp'

const [input, output = 'public/models/laptop.glb'] = process.argv.slice(2)
if (!input) throw new Error('Usage: node scripts/build-laptop.mjs <source.glb> [output.glb]')

// Measurements of the source model (front is +z, units ≈ laptop width):
// the lid stands at the back, leaning TILT past vertical, with its screen
// face at z ≈ -0.3225; the keys top out at y ≈ 0.048.
const TILT = (6.54 * Math.PI) / 180
// Hinge axis (along x), placed so the closed screen rests just above the keys.
const HINGE = [0, 0.06, -0.335]
// A triangle belongs to the lid if it's behind the screen's face, or above
// the base (the tallest keys sit at z > -0.2).
const isLid = (y, z) => z < -0.319 || (y > 0.045 && z < -0.2)
// The generated base is deeper than a real MacBook's and its lid too short to
// cover it when shut, so squash the base a little and stretch the lid to match.
const BASE_DEPTH_SCALE = 0.88

await MeshoptEncoder.ready
await MeshoptSimplifier.ready

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder })
const doc = await io.read(input)
const root = doc.getRoot()
const [source] = root.listNodes()
const basePrim = source.getMesh().listPrimitives()[0]

// --- Split the fused mesh into base and lid triangles.
const pos = basePrim.getAttribute('POSITION').getArray()
const idx = basePrim.getIndices().getArray()
const lid = []
const base = []
for (let i = 0; i < idx.length; i += 3) {
  const [a, b, c] = [idx[i] * 3, idx[i + 1] * 3, idx[i + 2] * 3]
  const y = (pos[a + 1] + pos[b + 1] + pos[c + 1]) / 3
  const z = (pos[a + 2] + pos[b + 2] + pos[c + 2]) / 3
  ;(isLid(y, z) ? lid : base).push(idx[i], idx[i + 1], idx[i + 2])
}

const indices = (arr) =>
  doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(arr)).setBuffer(root.listBuffers()[0])

const lidPrim = basePrim.clone().setIndices(indices(lid))
basePrim.setIndices(indices(base))
compactPrimitive(basePrim)
compactPrimitive(lidPrim)

// --- Fix proportions, and move the lid's origin onto the hinge.
const [, hy, hz] = HINGE
// Unit vector running up the lid, from the hinge towards its top edge.
const [uy, uz] = [Math.cos(TILT), -Math.sin(TILT)]

const basePos = basePrim.getAttribute('POSITION').getArray()
let baseFront = -Infinity
for (let i = 0; i < basePos.length; i += 3) {
  basePos[i + 2] = hz + (basePos[i + 2] - hz) * BASE_DEPTH_SCALE
  baseFront = Math.max(baseFront, basePos[i + 2])
}

const lidPos = lidPrim.getAttribute('POSITION').getArray()
let lidLength = 0
for (let i = 0; i < lidPos.length; i += 3) {
  lidLength = Math.max(lidLength, (lidPos[i + 1] - hy) * uy + (lidPos[i + 2] - hz) * uz)
}
// Closed, the lid's top edge should line up with the base's front edge.
const stretch = (baseFront - hz) / lidLength
for (let i = 0; i < lidPos.length; i += 3) {
  const along = (lidPos[i + 1] - hy) * uy + (lidPos[i + 2] - hz) * uz
  const extra = along > 0 ? along * (stretch - 1) : 0
  lidPos[i] -= HINGE[0]
  lidPos[i + 1] += extra * uy - hy
  lidPos[i + 2] += extra * uz - hz
}
console.log(`split ${base.length / 3} base / ${lid.length / 3} lid triangles; lid stretched ×${stretch.toFixed(3)}`)

// --- Assemble the node tree.
source.setName('base').getMesh().setName('base')
const lidMesh = doc.createNode('lid-mesh').setMesh(doc.createMesh('lid').addPrimitive(lidPrim))
const lidPivot = doc
  .createNode('lid')
  .setTranslation(HINGE)
  .setExtras({ closeAngle: Math.PI / 2 + TILT })
  .addChild(lidMesh)
root.listScenes()[0].addChild(doc.createNode('laptop').addChild(source).addChild(lidPivot))

// --- Unlit: show the base colour texture as-is. Relighting it through the
// generated normal map smeared fine detail like the logo.
const unlit = doc.createExtension(KHRMaterialsUnlit)
for (const material of root.listMaterials()) {
  material
    .setExtension('KHR_materials_unlit', unlit.createUnlit())
    .setNormalTexture(null)
    .setMetallicRoughnessTexture(null)
}

// --- Shrink for the web: ~10% of the triangles, a 4K WebP texture, meshopt.
await doc.transform(
  prune(),
  dedup(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.1, error: 0.001 }),
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [4096, 4096] }),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
)

await io.write(output, doc)
console.log(`wrote ${output}`)
