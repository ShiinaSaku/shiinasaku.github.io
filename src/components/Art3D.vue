<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from "vue";
import * as THREE from "three";

/**
 * Art3D — an interactive Three.js sculpture "Aurora Crystal".
 * - Morphing icosahedron with GLSL noise-based vertex displacement
 * - Glowing inner core with additive blending (bloom-like)
 * - Three-layer particle systems (micro dust, orbiting sparks, halo ring)
 * - Fresnel rim shader with iridescent shimmer
 * - Parallax camera following pointer
 * - Theme-aware color palettes (dark/light)
 * - Respects prefers-reduced-motion
 */
const canvasRef = ref<HTMLCanvasElement | null>(null);
const wrapRef = ref<HTMLDivElement | null>(null);
const ready = ref(false);

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let frameId = 0;
let resizeObserver: ResizeObserver | null = null;
let prefersReducedMotion = false;

const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

// Brand palettes keyed by theme
const palette = {
  light: {
    crystalA: new THREE.Color(0xf75192),
    crystalB: new THREE.Color(0xae87cb),
    crystalC: new THREE.Color(0xf59e0b),
    rim: new THREE.Color(0xff73a9),
    core: new THREE.Color(0xf75192),
    wire: new THREE.Color(0xb9275f),
    particleA: new THREE.Color(0xf75192),
    particleB: new THREE.Color(0xae87cb),
    particleC: new THREE.Color(0xfbbf24),
    ring: new THREE.Color(0xdf3778),
  },
  dark: {
    crystalA: new THREE.Color(0xf75192),
    crystalB: new THREE.Color(0x8b5cf6),
    crystalC: new THREE.Color(0xfbbf24),
    rim: new THREE.Color(0xff73a9),
    core: new THREE.Color(0xf75192),
    wire: new THREE.Color(0xc7a8dd),
    particleA: new THREE.Color(0xff73a9),
    particleB: new THREE.Color(0xa78bfa),
    particleC: new THREE.Color(0xfbbf24),
    ring: new THREE.Color(0xf75192),
  },
};

function currentPalette() {
  return document.documentElement.classList.contains("dark")
    ? palette.dark
    : palette.light;
}

// ── Classic 3D simplex noise (Ashima/Stefan Gustavson) ──
const noiseGLSL = /* glsl */ `
  vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

// ── Crystal vertex shader: noise displacement + morph ──
const crystalVertex = /* glsl */ `
  uniform float uTime;
  uniform float uDistort;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vPos;
  varying float vNoise;
  ${noiseGLSL}
  void main() {
    vec3 pos = position;
    float n = snoise(pos * 1.4 + uTime * 0.25);
    float n2 = snoise(pos * 3.0 - uTime * 0.15);
    float displacement = (n * 0.5 + n2 * 0.3) * uDistort;
    pos += normal * displacement;
    vNoise = displacement;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    vPos = pos;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// ── Crystal fragment shader: fresnel + iridescent shimmer ──
const crystalFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vPos;
  varying float vNoise;

  void main() {
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.2);
    float grad = smoothstep(-1.2, 1.2, vPos.y);
    vec3 base = mix(uColorA, uColorB, grad);
    float shimmer = sin(vPos.x * 4.0 + vPos.z * 4.0 + uTime * 0.8) * 0.5 + 0.5;
    base = mix(base, uColorC, shimmer * 0.22 + vNoise * 0.15);
    vec3 rimColor = mix(uColorC, uColorA, 0.4);
    vec3 color = base + fresnel * rimColor * 1.1;
    float pulse = sin(uTime * 1.2) * 0.5 + 0.5;
    color += fresnel * uColorC * pulse * 0.3;
    gl_FragColor = vec4(color, 0.88 + fresnel * 0.12);
  }
`;

// ── Core glow vertex shader ──
const coreVertex = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// ── Core glow fragment: pure additive bloom ──
const coreFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
    float pulse = sin(uTime * 2.0) * 0.15 + 0.85;
    float alpha = fresnel * uOpacity * pulse;
    gl_FragColor = vec4(uColor * (1.0 + fresnel * 0.5), alpha);
  }
`;

