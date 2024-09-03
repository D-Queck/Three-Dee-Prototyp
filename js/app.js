// Szene, Kamera und Renderer erstellen
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x333333);  // Setzt eine initiale Hintergrundfarbe
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Beleuchtung
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

// Kamera Positionierung
camera.position.set(0, 2, 5);
controls.update();

// Boden hinzufügen
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Modellvariable
let model = null;

// Funktion zum Modell-Upload
document.getElementById('upload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const contents = e.target.result;
            const loader = new THREE.GLTFLoader();
            loader.parse(contents, '', function (gltf) {
                if (model) scene.remove(model);  // Entferne vorheriges Modell
                model = gltf.scene;
                scene.add(model);
            });
        };
        reader.readAsArrayBuffer(file);
    }
});

// Farbe für Bauteile ändern
document.getElementById('colorPicker').addEventListener('input', function (event) {
    if (model) {
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.color.set(event.target.value);
            }
        });
    }
});

// Hintergrundfarbe ändern
document.getElementById('bgColorPicker').addEventListener('input', function (event) {
    renderer.setClearColor(event.target.value);
});

// Bodenfarbe ändern
document.getElementById('groundColorPicker').addEventListener('input', function (event) {
    ground.material.color.set(event.target.value);
});

// Render Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Anpassung bei Fenstergrößeänderung
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
