<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    end: number;
    duration?: number;
    suffix?: string;
  }>(),
  { duration: 1400, suffix: "" },
);

const display = ref("0");
const rootEl = ref<HTMLElement | null>(null);

let observer: IntersectionObserver | null = null;
let frameId = 0;

function run() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || props.end <= 0) {
    display.value = String(props.end);
    return;
  }
  const start = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / props.duration);
    const eased = 1 - Math.pow(1 - p, 4);
    display.value = String(Math.round(eased * props.end));
    if (p < 1) frameId = requestAnimationFrame(tick);
  };
  frameId = requestAnimationFrame(tick);
}

onMounted(() => {
  if (!rootEl.value || !("IntersectionObserver" in window)) {
    run();
    return;
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        run();
        observer?.disconnect();
      }
    },
    { threshold: 0.4 },
  );
  observer.observe(rootEl.value);
});

onUnmounted(() => {
  observer?.disconnect();
  cancelAnimationFrame(frameId);
});
</script>

<template>
  <span ref="rootEl">{{ display }}{{ suffix }}</span>
</template>
