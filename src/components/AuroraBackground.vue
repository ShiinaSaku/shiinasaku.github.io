<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);
let frameId = 0;
let ctx: CanvasRenderingContext2D | null = null;
let prefersReducedMotion = false;

// Orb configuration — color sets per theme
const themeConfig = {
  dark: [
    { r: 247, g: 81, b: 146 }, // rose
    { r: 139, g: 92, b: 246 }, // violet
    { r: 174, g: 135, b: 203 }, // mauve
    { r: 251, g: 191, b: 36 }, // amber
  ],
  light: [
    { r: 255, g: 145, b: 175 }, // soft rose
    { r: 199, g: 168, b: 221 }, // soft mauve
    { r: 253, g: 186, b: 116 }, // soft amber
    { r: 244, g: 123, b: 171 }, // pink
  ],
};

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  colorIdx: number;
  phase: number;
  phaseSpeed: number;
}

let orbs: Orb[] = [];
let w = 0,
  h = 0;
let t = 0;

function isDark() {
  return document.documentElement.classList.contains("dark");
}

function getColors() {
  return isDark() ? themeConfig.dark : themeConfig.light;
}

function initOrbs() {
  const colors = getColors();
  orbs = [];
  for (let i = 0; i < colors.length; i++) {
    orbs.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: 300 + Math.random() * 200,
      colorIdx: i % colors.length,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.003 + Math.random() * 0.004,
    });
  }
}

function resize() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio, 2);
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  if (ctx) ctx.scale(dpr, dpr);
  initOrbs();
}

function draw() {
  frameId = requestAnimationFrame(draw);
  if (!ctx || prefersReducedMotion) return;

  const colors = getColors();
  t += 0.005;

  ctx.clearRect(0, 0, w, h);

  // Draw orbs with radial gradient — additive blend for aurora glow
  ctx.globalCompositeOperation = "lighter";

  for (const orb of orbs) {
    orb.x += orb.vx;
    orb.y += orb.vy;
    orb.phase += orb.phaseSpeed;

    // Bounce off edges
    if (orb.x < -orb.radius) orb.x = w + orb.radius;
    if (orb.x > w + orb.radius) orb.x = -orb.radius;
    if (orb.y < -orb.radius) orb.y = h + orb.radius;
    if (orb.y > h + orb.radius) orb.y = -orb.radius;

    const breathe = 1 + Math.sin(orb.phase) * 0.15;
    const r = orb.radius * breathe;
    const c = colors[orb.colorIdx];
    const intensity = isDark() ? 0.14 : 0.1;

    const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
    grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${intensity})`);
    grad.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, ${intensity * 0.4})`);
    grad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = "source-over";
}

function onThemeChange() {
  // Reinitialize orb colors when theme switches
  initOrbs();
}

let mo: MutationObserver | null = null;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  ctx = canvas.getContext("2d");
  prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  resize();
  window.addEventListener("resize", resize);

  mo = new MutationObserver(onThemeChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  if (!prefersReducedMotion) draw();
  else {
    // Draw a single static frame
    if (ctx) {
      const colors = getColors();
      ctx.globalCompositeOperation = "lighter";
      for (const orb of orbs) {
        const c = colors[orb.colorIdx];
        const intensity = isDark() ? 0.14 : 0.1;
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${intensity})`);
        grad.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, ${intensity * 0.4})`);
        grad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }
  }
});

onUnmounted(() => {
  cancelAnimationFrame(frameId);
  window.removeEventListener("resize", resize);
  mo?.disconnect();
});
</script>

<template>
  <div class="aurora-bg" aria-hidden="true">
    <canvas ref="canvasRef" class="aurora-canvas"></canvas>
    <!-- Grid texture overlay -->
    <div class="aurora-grid"></div>
    <!-- Vignette -->
    <div class="aurora-vignette"></div>
  </div>
</template>

<style scoped>
.aurora-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}
.aurora-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.aurora-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(120, 82, 149, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(120, 82, 149, 0.04) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}
:global(html.dark) .aurora-grid {
  background-image:
    linear-gradient(to right, rgba(199, 168, 221, 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(199, 168, 221, 0.06) 1px, transparent 1px);
}
.aurora-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, transparent 50%, rgba(250, 250, 250, 0.6) 100%);
}
:global(html.dark) .aurora-vignette {
  background: radial-gradient(ellipse at 50% 0%, transparent 50%, rgba(9, 9, 11, 0.7) 100%);
}
@media (prefers-reduced-motion: reduce) {
  .aurora-grid {
    display: none;
  }
}
</style>
