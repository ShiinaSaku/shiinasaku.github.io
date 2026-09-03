<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";

const enabled = useLocalStorage("sounds", true);

function toggle() {
  enabled.value = !enabled.value;
}
</script>

<template>
  <button
    type="button"
    class="inline-flex size-9 items-center justify-center rounded-lg text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 cursor-pointer"
    @click="toggle"
    :aria-label="enabled ? 'Mute UI sounds' : 'Unmute UI sounds'"
    :aria-pressed="enabled"
  >
    <span
      class="i-lucide-volume-2 absolute size-[1.05rem] transition-all duration-200"
      :class="enabled ? 'scale-100 opacity-100' : 'scale-0 opacity-0'"
      aria-hidden="true"
    ></span>
    <span
      class="i-lucide-volume-x absolute size-[1.05rem] transition-all duration-200"
      :class="enabled ? 'scale-0 opacity-0' : 'scale-100 opacity-100'"
      aria-hidden="true"
    ></span>
    <span class="sr-only">Toggle UI sounds</span>
  </button>
</template>
