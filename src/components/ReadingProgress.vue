<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const progress = ref(0);

function update() {
  const doc = document.documentElement;
  const scrolled = doc.scrollTop || document.body.scrollTop;
  const height = doc.scrollHeight - doc.clientHeight;
  progress.value = height > 0 ? Math.min(100, (scrolled / height) * 100) : 0;
}

onMounted(() => {
  window.addEventListener("scroll", update, { passive: true });
  update();
});

onUnmounted(() => window.removeEventListener("scroll", update));
</script>

<template>
  <div
    class="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-rose-500 to-mauve-600 dark:from-rose-300 dark:to-mauve-500 origin-left z-[999] transition-transform duration-[80ms] ease-linear"
    :style="{ transform: `scaleX(${progress / 100})` }"
    role="progressbar"
    :aria-valuenow="Math.round(progress)"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label="Article reading progress"
  />
</template>
