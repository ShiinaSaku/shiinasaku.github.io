<script lang="ts">
  let progress = $state(0);

  function update() {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    progress = height > 0 ? Math.min(100, (scrolled / height) * 100) : 0;
  }

  $effect(() => {
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  });
</script>

<div
  class="fixed top-0 left-0 z-999 h-0.5 w-full origin-left bg-accent-500 transition-transform duration-80 ease-linear dark:bg-accent-400"
  style:transform={`scaleX(${progress / 100})`}
  role="progressbar"
  aria-valuenow={Math.round(progress)}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Article reading progress"
></div>
