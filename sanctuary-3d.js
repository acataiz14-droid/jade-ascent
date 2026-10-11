/**
 * sanctuary-3d.js
 * 2.5D Isometric Living Chinese Inn Simulation (Three.js)
 * Inspired by Cozy Nest / Happy Street Architecture & Living Simulation
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class TaoistInn3D {
  constructor(options) {
    this.container = options.container;
    this.canvas = options.canvas;
    this.overlaysContainer = options.overlays;
    this.sanctuaryData = options.sanctuaryData;
    this.guestState = options.guestState || [];
    this.activePet = options.activePet;
    this.furnitureCatalog = options.furnitureCatalog || [];
    this.onGuestClick = options.onGuestClick;
    this.onPetClick = options.onPetClick;
    this.onSpeakChinese = options.onSpeakChinese;
    this.onOpenQuest = options.onOpenQuest;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.clock = new THREE.Clock();
    this.animFrameId = null;
    this.disposed = false;

    // Interactive actors & particles
    this.guestActors = [];
    this.petActor = null;
    this.petalParticles = [];
    this.smokeParticles = [];
    this.lanternMeshes = [];
    this.bubbleElements = new Map();
    this.questElements = new Map();

    // Raycaster for mouse/touch interactions
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.init();
  }

  init() {
    if (!this.container || !this.canvas) return;

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 520;

    // 1. Scene & Atmosphere (Celestial Jade Realm Sky & Mist)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0fdf4);
    this.scene.fog = new THREE.FogExp2(0xf0fdf4, 0.006);

    // 2. Orthographic 2.5D Isometric Camera
    const aspect = width / height;
    const d = 11.5; // Frustum vertical half-height
    this.camera = new THREE.OrthographicCamera(
      -d * aspect, d * aspect,
      d, -d,
      0.1, 1000
    );
    // Standard 30° elevation isometric orientation
    this.camera.position.set(24, 21, 24);
    this.camera.lookAt(0, 4.2, 0);

    // 3. Renderer with soft shadows
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0xf0fdf4, 1.0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. OrbitControls for smooth panning & zooming
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 4.5, 0);
    this.controls.minPolarAngle = Math.PI / 6; // 30°
    this.controls.maxPolarAngle = Math.PI / 2.3; // 78° (keep above ground)
    this.controls.minZoom = 0.65;
    this.controls.maxZoom = 2.4;
    this.controls.enablePan = true;

    // 5. Lighting: Warm Taoist Palace & Sunlight
    const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x94a3b8, 0.85);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.25);
    dirLight.position.set(18, 30, 16);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.left = -18;
    dirLight.shadow.camera.right = 18;
    dirLight.shadow.camera.top = 18;
    dirLight.shadow.camera.bottom = -18;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.bias = -0.0008;
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.35);
    fillLight.position.set(-15, 15, -15);
    this.scene.add(fillLight);

    // 6. Build the 3D World
    this.buildGroundAndCourtyard();
    this.buildPagodaInn();
    this.buildPeachBlossomTree();
    this.initPetalParticles();
    this.spawnGuests();
    this.spawnPet();

    // 7. Event Listeners
    this.setupInteractions();

    // 8. Start Animation Loop
    this.animate = this.animate.bind(this);
    this.animFrameId = requestAnimationFrame(this.animate);

    // 9. Resize Observer
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);
  }

  handleResize() {
    if (this.disposed || !this.container || !this.camera || !this.renderer) return;
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 520;
    const aspect = width / height;
    const d = 11.5;

    this.camera.left = -d * aspect;
    this.camera.right = d * aspect;
    this.camera.top = d;
    this.camera.bottom = -d;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  // --- PROCEDURAL 3D ENVIRONMENT ---
  buildGroundAndCourtyard() {
    const groundGroup = new THREE.Group();

    // 1. Floating Island Base (Rounded beveled box)
    const baseGeo = new THREE.BoxGeometry(22, 1.2, 20);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.85
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.6;
    baseMesh.receiveShadow = true;
    groundGroup.add(baseMesh);

    // Darker underside soil / rock layer
    const underGeo = new THREE.BoxGeometry(21.4, 0.8, 19.4);
    const underMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
    const underMesh = new THREE.Mesh(underGeo, underMat);
    underMesh.position.y = -1.5;
    groundGroup.add(underMesh);

    // 2. Grassy Lawn on the left & front
    const lawnGeo = new THREE.BoxGeometry(10, 0.05, 12);
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      roughness: 0.75
    });
    const lawnMesh = new THREE.Mesh(lawnGeo, lawnMat);
    lawnMesh.position.set(-5, 0.03, 3);
    lawnMesh.receiveShadow = true;
    groundGroup.add(lawnMesh);

    // 3. Stone Paver Path from entrance to garden
    const pathGroup = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const stoneGeo = new THREE.BoxGeometry(1.6, 0.06, 1.1);
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.9 });
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(-0.8 + (i % 2) * 0.2, 0.04, 2.5 + i * 1.0);
      stone.rotation.y = (Math.sin(i) * 0.1);
      stone.receiveShadow = true;
      pathGroup.add(stone);
    }
    groundGroup.add(pathGroup);

    // 4. Lotus Pond (สระบัวเซียน)
    const pondGeo = new THREE.BoxGeometry(7.2, 0.1, 5.5);
    const pondMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88
    });
    const pondMesh = new THREE.Mesh(pondGeo, pondMat);
    pondMesh.position.set(-6.5, 0.04, 4.5);
    groundGroup.add(pondMesh);

    // Pond Stone Rim
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
    const rimPoints = [
      [-6.5, 4.5 - 2.85, 7.4, 0.3], // north
      [-6.5, 4.5 + 2.85, 7.4, 0.3], // south
      [-6.5 - 3.7, 4.5, 0.3, 5.8],  // west
      [-6.5 + 3.7, 4.5, 0.3, 5.8]   // east
    ];
    rimPoints.forEach(([rx, rz, rw, rd]) => {
      const rim = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.16, rd), rimMat);
      rim.position.set(rx, 0.08, rz);
      rim.castShadow = true;
      groundGroup.add(rim);
    });

    // Floating Lotus Leaves & Blossoms in the pond
    const leafGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.02, 16);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 });
    const flowerGeo = new THREE.ConeGeometry(0.25, 0.35, 8);
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });

    [
      [-7.5, 3.8],
      [-5.5, 5.2],
      [-8.0, 5.8],
      [-6.0, 3.4]
    ].forEach(([lx, lz], i) => {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(lx, 0.07, lz);
      groundGroup.add(leaf);

      if (i % 2 === 0) {
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        flower.position.set(lx, 0.22, lz);
        flower.rotation.x = Math.PI;
        groundGroup.add(flower);
      }
    });

    this.scene.add(groundGroup);
  }

  buildPeachBlossomTree() {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(-6.8, 0, -2.5);

    // Twisted dark wood trunk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c2b14, roughness: 0.9 });
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 3.2, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.6;
    trunk.rotation.z = -0.08;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Main Branches
    const branch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2.0, 6), trunkMat);
    branch1.position.set(0.6, 2.6, 0.2);
    branch1.rotation.z = -0.55;
    branch1.castShadow = true;
    treeGroup.add(branch1);

    const branch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 1.8, 6), trunkMat);
    branch2.position.set(-0.5, 2.4, -0.3);
    branch2.rotation.z = 0.45;
    branch2.castShadow = true;
    treeGroup.add(branch2);

    // Fluffy pink blossom foliage clusters
    const blossomMat = new THREE.MeshStandardMaterial({
      color: 0xfbcfe8,
      roughness: 0.85
    });
    const blossomMatDeep = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.85
    });

    const clusters = [
      [0, 3.6, 0, 1.5, blossomMat],
      [1.2, 3.2, 0.4, 1.1, blossomMatDeep],
      [-1.0, 3.0, -0.3, 1.2, blossomMat],
      [0.4, 4.4, -0.2, 1.0, blossomMatDeep],
      [-0.5, 3.8, 0.6, 1.1, blossomMat]
    ];

    clusters.forEach(([cx, cy, cz, cr, cmat]) => {
      const sphere = new THREE.Mesh(new THREE.DodecahedronGeometry(cr, 1), cmat);
      sphere.position.set(cx, cy, cz);
      sphere.castShadow = true;
      treeGroup.add(sphere);
    });

    this.scene.add(treeGroup);
  }

  initPetalParticles() {
    const petalGeo = new THREE.PlaneGeometry(0.18, 0.18);
    const petalMat = new THREE.MeshBasicMaterial({
      color: 0xfbcfe8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });

    this.petalParticles = [];
    for (let i = 0; i < 35; i++) {
      const mesh = new THREE.Mesh(petalGeo, petalMat);
      mesh.position.set(
        -10 + Math.random() * 20,
        1 + Math.random() * 14,
        -8 + Math.random() * 18
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.scene.add(mesh);

      this.petalParticles.push({
        mesh,
        fallSpeed: 0.8 + Math.random() * 0.9,
        swaySpeed: 1.2 + Math.random() * 1.5,
        rotSpeed: 0.02 + Math.random() * 0.03,
        seed: Math.random() * 10
      });
    }
  }

  // --- MULTI-FLOOR TAOIST PAGODA DOLLHOUSE INN ---
  buildPagodaInn() {
    const innGroup = new THREE.Group();
    innGroup.position.set(3.5, 0, -1.0);

    const s = this.sanctuaryData;
    const innLevel = s.innLevel || 1;

    // Dimensions
    const bW = 12.0; // building width
    const bD = 9.0;  // building depth
    const fH = 3.6;  // floor height

    const woodDarkMat = new THREE.MeshStandardMaterial({ color: 0x5c2b14, roughness: 0.85 });
    const woodFloorMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
    const wallBackMat = new THREE.MeshStandardMaterial({ color: 0xfdfbf7, roughness: 0.9 });
    const latticeMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const tileGreenMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.5, metalness: 0.1 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.6 });

    // ==========================================
    // FLOOR 1: โถงน้ำชาเซียน (Tea Lounge & Reception)
    // ==========================================
    const f1Group = new THREE.Group();

    // Wooden Plank Deck
    const f1Deck = new THREE.Mesh(new THREE.BoxGeometry(bW, 0.25, bD), woodFloorMat);
    f1Deck.position.set(0, 0.12, 0);
    f1Deck.receiveShadow = true;
    f1Group.add(f1Deck);

    // Chinese Red Carpet
    const f1Carpet = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.02, 5.0), new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.85
    }));
    f1Carpet.position.set(-0.5, 0.26, 0);
    f1Carpet.receiveShadow = true;
    f1Group.add(f1Carpet);

    // Back Wall with Chinese Moon Window
    const f1BackWall = new THREE.Mesh(new THREE.BoxGeometry(bW, fH, 0.25), wallBackMat);
    f1BackWall.position.set(0, fH / 2, -bD / 2);
    f1BackWall.receiveShadow = true;
    f1Group.add(f1BackWall);

    // Moon Window Disc (circular opening appearance)
    const moonWindow = new THREE.Mesh(new THREE.CircleGeometry(1.2, 24), new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.2
    }));
    moonWindow.position.set(-0.5, fH * 0.65, -bD / 2 + 0.14);
    f1Group.add(moonWindow);

    // Moon Window Lattice Frame
    const moonFrame = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.25, 24), latticeMat);
    moonFrame.position.set(-0.5, fH * 0.65, -bD / 2 + 0.15);
    f1Group.add(moonFrame);

    // Right Wall (Half-height for cutaway 2.5D view)
    const f1RightWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, fH, bD), wallBackMat);
    f1RightWall.position.set(bW / 2, fH / 2, 0);
    f1RightWall.receiveShadow = true;
    f1Group.add(f1RightWall);

    // 4 Corner Wooden Pillars
    [
      [-bW / 2 + 0.3, -bD / 2 + 0.3],
      [bW / 2 - 0.3, -bD / 2 + 0.3],
      [-bW / 2 + 0.3, bD / 2 - 0.3],
      [bW / 2 - 0.3, bD / 2 - 0.3]
    ].forEach(([px, pz]) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, fH, 8), woodDarkMat);
      pillar.position.set(px, fH / 2, pz);
      pillar.castShadow = true;
      f1Group.add(pillar);
    });

    // Wooden Staircase leading to Floor 2
    const stairSteps = 8;
    for (let st = 0; st < stairSteps; st++) {
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.5), woodDarkMat);
      stepMesh.position.set(bW / 2 - 1.2, 0.2 + (st + 1) * (fH / (stairSteps + 1)), -bD / 2 + 1.2 + st * 0.45);
      stepMesh.castShadow = true;
      stepMesh.receiveShadow = true;
      f1Group.add(stepMesh);
    }

    // --- 3D FURNITURE: FLOOR 1 ---
    // 1. Tea Table (โต๊ะน้ำชาไม้หอม)
    const tableGroup = new THREE.Group();
    tableGroup.position.set(-2.5, 0.25, 0);
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.12, 16), woodDarkMat);
    tableTop.position.y = 0.55;
    tableTop.castShadow = true;
    tableGroup.add(tableTop);

    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.5, 8), woodDarkMat);
    tableLeg.position.y = 0.25;
    tableGroup.add(tableLeg);

    // Teapot & Cups
    const teapot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0x059669 }));
    teapot.position.set(0, 0.72, 0);
    tableGroup.add(teapot);

    const cup1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.1, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    cup1.position.set(0.4, 0.65, 0.2);
    tableGroup.add(cup1);
    f1Group.add(tableGroup);

    // 2. Incense Burner (กระถางกำยาน) with wafting smoke
    const incenseGroup = new THREE.Group();
    incenseGroup.position.set(2.0, 0.25, 1.5);
    const burnerBase = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.4, 8), goldMat);
    burnerBase.position.y = 0.2;
    burnerBase.castShadow = true;
    incenseGroup.add(burnerBase);

    const censerCover = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 8), goldMat);
    censerCover.position.y = 0.45;
    incenseGroup.add(censerCover);
    f1Group.add(incenseGroup);
    this.incenseSourcePos = new THREE.Vector3(innGroup.position.x + 2.0, 0.9, innGroup.position.z + 1.5);

    innGroup.add(f1Group);

    // ==========================================
    // FLOOR 2: หอตำรา & ห้องบัณฑิต (Unlocked if Lv >= 2)
    // ==========================================
    const f2Unlocked = innLevel >= 2;
    const f2Group = new THREE.Group();
    f2Group.position.y = fH;

    if (f2Unlocked) {
      // Loft Deck with Stair Void
      const f2Deck = new THREE.Mesh(new THREE.BoxGeometry(bW - 2.5, 0.25, bD), woodFloorMat);
      f2Deck.position.set(-1.25, 0.12, 0);
      f2Deck.receiveShadow = true;
      f2Group.add(f2Deck);

      // Back Wall
      const f2BackWall = new THREE.Mesh(new THREE.BoxGeometry(bW, fH, 0.25), wallBackMat);
      f2BackWall.position.set(0, fH / 2, -bD / 2);
      f2BackWall.receiveShadow = true;
      f2Group.add(f2BackWall);

      // Railing along open edge
      const railGeo = new THREE.BoxGeometry(0.12, 0.7, bD - 1.0);
      const railMesh = new THREE.Mesh(railGeo, woodDarkMat);
      railMesh.position.set(bW / 2 - 2.5, 0.5, 0.5);
      f2Group.add(railMesh);

      // 4 Pillars
      [
        [-bW / 2 + 0.3, -bD / 2 + 0.3],
        [bW / 2 - 0.3, -bD / 2 + 0.3],
        [-bW / 2 + 0.3, bD / 2 - 0.3],
        [bW / 2 - 0.3, bD / 2 - 0.3]
      ].forEach(([px, pz]) => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, fH, 8), woodDarkMat);
        pillar.position.set(px, fH / 2, pz);
        f2Group.add(pillar);
      });

      // --- 3D FURNITURE: FLOOR 2 ---
      // 1. Scholar Bookshelf (ตู้คัมภีร์ไม้พะยูง)
      const shelfGroup = new THREE.Group();
      shelfGroup.position.set(-3.5, 0.25, -bD / 2 + 0.8);
      const shelfFrame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.8, 0.7), woodDarkMat);
      shelfFrame.position.y = 1.4;
      shelfFrame.castShadow = true;
      shelfGroup.add(shelfFrame);

      // Colorful Scrolls & Books
      const scrollColors = [0xef4444, 0x3b82f6, 0xf59e0b, 0x10b981];
      for (let sIdx = 0; sIdx < 6; sIdx++) {
        const scMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 6), new THREE.MeshStandardMaterial({
          color: scrollColors[sIdx % scrollColors.length]
        }));
        scMesh.position.set(-1.1 + sIdx * 0.45, 1.2, 0.15);
        shelfGroup.add(scMesh);
      }
      f2Group.add(shelfGroup);

      // 2. Ancient Zither Table (กู่เจิงโบราณ)
      const zitherGroup = new THREE.Group();
      zitherGroup.position.set(0.5, 0.25, -1.5);
      const zTable = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 0.9), woodDarkMat);
      zTable.position.y = 0.6;
      zTable.castShadow = true;
      zitherGroup.add(zTable);

      const zInstrument = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.5), new THREE.MeshStandardMaterial({ color: 0x92400e }));
      zInstrument.position.y = 0.72;
      zitherGroup.add(zInstrument);
      f2Group.add(zitherGroup);

      // 3. Hanging Swaying Palace Lanterns
      [-2.5, 1.5].forEach((lx, lIdx) => {
        const lanternGroup = new THREE.Group();
        lanternGroup.position.set(lx, fH - 0.2, 1.0);

        const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6), woodDarkMat);
        cord.position.y = -0.3;
        lanternGroup.add(cord);

        const lanternBody = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.65, 6), new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0x991b1b,
          emissiveIntensity: 0.6
        }));
        lanternBody.position.y = -0.8;
        lanternGroup.add(lanternBody);

        const lLight = new THREE.PointLight(0xfef08a, 0.6, 6);
        lLight.position.y = -0.8;
        lanternGroup.add(lLight);

        f2Group.add(lanternGroup);
        this.lanternMeshes.push(lanternGroup);
      });
    } else {
      // Locked Floor 2 Scaffold / Hologram
      const lockBox = new THREE.Mesh(new THREE.BoxGeometry(bW, 0.1, bD), new THREE.MeshBasicMaterial({
        color: 0x94a3b8,
        wireframe: true
      }));
      lockBox.position.set(0, 0.05, 0);
      f2Group.add(lockBox);
    }

    innGroup.add(f2Group);

    // ==========================================
    // FLOOR 3: หอฝึกปราณ (Unlocked if Lv >= 4)
    // ==========================================
    const f3Unlocked = innLevel >= 4;
    const f3Group = new THREE.Group();
    f3Group.position.y = fH * 2;

    if (f3Unlocked) {
      const f3Deck = new THREE.Mesh(new THREE.BoxGeometry(bW * 0.85, 0.25, bD * 0.85), woodFloorMat);
      f3Deck.position.set(0, 0.12, 0);
      f3Deck.receiveShadow = true;
      f3Group.add(f3Deck);

      // Back Wall
      const f3BackWall = new THREE.Mesh(new THREE.BoxGeometry(bW * 0.85, fH * 0.85, 0.25), wallBackMat);
      f3BackWall.position.set(0, (fH * 0.85) / 2, -bD * 0.425);
      f3Group.add(f3BackWall);

      // Cloud Bed (เตียงเมฆานิทรา)
      const bedGroup = new THREE.Group();
      bedGroup.position.set(-2.0, 0.25, -1.0);
      const bedBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 1.8), goldMat);
      bedBase.position.y = 0.2;
      bedGroup.add(bedBase);

      const bedMattress = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 1.6), new THREE.MeshStandardMaterial({
        color: 0xf0f9ff,
        roughness: 0.95
      }));
      bedMattress.position.y = 0.45;
      bedGroup.add(bedMattress);
      f3Group.add(bedGroup);
    }
    innGroup.add(f3Group);

    // ==========================================
    // PAGODA ROOF: Upturned Chinese Flying Eaves
    // ==========================================
    const topFloorY = (f3Unlocked ? fH * 2.85 : (f2Unlocked ? fH * 2.0 : fH * 1.0));
    const roofGroup = new THREE.Group();
    // Offset toward the back wall so interior rooms are fully visible
    roofGroup.position.set(0, topFloorY + 0.35, -bD * 0.2);

    const roofWidth = f3Unlocked ? bW * 1.05 : bW * 1.15;
    const roofDepth = f3Unlocked ? bD * 0.85 : bD * 0.95;

    // Sloped Hip & Gable Chinese Roof Mesh
    const roofGeo = new THREE.ConeGeometry(roofWidth * 0.65, 1.8, 4);
    const roofMesh = new THREE.Mesh(roofGeo, tileGreenMat);
    roofMesh.position.y = 0.9;
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.scale.set(1.0, 0.62, roofDepth / roofWidth);
    roofMesh.castShadow = true;
    roofGroup.add(roofMesh);

    // Golden Finial
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), goldMat);
    finial.position.y = 1.85;
    roofGroup.add(finial);

    innGroup.add(roofGroup);

    this.scene.add(innGroup);
  }

  // --- 2.5D BILLBOARD GUESTS & WAYPOINT WANDERING ---
  spawnGuests() {
    this.guestActors = [];
    const innLevel = this.sanctuaryData.innLevel || 1;

    // Define waypoint routes on each floor
    const f1Waypoints = [
      new THREE.Vector3(1.0, 0.25, -1.0),
      new THREE.Vector3(5.0, 0.25, 1.0),
      new THREE.Vector3(3.0, 0.25, -2.5),
      new THREE.Vector3(2.5, 0.25, 2.0)
    ];

    const f2Waypoints = [
      new THREE.Vector3(0.5, 3.85, -2.0),
      new THREE.Vector3(4.0, 3.85, -1.0),
      new THREE.Vector3(2.5, 3.85, 1.5)
    ];

    const f3Waypoints = [
      new THREE.Vector3(1.5, 7.45, -1.5),
      new THREE.Vector3(4.5, 7.45, 0.5)
    ];

    this.guestState.forEach((guest, idx) => {
      // Pick appropriate floor waypoints
      let waypoints = f1Waypoints;
      let floorY = 0.25;
      if (guest.floor === 2 && innLevel >= 2) {
        waypoints = f2Waypoints;
        floorY = 3.85;
      } else if (guest.floor === 3 && innLevel >= 4) {
        waypoints = f3Waypoints;
        floorY = 7.45;
      }

      const startWp = waypoints[idx % waypoints.length];
      const actorGroup = new THREE.Group();
      actorGroup.position.copy(startWp);

      // Circular Drop Shadow on floor
      const shadowGeo = new THREE.CircleGeometry(0.55, 16);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.28
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.y = 0.02;
      actorGroup.add(shadowMesh);

      // 2.5D Billboard Sprite
      const spriteTexture = this.createActorTexture(guest.avatar, guest.name);
      const spriteMat = new THREE.SpriteMaterial({
        map: spriteTexture,
        transparent: true
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.9, 1.9, 1.0);
      sprite.position.y = 0.95;
      actorGroup.add(sprite);

      this.scene.add(actorGroup);

      this.guestActors.push({
        data: guest,
        group: actorGroup,
        sprite,
        shadow: shadowMesh,
        floorY,
        waypoints,
        currentWpIdx: idx % waypoints.length,
        targetPos: waypoints[(idx + 1) % waypoints.length].clone(),
        state: 'IDLE', // 'IDLE' or 'WALK'
        idleTimer: 1.5 + Math.random() * 3,
        walkTime: 0,
        speed: 1.1 + Math.random() * 0.4
      });

      // Create Floating 2.5D HTML Overlays for Speech & Quests
      this.createGuestOverlays(guest, idx);
    });
  }

  spawnPet() {
    if (!this.activePet) return;

    const petWps = [
      new THREE.Vector3(-6.0, 0.05, 1.5),
      new THREE.Vector3(-4.0, 0.05, 5.0),
      new THREE.Vector3(-8.0, 0.05, 3.5),
      new THREE.Vector3(-4.5, 0.05, -1.0)
    ];

    const actorGroup = new THREE.Group();
    actorGroup.position.copy(petWps[0]);

    // Drop Shadow
    const shadowMesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.65, 16),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    actorGroup.add(shadowMesh);

    // Sprite
    const spriteTexture = this.createActorTexture(this.activePet.emoji, this.activePet.name);
    const spriteMat = new THREE.SpriteMaterial({ map: spriteTexture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.0, 2.0, 1.0);
    sprite.position.y = 1.0;
    actorGroup.add(sprite);

    this.scene.add(actorGroup);

    this.petActor = {
      group: actorGroup,
      sprite,
      shadow: shadowMesh,
      waypoints: petWps,
      currentWpIdx: 0,
      targetPos: petWps[1].clone(),
      state: 'IDLE',
      idleTimer: 2.0,
      walkTime: 0,
      speed: 1.2
    };
  }

  createActorTexture(avatar, name) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Emoji Avatar
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(avatar, 64, 52);

    // Cute Name Pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(14, 96, 100, 24, 12);
    ctx.fill();
    ctx.stroke();

    // Name text
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 12px "Noto Sans Thai", sans-serif';
    ctx.fillText(name.slice(0, 7), 64, 109);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  createGuestOverlays(guest, idx) {
    if (!this.overlaysContainer) return;

    const q = guest.quotes[guest.quoteIndex % guest.quotes.length];

    // Speech Bubble DOM Element
    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'inn-3d-bubble';
    bubbleEl.innerHTML = `
      <div class="inn-3d-bubble-box" title="คลิกเพื่อฟังเสียงอ่านจีน">
        <div class="bubble-zh">${q.zh} <span class="bubble-audio-icon">🔊</span></div>
        <div class="bubble-py">${q.py}</div>
        <div class="bubble-th">"${q.th}"</div>
      </div>
    `;

    bubbleEl.onclick = (e) => {
      e.stopPropagation();
      if (this.onSpeakChinese) this.onSpeakChinese(q.zh);
      // Advance to next quote
      guest.quoteIndex = (guest.quoteIndex + 1) % guest.quotes.length;
      const nextQ = guest.quotes[guest.quoteIndex];
      bubbleEl.querySelector('.bubble-zh').innerHTML = `${nextQ.zh} <span class="bubble-audio-icon">🔊</span>`;
      bubbleEl.querySelector('.bubble-py').textContent = nextQ.py;
      bubbleEl.querySelector('.bubble-th').textContent = `"${nextQ.th}"`;
    };

    this.overlaysContainer.appendChild(bubbleEl);
    this.bubbleElements.set(guest.id, bubbleEl);

    // Quest Pill DOM Element (if guest has quest)
    if (guest.hasQuest && guest.quest) {
      const questEl = document.createElement('div');
      questEl.className = 'inn-3d-quest-pill pulse-glow';
      questEl.innerHTML = `<span>📜 คำขอของแขก</span>`;
      questEl.onclick = (e) => {
        e.stopPropagation();
        if (this.onOpenQuest) this.onOpenQuest(guest);
      };
      this.overlaysContainer.appendChild(questEl);
      this.questElements.set(guest.id, questEl);
    }
  }

  // --- RAYCASTING & INTERACTION ---
  setupInteractions() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Check click on pet
      if (this.petActor) {
        const petIntersects = this.raycaster.intersectObject(this.petActor.sprite);
        if (petIntersects.length > 0) {
          this.triggerPetHeartEffect();
          return;
        }
      }

      // Check click on guests
      for (const actor of this.guestActors) {
        const intersects = this.raycaster.intersectObject(actor.sprite);
        if (intersects.length > 0) {
          if (actor.data.hasQuest && this.onOpenQuest) {
            this.onOpenQuest(actor.data);
          } else {
            const q = actor.data.quotes[actor.data.quoteIndex % actor.data.quotes.length];
            if (this.onSpeakChinese) this.onSpeakChinese(q.zh);
          }
          return;
        }
      }
    });
  }

  triggerPetHeartEffect() {
    if (!this.petActor) return;
    const petPos = this.petActor.group.position;

    // Pop floating heart in 2.5D
    const heartEl = document.createElement('div');
    heartEl.className = 'floating-heart-particle';
    heartEl.textContent = '💖';
    heartEl.style.position = 'absolute';
    heartEl.style.fontSize = '1.8rem';
    heartEl.style.pointerEvents = 'none';
    heartEl.style.transition = 'all 1.2s ease-out';
    heartEl.style.zIndex = '30';

    const tempV = new THREE.Vector3(petPos.x, petPos.y + 1.2, petPos.z);
    tempV.project(this.camera);
    const rect = this.canvas.getBoundingClientRect();
    const x = (tempV.x * 0.5 + 0.5) * rect.width;
    const y = (-tempV.y * 0.5 + 0.5) * rect.height;

    heartEl.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    this.overlaysContainer.appendChild(heartEl);

    requestAnimationFrame(() => {
      heartEl.style.transform = `translate(-50%, -50%) translate(${x}px, ${y - 60}px) scale(1.4)`;
      heartEl.style.opacity = '0';
    });

    setTimeout(() => heartEl.remove(), 1200);

    if (this.onPetClick) this.onPetClick();
  }

  // --- CAMERA CONTROLS (LIKE COZY NEST) ---
  zoomIn() {
    this.controls.object.zoom = Math.min(2.4, this.controls.object.zoom * 1.25);
    this.controls.object.updateProjectionMatrix();
  }

  zoomOut() {
    this.controls.object.zoom = Math.max(0.65, this.controls.object.zoom / 1.25);
    this.controls.object.updateProjectionMatrix();
  }

  resetView() {
    this.camera.position.set(24, 21, 24);
    this.controls.target.set(0, 4.2, 0);
    this.controls.object.zoom = 1.0;
    this.controls.object.updateProjectionMatrix();
  }

  focusFloor(floorNum) {
    if (floorNum === 1) {
      this.controls.target.set(0, 1.8, 0);
      this.controls.object.zoom = 1.4;
    } else if (floorNum === 2) {
      this.controls.target.set(0, 5.2, 0);
      this.controls.object.zoom = 1.4;
    } else if (floorNum === 3) {
      this.controls.target.set(0, 8.8, 0);
      this.controls.object.zoom = 1.4;
    } else {
      this.resetView();
    }
    this.controls.object.updateProjectionMatrix();
  }

  // --- ANIMATION LOOP ---
  animate() {
    if (this.disposed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    this.controls.update();

    // 1. Animate Guests Wandering
    this.guestActors.forEach(actor => {
      if (actor.state === 'IDLE') {
        actor.idleTimer -= dt;
        // Breathing scale
        actor.sprite.scale.y = 1.9 * (1 + Math.sin(elapsedTime * 2.8) * 0.035);

        if (actor.idleTimer <= 0) {
          // Pick next waypoint
          actor.currentWpIdx = (actor.currentWpIdx + 1) % actor.waypoints.length;
          actor.targetPos.copy(actor.waypoints[actor.currentWpIdx]);
          actor.state = 'WALK';
        }
      } else if (actor.state === 'WALK') {
        actor.walkTime += dt;
        const cur = actor.group.position;
        const tgt = actor.targetPos;
        const dx = tgt.x - cur.x;
        const dz = tgt.z - cur.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 0.08) {
          cur.x += (dx / dist) * actor.speed * dt;
          cur.z += (dz / dist) * actor.speed * dt;

          // Cute walk bobbing & sway (Happy Street style!)
          actor.sprite.position.y = 0.95 + Math.abs(Math.sin(actor.walkTime * 8)) * 0.16;
          actor.sprite.material.rotation = Math.sin(actor.walkTime * 8) * 0.12;

          // Flip sprite X when changing direction
          actor.sprite.scale.x = (dx >= 0 ? 1 : -1) * 1.9;
        } else {
          // Arrived at waypoint
          actor.state = 'IDLE';
          actor.idleTimer = 3.0 + Math.random() * 3.5;
          actor.sprite.position.y = 0.95;
          actor.sprite.material.rotation = 0;
        }
      }
    });

    // 2. Animate Pet Wandering
    if (this.petActor) {
      const pet = this.petActor;
      if (pet.state === 'IDLE') {
        pet.idleTimer -= dt;
        pet.sprite.scale.y = 2.0 * (1 + Math.sin(elapsedTime * 3.2) * 0.04);
        if (pet.idleTimer <= 0) {
          pet.currentWpIdx = (pet.currentWpIdx + 1) % pet.waypoints.length;
          pet.targetPos.copy(pet.waypoints[pet.currentWpIdx]);
          pet.state = 'WALK';
        }
      } else if (pet.state === 'WALK') {
        pet.walkTime += dt;
        const cur = pet.group.position;
        const tgt = pet.targetPos;
        const dx = tgt.x - cur.x;
        const dz = tgt.z - cur.z;
        const dist = Math.hypot(dx, dz);

        if (dist > 0.1) {
          cur.x += (dx / dist) * pet.speed * dt;
          cur.z += (dz / dist) * pet.speed * dt;
          pet.sprite.position.y = 1.0 + Math.abs(Math.sin(pet.walkTime * 7)) * 0.22;
          pet.sprite.scale.x = (dx >= 0 ? 1 : -1) * 2.0;
        } else {
          pet.state = 'IDLE';
          pet.idleTimer = 2.5 + Math.random() * 3.0;
          pet.sprite.position.y = 1.0;
        }
      }
    }

    // 3. Falling Peach Blossom Petals
    this.petalParticles.forEach(p => {
      p.mesh.position.y -= p.fallSpeed * dt;
      p.mesh.position.x += Math.sin(elapsedTime * p.swaySpeed + p.seed) * 0.018;
      p.mesh.position.z += Math.cos(elapsedTime * p.swaySpeed + p.seed) * 0.015;
      p.mesh.rotation.x += p.rotSpeed;
      p.mesh.rotation.y += p.rotSpeed;

      // Reset when reaching ground
      if (p.mesh.position.y < 0.2) {
        p.mesh.position.y = 14 + Math.random() * 4;
        p.mesh.position.x = -10 + Math.random() * 20;
        p.mesh.position.z = -8 + Math.random() * 18;
      }
    });

    // 4. Swaying Hanging Lanterns
    this.lanternMeshes.forEach((lantern, idx) => {
      lantern.rotation.z = Math.sin(elapsedTime * 2.2 + idx) * 0.12;
      lantern.rotation.x = Math.cos(elapsedTime * 1.8 + idx) * 0.08;
    });

    // 5. Update Projected 2.5D HTML Overlays (Speech Bubbles & Quest Pills)
    this.updateProjectedOverlays();

    // 6. Render
    this.renderer.render(this.scene, this.camera);
  }

  updateProjectedOverlays() {
    if (!this.overlaysContainer || !this.camera || !this.canvas) return;

    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const tempV = new THREE.Vector3();

    this.guestActors.forEach(actor => {
      const guest = actor.data;
      const bubbleEl = this.bubbleElements.get(guest.id);
      const questEl = this.questElements.get(guest.id);

      // 3D coordinates above character's head
      tempV.set(
        actor.group.position.x,
        actor.group.position.y + actor.sprite.position.y + 0.95,
        actor.group.position.z
      );
      tempV.project(this.camera);

      // Check if inside camera view frustum
      const isVisible = tempV.z < 1 && tempV.x >= -1.2 && tempV.x <= 1.2 && tempV.y >= -1.2 && tempV.y <= 1.2;

      if (bubbleEl) {
        if (isVisible) {
          const screenX = (tempV.x * 0.5 + 0.5) * width;
          const screenY = (-tempV.y * 0.5 + 0.5) * height;
          bubbleEl.style.display = 'block';
          bubbleEl.style.transform = `translate(-50%, -100%) translate(${screenX}px, ${screenY}px)`;
        } else {
          bubbleEl.style.display = 'none';
        }
      }

      if (questEl) {
        if (isVisible && guest.hasQuest) {
          const screenX = (tempV.x * 0.5 + 0.5) * width;
          const screenY = (-tempV.y * 0.5 + 0.5) * height;
          questEl.style.display = 'block';
          questEl.style.transform = `translate(-50%, -100%) translate(${screenX}px, ${screenY - 50}px)`;
        } else {
          questEl.style.display = 'none';
        }
      }
    });
  }

  // --- CLEANUP ---
  dispose() {
    this.disposed = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.controls) {
      this.controls.dispose();
    }

    // Clear Overlays
    if (this.overlaysContainer) {
      this.overlaysContainer.innerHTML = '';
    }
    this.bubbleElements.clear();
    this.questElements.clear();

    // Dispose Three.js objects
    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.renderer.domElement = null;
    }
  }
}