let crystalMat: THREE.ShaderMaterial | null = null;
let coreMat: THREE.ShaderMaterial | null = null;
let crystal: THREE.Mesh | null = null;
let core: THREE.Mesh | null = null;
let wireMesh: THREE.LineSegments | null = null;
let wireMat: THREE.LineBasicMaterial | null = null;
let shardGroup: THREE.Group | null = null;
let particleSys: THREE.Points | null = null;
let particleMat: THREE.PointsMaterial | null = null;
let sparkSys: THREE.Points | null = null;
let sparkMat: THREE.PointsMaterial | null = null;
let ringMesh: THREE.Mesh | null = null;
let ringMat: THREE.Material | null = null;

const clock = shallowRef<THREE.Clock | null>(null);

function buildScene() {
  const canvas = canvasRef.value;
  const wrap = wrapRef.value;
  if (!canvas || !wrap) return;
  const pal = currentPalette();

  scene = new THREE.Scene();
  scene.background = null;

  const w = Math.max(1, wrap.clientWidth);
  const h = Math.max(1, wrap.clientHeight);

  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(0, 0, 6.0);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h, false);
  renderer.setClearColor(0x000000, 0);

  // ── Central morphing crystal ──
  crystalMat = new THREE.ShaderMaterial({
    vertexShader: crystalVertex,
    fragmentShader: crystalFragment,
    uniforms: {
      uColorA: { value: pal.crystalA },
      uColorB: { value: pal.crystalB },
      uColorC: { value: pal.crystalC },
      uTime: { value: 0 },
      uDistort: { value: 0.18 },
    },
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: true,
  });
  const crystalGeo = new THREE.SphereGeometry(1.1, 64, 64);
  crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.renderOrder = 2;
  scene.add(crystal);

  // ── Wireframe overlay on crystal ──
  wireMat = new THREE.LineBasicMaterial({ color: pal.wire, transparent: true, opacity: 0.35 });
  const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(1.1, 16, 16));
  wireMesh = new THREE.LineSegments(wireGeo, wireMat);
  crystal.add(wireMesh);

  // ── Inner glowing core (additive blending = bloom-like) ──
  coreMat = new THREE.ShaderMaterial({
    vertexShader: coreVertex,
    fragmentShader: coreFragment,
    uniforms: {
      uColor: { value: pal.core },
      uTime: { value: 0 },
      uOpacity: { value: 0.6 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    side: THREE.FrontSide,
  });
  const coreGeo = new THREE.SphereGeometry(0.65, 32, 32);
  core = new THREE.Mesh(coreGeo, coreMat);
  core.renderOrder = 1;
  scene.add(core);

  // ── Orbiting wireframe shards group ──
  shardGroup = new THREE.Group();
  shardGroup.renderOrder = 3;
  const shardCount = 6;
  for (let i = 0; i < shardCount; i++) {
    const sg = new THREE.IcosahedronGeometry(0.12 + Math.random() * 0.08, 0);
    const wm = new THREE.LineBasicMaterial({
      color: i % 2 === 0 ? pal.crystalA : pal.crystalB,
      transparent: true,
      opacity: 0.5,
    });
    const sw = new THREE.WireframeGeometry(sg);
    const shard = new THREE.LineSegments(sw, wm);
    shard.userData = {
      angle: (i / shardCount) * Math.PI * 2,
      radius: 1.7 + Math.random() * 0.5,
      speed: 0.3 + Math.random() * 0.5,
      spin: 0.5 + Math.random() * 1.5,
      yOffset: (Math.random() - 0.5) * 1.0,
    };
    shardGroup.add(shard);
  }
  scene.add(shardGroup);

  // ── Layer 1: ambient dust particles (many, tiny, slow drift) ──
  const pCount = 350;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pCol = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const r = 1.8 + Math.random() * 2.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pPos[i * 3 + 2] = r * Math.cos(phi);
    const mix = Math.random();
    const col = mix > 0.66 ? pal.particleA : mix > 0.33 ? pal.particleB : pal.particleC;
    pCol[i * 3] = col.r;
    pCol[i * 3 + 1] = col.g;
    pCol[i * 3 + 2] = col.b;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
  particleMat = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  particleSys = new THREE.Points(pGeo, particleMat);
  particleSys.renderOrder = 3;
  scene.add(particleSys);

  // ── Layer 2: orbiting sparks (fewer, bigger, faster) ──
  const sCount = 80;
  const sGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(sCount * 3);
  const sCol = new Float32Array(sCount * 3);
  const sData: { angle: number; radius: number; speed: number; yOff: number }[] = [];
  for (let i = 0; i < sCount; i++) {
    const radius = 1.3 + Math.random() * 1.2;
    const angle = Math.random() * Math.PI * 2;
    sData.push({ angle, radius, speed: 0.2 + Math.random() * 0.6, yOff: (Math.random() - 0.5) * 1.5 });
    sPos[i * 3] = Math.cos(angle) * radius;
    sPos[i * 3 + 1] = sData[i].yOff;
    sPos[i * 3 + 2] = Math.sin(angle) * radius;
    const mix = Math.random();
    const col = mix > 0.5 ? pal.particleA : pal.particleB;
    sCol[i * 3] = col.r;
    sCol[i * 3 + 1] = col.g;
    sCol[i * 3 + 2] = col.b;
  }
  sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute("color", new THREE.BufferAttribute(sCol, 3));
  sGeo.userData = { data: sData };
  sparkMat = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  sparkSys = new THREE.Points(sGeo, sparkMat);
  sparkSys.renderOrder = 3;
  scene.add(sparkSys);

  // ── Halo ring (thin torus, additive) ──
  const ringGeo = new THREE.TorusGeometry(1.9, 0.012, 8, 100);
  ringMat = new THREE.MeshBasicMaterial({
    color: pal.ring,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2.2;
  ringMesh.renderOrder = 3;
  scene.add(ringMesh);

  ready.value = true;
}

function animate() {
  frameId = requestAnimationFrame(animate);
  if (!renderer || !scene || !camera || !crystal || !crystalMat) return;

  const t = (clock.value ?? new THREE.Clock()).getElapsedTime();
  crystalMat.uniforms.uTime.value = t;
  if (coreMat) coreMat.uniforms.uTime.value = t;

  if (!prefersReducedMotion) {
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    // Crystal rotation + slight breathing distortion
    crystal.rotation.y = t * 0.15 + pointer.x * 0.5;
    crystal.rotation.x = pointer.y * 0.35 + Math.sin(t * 0.25) * 0.06;
    crystalMat.uniforms.uDistort.value = 0.16 + Math.sin(t * 0.6) * 0.04;

    // Core pulse + counter-rotation
    if (core) {
      core.rotation.y = -t * 0.2;
      core.rotation.x = t * 0.12;
      const s = 1 + Math.sin(t * 2.0) * 0.05;
      core.scale.set(s, s, s);
    }

    // Camera parallax
    camera.position.x = pointer.x * 0.9;
    camera.position.y = -pointer.y * 0.9;
    camera.lookAt(0, 0, 0);

    // Shard orbits
    if (shardGroup) {
      shardGroup.rotation.y = t * 0.08;
      shardGroup.children.forEach((s) => {
        const u = s.userData;
        u.angle += u.speed * 0.008;
        s.position.x = Math.cos(u.angle) * u.radius;
        s.position.z = Math.sin(u.angle) * u.radius;
        s.position.y = u.yOffset + Math.sin(t * u.speed + u.angle) * 0.3;
        s.rotation.x += 0.008 * u.spin;
        s.rotation.y += 0.01 * u.spin;
      });
    }

    // Particle systems drift
    if (particleSys) {
      particleSys.rotation.y = t * 0.015;
      particleSys.rotation.x = t * 0.008;
    }

    // Spark orbit (update positions for circular motion)
    if (sparkSys) {
      const pos = sparkSys.geometry.getAttribute("position") as THREE.BufferAttribute;
      const data = (sparkSys.geometry.userData as { data: { angle: number; radius: number; speed: number; yOff: number }[] }).data;
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        d.angle += d.speed * 0.01;
        pos.setXYZ(i, Math.cos(d.angle) * d.radius, d.yOff + Math.sin(t * d.speed + d.angle) * 0.2, Math.sin(d.angle) * d.radius);
      }
      pos.needsUpdate = true;
      sparkSys.rotation.y = t * 0.05;
    }

    // Ring slow tilt
    if (ringMesh) {
      ringMesh.rotation.z = t * 0.03;
      ringMesh.rotation.x = Math.PI / 2.2 + Math.sin(t * 0.3) * 0.15;
    }
  }

  renderer.render(scene, camera);
}

function renderStatic() {
  if (!renderer || !scene || !camera) return;
  renderer.render(scene, camera);
}

function onResize() {
  if (!renderer || !camera || !wrapRef.value) return;
  const w = Math.max(1, wrapRef.value.clientWidth);
  const h = Math.max(1, wrapRef.value.clientHeight);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

function onPointerMove(e: PointerEvent) {
  pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
}

function onPointerLeave() {
  pointer.tx = 0;
  pointer.ty = 0;
}

function updateThemeColors() {
  const pal = currentPalette();
  if (crystalMat) {
    crystalMat.uniforms.uColorA.value = pal.crystalA;
    crystalMat.uniforms.uColorB.value = pal.crystalB;
    crystalMat.uniforms.uColorC.value = pal.crystalC;
  }
  if (coreMat) coreMat.uniforms.uColor.value = pal.core;
  if (wireMat) wireMat.color = pal.wire;
  if (particleMat) {
    const colors = particleSys?.geometry.getAttribute("color") as THREE.BufferAttribute | undefined;
    if (colors) {
      for (let i = 0; i < colors.count; i++) {
        const mix = Math.random();
        const col = mix > 0.66 ? pal.particleA : mix > 0.33 ? pal.particleB : pal.particleC;
        colors.setXYZ(i, col.r, col.g, col.b);
      }
      colors.needsUpdate = true;
    }
  }
  if (ringMat) (ringMat as THREE.MeshBasicMaterial).color = pal.ring;
  shardGroup?.children.forEach((s, i) => {
    const m = (s as THREE.LineSegments).material as THREE.LineBasicMaterial;
    m.color = i % 2 === 0 ? pal.crystalA : pal.crystalB;
  });
  if (prefersReducedMotion) renderStatic();
}

let themeObserver: MutationObserver | null = null;

function init() {
  prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  clock.value = new THREE.Clock();
  buildScene();
  onResize();

  resizeObserver = new ResizeObserver(onResize);
  if (wrapRef.value) resizeObserver.observe(wrapRef.value);

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("mouseleave", onPointerLeave);

  const mo = new MutationObserver(updateThemeColors);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  themeObserver = mo;

  if (prefersReducedMotion) renderStatic();
  else animate();
}

onMounted(init);

onUnmounted(() => {
  cancelAnimationFrame(frameId);
  resizeObserver?.disconnect();
  window.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("mouseleave", onPointerLeave);
  themeObserver?.disconnect();
  renderer?.dispose();
  scene?.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = (mesh as THREE.Mesh).material;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else if (mat) (mat as THREE.Material).dispose();
  });
  renderer = null;
  scene = null;
  camera = null;
});
</script>

<template>
  <div ref="wrapRef" class="art3d-wrap" :class="{ 'is-ready': ready }">
    <canvas ref="canvasRef" class="art3d-canvas" aria-hidden="true"></canvas>
  </div>
</template>

<style scoped>
.art3d-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  min-height: 280px;
  overflow: hidden;
  opacity: 0;
  transition: opacity 800ms cubic-bezier(0.16, 1, 0.3, 1);
  background: transparent;
  border: none;
}
.art3d-wrap.is-ready { opacity: 1; }
.art3d-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
  background: transparent;
  border: none;
}
@media (prefers-reduced-motion: reduce) {
  .art3d-wrap { opacity: 1; }
}
</style>
