// Szene, Kamera und Renderer erstellen
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app-container').appendChild(renderer.domElement);

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
                updateSceneTree();
            });
        };
        reader.readAsArrayBuffer(file);
    }
});

// Funktion zur Farbänderung
document.getElementById('colorPicker').addEventListener('input', function (event) {
    if (model) {
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.color.set(event.target.value);
                child.material.transparent = true;
                child.material.opacity = 1.0;
            }
        });
    }
});

// Funktion zur Hintergrundfarbe-Änderung
document.getElementById('bgColorPicker').addEventListener('input', function (event) {
    renderer.setClearColor(event.target.value);
});

// Funktion zur Bodenfarbe-Änderung
document.getElementById('groundColorPicker').addEventListener('input', function (event) {
    ground.material.color.set(event.target.value);
});

// Textur-Upload und Anwendung
document.getElementById('texturePicker').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file && model) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const texture = new THREE.TextureLoader().load(e.target.result);
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                }
            });
        };
        reader.readAsDataURL(file);
    }
});

// Funktion zur Aktualisierung des Szenenbaums
function updateSceneTree() {
    const tree = document.getElementById('scene-tree');
    tree.innerHTML = '';  // Szene löschen
    addNodeToTree(tree, camera, 'Kamera');
    addNodeToTree(tree, light, 'Licht');
    if (model) {
        addNodeToTree(tree, model, 'Modell');
    }
}

function addNodeToTree(parent, object, label) {
    const li = document.createElement('li');
    li.textContent = label;
    li.onclick = () => {
        controls.target.copy(object.position);
        camera.position.set(object.position.x + 2, object.position.y + 2, object.position.z + 2);
        controls.update();
    };
    parent.appendChild(li);

    if (object.children.length > 0) {
        const ul = document.createElement('ul');
        object.children.forEach(child => {
            addNodeToTree(ul, child, child.name || 'Unbenanntes Objekt');
        });
        li.appendChild(ul);
    }
}

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
