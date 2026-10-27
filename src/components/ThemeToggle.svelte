<script lang="ts">
  let isDark = $state(false);

  function syncTheme() {
    if (typeof document === "undefined") return;
    isDark = document.documentElement.classList.contains("dark");
  }

  function handleToggle() {
    const nextDark = !document.documentElement.classList.contains("dark");
    const nextTheme = nextDark ? "dark" : "light";

    const apply = () => {
      document.documentElement.classList.toggle("dark", nextDark);
      try {
        localStorage.setItem("theme", nextTheme);
      } catch {
        // storage unavailable
      }
      isDark = nextDark;
    };

    if (document.startViewTransition) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  }

  $effect(() => {
    syncTheme();

    const observer = new MutationObserver(() => syncTheme());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    document.addEventListener("astro:after-swap", syncTheme);

    return () => {
      observer.disconnect();
      document.removeEventListener("astro:after-swap", syncTheme);
    };
  });
</script>

<button
  type="button"
  class="relative inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
  onclick={handleToggle}
  data-sound="pop"
  aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
  aria-pressed={isDark}
>
  <span
    class="i-lucide-sun size-[1.05rem] transition-all duration-200 dark:scale-0 dark:opacity-0"
    aria-hidden="true"
  ></span>
  <span
    class="i-lucide-moon absolute size-[1.05rem] scale-0 opacity-0 transition-all duration-200 dark:scale-100 dark:opacity-100"
    aria-hidden="true"
  ></span>
  <span class="sr-only">{isDark ? "Switch to light theme" : "Switch to dark theme"}</span>
</button>
