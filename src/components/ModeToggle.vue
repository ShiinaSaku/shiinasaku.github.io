<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useColorMode } from "@vueuse/core";

const mode = useColorMode({
  storageKey: "theme",
});

type ThemeMode = "light" | "dark";

function setMode(nextMode: ThemeMode) {
  const apply = () => {
    mode.value = nextMode;
    document.documentElement.dataset.themeSwitching = "true";
    window.setTimeout(() => {
      delete document.documentElement.dataset.themeSwitching;
    }, 220);
  };

  if (!document.startViewTransition) {
    apply();
    return;
  }

  document.startViewTransition(apply);
}

function toggleMode() {
  const isDark = document.documentElement.classList.contains("dark");
  const nextMode = isDark ? "light" : "dark";
  setMode(nextMode);
}
</script>

<template>
  <button
    type="button"
    class="size-9 rounded-full border border-zinc-200/80 bg-white/50 text-zinc-700 transition-colors duration-200 hover:border-rose-400/50 hover:bg-rose-500/5 hover:text-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-rose-400/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 cursor-pointer flex items-center justify-center relative overflow-hidden backdrop-blur-md"
    @click="toggleMode"
    aria-label="Toggle theme"
  >
    <Icon
      icon="solar:sun-bold"
      class="size-[1.1rem] rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0"
    />
    <Icon
      icon="solar:moon-bold"
      class="absolute size-[1.1rem] rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100"
    />
    <span class="sr-only">Toggle theme</span>
  </button>
</template>
