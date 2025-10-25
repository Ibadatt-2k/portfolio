import "./src/App.css"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  antialias: true,
})

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
camera.position.setZ(30)
renderer.render(scene, camera)

// Enhanced Planet (Euphora)
const euphoraTexture = new THREE.TextureLoader().load(
  "https://raw.githubusercontent.com/Ibadatt-2k/portfolio/main/euphora.jpg",
)
euphoraTexture.anisotropy = renderer.capabilities.maxAnisotropy

const euphora = new THREE.Mesh(
  new THREE.SphereGeometry(6, 64, 64),
  new THREE.MeshStandardMaterial({
    map: euphoraTexture, // <- this is your image wrapped on the sphere
    roughness: 0.2,      // slightly matte, to look natural
    metalness: 0.2,        // no metallic shine
    emissiveIntensity: 1.2, // completely disables emissive glow
    transparent: false,  // solid planet
    opacity: 1,          // fully opaque
  }),
)
// Ambient light — lights everything equally
const SambientLight = new THREE.AmbientLight(0xfffff, 1.2) // increase from 2.0 if still dark
scene.add(SambientLight)

// Directional light — acts like sunlight
const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
directionalLight.position.set(10, 10, 10)
scene.add(directionalLight)

scene.add(euphora)




// Enhanced Red Saturn Ring with Glow
const ringGeometry = new THREE.TorusGeometry(9, 0.6, 32, 200)
const canvas = document.createElement("canvas")
canvas.width = 512
canvas.height = 1
const ctx = canvas.getContext("2d")
const gradient = ctx.createLinearGradient(0, 0, 512, 0)
gradient.addColorStop(0, "#8B0000")
gradient.addColorStop(0.2, "#DC143C")
gradient.addColorStop(0.4, "#FF0000")
gradient.addColorStop(0.5, "#FF4500")
gradient.addColorStop(0.6, "#FF0000")
gradient.addColorStop(0.8, "#DC143C")
gradient.addColorStop(1, "#8B0000")
ctx.fillStyle = gradient
ctx.fillRect(0, 0, 512, 90)
const ringTexture = new THREE.CanvasTexture(canvas)

const ringMaterial = new THREE.MeshStandardMaterial({
  map: ringTexture,
  color: 0xff6666,
  emissive: 0xff1a1a,
  emissiveIntensity: 1.2,
  roughness: 0.9,
  metalness: 0.1,
  transparent: true,
  opacity: 0.9,
  side: THREE.DoubleSide,
})

const rings = new THREE.Mesh(ringGeometry, ringMaterial)
rings.rotation.x = Math.PI / 2
scene.add(rings)

// Ring Glow Effect
const ringGlowGeometry = new THREE.TorusGeometry(9, 0.8, 32, 200)
const ringGlowMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  transparent: true,
  opacity: 0.3,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
})
const ringGlow = new THREE.Mesh(ringGlowGeometry, ringGlowMaterial)
ringGlow.rotation.x = Math.PI / 2
scene.add(ringGlow)

// Enhanced Sun in Top Left Corner
const sunGeometry = new THREE.SphereGeometry(13, 64, 64)
const sunCanvas = document.createElement("canvas")
sunCanvas.width = 512
sunCanvas.height = 512
const sunCtx = sunCanvas.getContext("2d")
const sunGradient = sunCtx.createRadialGradient(256, 256, 0, 256, 256, 256)
sunGradient.addColorStop(0, "#FFF5E1")
sunGradient.addColorStop(0.3, "#FFD700")
sunGradient.addColorStop(0.5, "#FFA500")
sunGradient.addColorStop(0.7, "#FF8C00")
sunGradient.addColorStop(1, "#FF4500")
sunCtx.fillStyle = sunGradient
sunCtx.fillRect(0, 0, 512, 512)
for (let i = 0; i < 50; i++) {
  const x = Math.random() * 512
  const y = Math.random() * 512
  const radius = Math.random() * 20 + 10
  sunCtx.fillStyle = "rgba(139, 69, 19, 0.3)"
  sunCtx.beginPath()
  sunCtx.arc(x, y, radius, 0, Math.PI * 2)
  sunCtx.fill()
}
const sunTexture = new THREE.CanvasTexture(sunCanvas)

const sunMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture,
  emissive: 0xffa500,
  emissiveIntensity: 1.5,
})
const sun = new THREE.Mesh(sunGeometry, sunMaterial)
sun.position.set(-35, 20, -30)
scene.add(sun)

