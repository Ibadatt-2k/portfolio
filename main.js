import { color } from 'three/tsl';
import './src/App.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render(scene,camera);

const geomerty= new THREE.TorusGeometry(9,1,16,100);
const material= new THREE.MeshStandardMaterial({color: 0xFF6347});
const torus = new THREE.Mesh(geomerty, material);

scene.add(torus)

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5,5,5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);


const controls = new OrbitControls(camera, renderer.domElement);

function addStar(){
    const geomerty = new THREE.SphereGeometry(0.15,54,74);
    const material = new THREE.MeshStandardMaterial({color: 0xffffff})
    const star = new THREE.Mesh(geomerty, material);

    const [x,y,z] = Array(3).fill().map(()=> THREE.MathUtils.randFloatSpread(100));
    star.position.set(x,y,z);
    scene.add(star);
}
Array (200).fill().forEach(addStar)

const euphoraTexture = new THREE.TextureLoader().load('./src/assets/euphora.jpg');
const euphora = new THREE.Mesh(
    new THREE.SphereGeometry(6, 66, 66),
    new THREE.MeshStandardMaterial({
        map: euphoraTexture,
    })
);
scene.add(euphora);

// Reposition objects dynamically based on screen size
function updatePositions() {
    const width = window.innerWidth;

    if (width > 1200) {
        // Desktop layout
        torus.position.set(0, 0, 0);
        euphora.position.set(0, 0, 0);
    } else if (width > 768) {
        // Tablet layout
        torus.position.set(-2, 0, 0);
        euphora.position.set(-2, 0, 0);
    } else {
        // Mobile layout
        torus.position.set(0, -5, 0);
        euphora.position.set(0, -5, 0);
    }

    // Update camera and renderer for new dimensions
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
// Add resize event listener
window.addEventListener('resize', updatePositions);
function animate(){
    requestAnimationFrame(animate);
    torus.rotation.x += 0.01;
    torus.rotation.y += 0.005;
    torus.rotation.z += 0.01;

    euphora.rotation.x +=0.01;
    euphora.rotation.y += 0.005;
    controls.update();
    renderer.render(scene, camera);
}
updatePositions();
animate();

