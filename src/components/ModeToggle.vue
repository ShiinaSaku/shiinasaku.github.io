<script setup lang="ts">
import { useColorMode } from "@vueuse/core";

const mode = useColorMode({
  storageKey: "theme",
});

type ThemeMode = "light" | "dark";

function setMode(nextMode: ThemeMode) {
  const apply = () => {
    mode.value = nextMode;
  };

  if (!document.startViewTransition) {
    apply();
    return;
  }

  document.startViewTransition(apply);
}

function toggleMode() {
  const isDark = document.documentElement.classList.contains("dark");
  const nextMode: ThemeMode = isDark ? "light" : "dark";
  setMode(nextMode);
}
</script>

<template>
  <button
    type="button"
    class="relative inline-flex size-9 items-center justify-center rounded-lg text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 cursor-pointer"
    @click="toggleMode"
    data-sound="pop"
    aria-label="Toggle theme"
  >
    <span
      class="i-lucide-sun size-[1.05rem] transition-all duration-200 dark:scale-0 dark:opacity-0"
      aria-hidden="true"
    ></span>
    <span
      class="i-lucide-moon absolute size-[1.05rem] scale-0 opacity-0 transition-all duration-200 dark:scale-100 dark:opacity-100"
      aria-hidden="true"
    ></span>
    <span class="sr-only">Toggle theme</span>
  </button>
</template>
