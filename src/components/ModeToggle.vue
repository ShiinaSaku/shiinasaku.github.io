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
    class="size-9 md:size-10 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-transform duration-200 hover:scale-105 cursor-pointer flex items-center justify-center relative overflow-hidden"
    style="background: var(--card); color: var(--foreground)"
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
