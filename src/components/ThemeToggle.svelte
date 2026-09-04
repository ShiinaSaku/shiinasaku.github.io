<script lang="ts">
  type ThemeMode = "light" | "dark";

  let isDark = $state(false);

  function applyMode(next: ThemeMode) {
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  function toggleMode() {
    const next: ThemeMode = isDark ? "light" : "dark";
    if (!document.startViewTransition) {
      applyMode(next);
      return;
    }
    document.startViewTransition(() => applyMode(next));
  }

  $effect(() => {
    isDark = document.documentElement.classList.contains("dark");
  });
</script>

<button
  type="button"
  class="relative inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
  onclick={toggleMode}
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