// Sun 360-degree Glow Layers
const sunGlowLayers = []
for (let i = 0; i < 3; i++) {
  const glowGeometry = new THREE.SphereGeometry(13 + (i + 1) * 2.5, 32, 32)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: i === 0 ? 0xffa500 : 0xff8c00,
    transparent: true,
    opacity: 0.15 - i * 0.04,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  })
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
  glowMesh.position.copy(sun.position)
  scene.add(glowMesh)
  sunGlowLayers.push(glowMesh)
}

// Enhanced Glowing Space Dust (Round Stars)
const dustGeometry = new THREE.BufferGeometry()
const dustCount = 800
const dustPositions = new Float32Array(dustCount * 3)
const dustSizes = new Float32Array(dustCount)

for (let i = 0; i < dustCount; i++) {
  dustPositions[i * 3] = (Math.random() - 0.5) * 200
  dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 200
  dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 200
  dustSizes[i] = Math.random() * 2 + 0.5
}

dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3))
dustGeometry.setAttribute("size", new THREE.BufferAttribute(dustSizes, 1))

const dustCanvas = document.createElement("canvas")
dustCanvas.width = 64
dustCanvas.height = 64
const dustCtx = dustCanvas.getContext("2d")
const dustGradient = dustCtx.createRadialGradient(32, 32, 0, 32, 32, 32)
dustGradient.addColorStop(0, "rgba(255, 255, 255, 1)")
dustGradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)")
dustGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)")
dustGradient.addColorStop(1, "rgba(255, 255, 255, 0)")
dustCtx.fillStyle = dustGradient
dustCtx.fillRect(0, 0, 64, 64)
const dustTexture = new THREE.CanvasTexture(dustCanvas)

const dustMaterial = new THREE.PointsMaterial({
  size: 2,
  map: dustTexture,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true,
  vertexColors: false,
})

const dust = new THREE.Points(dustGeometry, dustMaterial)
scene.add(dust)

// Lighting
const pointLight = new THREE.PointLight(0xffffff, 1.5)
pointLight.position.set(5, 5, 5)
const ambientLight = new THREE.AmbientLight(0x404040, 0.8)
const sunLight = new THREE.PointLight(0xffa500, 2, 100)
sunLight.position.copy(sun.position)
scene.add(pointLight, ambientLight, sunLight)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05

// Scroll-based Camera Movement
let scrollY = 0
window.addEventListener("scroll", () => {
  scrollY = window.scrollY
})

// Reposition objects dynamically based on screen size
function updatePositions() {
  const width = window.innerWidth
  const height = window.innerHeight

  camera.aspect = width / height       // <--- keep aspect ratio correct
  camera.updateProjectionMatrix()      // <--- apply the change

  renderer.setSize(width, height)      // <--- resize canvas to match window
}

window.addEventListener("resize", updatePositions)
updatePositions()
// Animation Loop
function animate() {
  requestAnimationFrame(animate)

  // Rotate planet and rings
  rings.rotation.z += 0.002
  euphora.rotation.y += 0.002

  // Animate ring glow pulsing
  const glowPulse = Math.sin(Date.now() * 0.001) * 0.1 + 0.3
  ringGlow.material.opacity = glowPulse

  // Calculate sun position in top-left corner relative to camera
  const sunOffset = new THREE.Vector3(-15, 10, -20)
  const cameraDirection = new THREE.Vector3()
  camera.getWorldDirection(cameraDirection)

  // Position sun relative to camera's current position and orientation
  //sun.position.copy(camera.position).add(sunOffset)

  // Update sun glow layers to follow sun
  //sunGlowLayers.forEach((layer) => {
    //layer.position.copy(sun.position)
  //})

  // Update sun light position
  //sunLight.position.copy(sun.position)
  sun.position.set(-95, 40, -90)
  sunGlowLayers.forEach((layer, i) => {
    layer.position.copy(sun.position)
  })
  sunLight.position.copy(sun.position)

  // Scroll-based camera movement
  const scrollProgress = scrollY * 0.001
  const radius = 30
  camera.position.x = Math.sin(scrollProgress) * radius
  camera.position.z = Math.cos(scrollProgress) * radius
  camera.position.y = scrollProgress * 5
  camera.lookAt(0, 0, 0)

  // Rotate space dust slowly
  dust.rotation.y += 0.0002

  controls.update()
  renderer.render(scene, camera)
}

updatePositions()
animate()
