<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import Aurora from "./Aurora.vue";

const colorStops = ref<string[]>(["#f75192", "#9368b5", "#f59e0b"]);
const reducedMotion = ref(false);

const themeStops = {
  dark: ["#f75192", "#9368b5", "#f59e0b"],
  light: ["#ff9fc4", "#c7a8dd", "#fdba74"],
};

function isDark() {
  return document.documentElement.classList.contains("dark");
}

function syncTheme() {
  colorStops.value = isDark() ? themeStops.dark : themeStops.light;
}

let mo: MutationObserver | null = null;

onMounted(() => {
  reducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  syncTheme();
  mo = new MutationObserver(syncTheme);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});

onUnmounted(() => {
  mo?.disconnect();
});
</script>

<template>
  <div class="aurora-bg" aria-hidden="true">
    <div class="aurora-layer">
      <Aurora
        :color-stops="colorStops"
        :amplitude="1.2"
        :blend="0.6"
        :speed="0.5"
        :time="8"
        :animate="!reducedMotion"
      />
    </div>
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
.aurora-layer {
  position: absolute;
  inset: 0;
  opacity: 0.55;
  mask-image: linear-gradient(to bottom, black 0%, black 55%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 55%, transparent 100%);
}
:global(html.dark) .aurora-layer {
  opacity: 0.85;
}
.aurora-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, transparent 50%, rgba(250, 250, 250, 0.6) 100%);
}
:global(html.dark) .aurora-vignette {
  background: radial-gradient(ellipse at 50% 0%, transparent 50%, rgba(9, 9, 11, 0.7) 100%);
}
</style>
