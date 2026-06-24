<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const visible = ref(false);

function onScroll() {
  visible.value = window.scrollY > 300;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});

onUnmounted(() => window.removeEventListener("scroll", onScroll));
</script>

<template>
  <button
    type="button"
    :class="[
      'group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ease-out',
      'border-zinc-200 text-zinc-500 hover:border-rose-400 hover:text-rose-600',
      'dark:border-white/10 dark:text-zinc-400 dark:hover:border-rose-400 dark:hover:text-rose-300',
      visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
    ]"
    aria-label="Back to top"
    @click="scrollToTop"
  >
    <span
      class="i-lucide-arrow-up size-3.5 transition-transform duration-150 ease-out group-hover:-translate-y-0.5"
      aria-hidden="true"
    ></span>
    Back to top
  </button>
</template>
