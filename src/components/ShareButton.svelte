<script lang="ts">
  import { scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  interface Props {
    body: string;
    slug: string;
    title: string;
    description?: string;
    tags?: string[];
  }

  const { body, slug, title, description = "", tags = [] } = $props();

  let currentUrl = $state<string | null>(null);
  let canNativeShare = $state(false);
  let copiedUrl = $state(false);
  let copiedMd = $state(false);
  let open = $state(false);
  let menuEl: HTMLElement | undefined = $state();

  const url = $derived(currentUrl ?? `https://shiina.xyz/blog/${slug}/`);

  $effect(() => {
    if (typeof window === "undefined") return;
    currentUrl = window.location.href;
    canNativeShare = !!navigator.share;
  });

  function flash(state: () => void, reset: () => void) {
    state();
    setTimeout(reset, 2000);
  }

  async function copyText(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        return true;
      } catch {
        return false;
      }
    }
  }

  const markdownPayload = $derived.by(() => {
    const lines = [
      "---",
      `title: "${title.replaceAll('"', '\\"')}"`,
      ...(description ? [`description: "${description.replaceAll('"', '\\"')}"`] : []),
      ...(tags?.length
        ? [`tags: [${tags.map((t) => `"${t.replaceAll('"', '\\"')}"`).join(", ")}]`]
        : []),
      `source: "${url}"`,
      "---",
      "",
      `# ${title}`,
      "",
      ...(description ? [description, ""] : []),
      body.trim(),
      "",
      "---",
      "",
      `Source: ${url}`,
    ];
    return lines.join("\n");
  });

  async function handlePrimaryShare() {
    if (canNativeShare) {
      try {
        await navigator.share({ title, text: description, url });
        return;
      } catch {
        /* fall through */
      }
    }
    await handleCopyUrl();
  }

  async function handleCopyUrl() {
    open = false;
    if (await copyText(url)) {
      flash(
        () => (copiedUrl = true),
        () => (copiedUrl = false),
      );
    }
  }

  async function handleCopyMarkdown() {
    open = false;
    if (await copyText(markdownPayload)) {
      flash(
        () => (copiedMd = true),
        () => (copiedMd = false),
      );
    }
  }

  function openInNewTab(url: string) {
    open = false;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openRawMd() {
    openInNewTab(`/blog/${slug}.md`);
  }

  function buildAiPrompt() {
    return [
      `Blog post: ${url}`,
      `Title: ${title}.`,
      description ? `Summary: ${description}.` : "",
      "Please summarize the core ideas and suggest practical takeaways.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  function askChatGPT() {
    openInNewTab(`https://chatgpt.com?q=${encodeURIComponent(buildAiPrompt())}`);
  }

  function askClaude() {
    openInNewTab(`https://claude.ai/new?q=${encodeURIComponent(buildAiPrompt())}`);
  }

  function onWindowPointerdown(event: PointerEvent) {
    if (!open) return;
    if (menuEl && !menuEl.contains(event.target as Node)) open = false;
  }

  function onWindowKeydown(event: KeyboardEvent) {
    if (open && event.key === "Escape") open = false;
  }
</script>

<svelte:window onpointerdown={onWindowPointerdown} onkeydown={onWindowKeydown} />

<div
  bind:this={menuEl}
  class="relative inline-flex select-none items-center rounded-lg border border-stone-200/60 bg-white/45 p-0.5 dark:border-stone-800 dark:bg-stone-950/40"
>
  <!-- Primary: share / copy link -->
  <button
    type="button"
    onclick={handlePrimaryShare}
    data-sound="chime"
    aria-label={copiedUrl ? "Link copied!" : canNativeShare ? "Share this article" : "Copy link"}
    class="inline-flex cursor-pointer select-none items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold outline-none transition-all duration-150 hover:bg-accent-500/10 {copiedUrl
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-stone-700 hover:text-accent-600 dark:text-stone-200 dark:hover:text-accent-400'}"
  >
    <span
      class="h-3.5 w-3.5 shrink-0 {copiedUrl
        ? 'i-lucide-check'
        : canNativeShare
          ? 'i-lucide-share-2'
          : 'i-lucide-link'}"
      aria-hidden="true"
    ></span>
    <span>{copiedUrl ? "Copied!" : canNativeShare ? "Share" : "Copy Link"}</span>
  </button>

  <!-- Vertical divider -->
  <span
    class="mx-0.5 my-auto h-4 w-px shrink-0 bg-stone-200/60 dark:bg-stone-800"
    aria-hidden="true"
  ></span>

  <!-- More actions dropdown -->
  <button
    type="button"
    onclick={() => (open = !open)}
    class="inline-flex cursor-pointer items-center justify-center rounded p-1 text-stone-700 outline-none transition-all duration-150 hover:bg-accent-500/10 hover:text-accent-600 dark:text-stone-200 dark:hover:text-accent-400"
    aria-label="More article actions"
    aria-haspopup="menu"
    aria-expanded={open}
  >
    <span class="i-lucide-ellipsis h-3.5 w-3.5" aria-hidden="true"></span>
  </button>

  {#if open}
    <div
      role="menu"
      transition:scale={{ duration: 140, start: 0.96, easing: cubicOut }}
      class="absolute top-full right-0 z-50 mt-2 w-64 rounded-xl border border-stone-200/80 bg-white p-1.5 shadow-lg shadow-stone-900/5 dark:border-stone-800 dark:bg-stone-950"
    >
      <!-- Export section -->
      <p
        class="px-2 pt-1.5 pb-1 text-[9px] font-bold tracking-widest text-stone-400 uppercase dark:text-stone-500"
      >
        Export
      </p>

      <button
        type="button"
        role="menuitem"
        onclick={handleCopyUrl}
        data-sound="pop"
        class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-stone-100 dark:hover:bg-stone-900"
      >
        <span
          class="h-4 w-4 shrink-0 {copiedUrl
            ? 'i-lucide-check text-emerald-500'
            : 'i-lucide-link'}"
          aria-hidden="true"
        ></span>
        <span class="flex min-w-0 flex-col items-start text-left">
          <span>{copiedUrl ? "Copied!" : "Copy link"}</span>
          <span class="text-[10px] text-stone-500 dark:text-stone-400">
            Shareable URL for this post</span
          >
        </span>
      </button>

      <button
        type="button"
        role="menuitem"
        onclick={handleCopyMarkdown}
        data-sound="pop"
        class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-stone-100 dark:hover:bg-stone-900"
      >
        <span
          class="h-4 w-4 shrink-0 {copiedMd
            ? 'i-lucide-check text-emerald-500'
            : 'i-lucide-clipboard'}"
          aria-hidden="true"
        ></span>
        <span class="flex min-w-0 flex-col items-start text-left">
          <span>{copiedMd ? "Copied!" : "Copy as Markdown"}</span>
          <span class="text-[10px] text-stone-500 dark:text-stone-400">
            Full article with title &amp; metadata</span
          >
        </span>
      </button>

      <button
        type="button"
        role="menuitem"
        onclick={openRawMd}
        data-sound="pop"
        class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-stone-100 dark:hover:bg-stone-900"
      >
        <span class="i-lucide-file-text h-4 w-4 shrink-0" aria-hidden="true"></span>
        <span class="flex min-w-0 flex-col items-start text-left">
          <span>View raw .md file</span>
          <span class="text-[10px] text-stone-500 dark:text-stone-400">
            Open the Markdown source in browser</span
          >
        </span>
      </button>

      <div class="my-1.5 h-px bg-stone-200/80 dark:bg-stone-800"></div>

      <!-- AI section -->
      <p
        class="px-2 pt-1 pb-1 text-[9px] font-bold tracking-widest text-stone-400 uppercase dark:text-stone-500"
      >
        Ask AI
      </p>

      <button
        type="button"
        role="menuitem"
        onclick={askChatGPT}
        data-sound="pop"
        class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-stone-100 dark:hover:bg-stone-900"
      >
        <span class="i-simple-icons-openai h-3.5 w-3.5 shrink-0" aria-hidden="true"></span>
        <span class="flex min-w-0 flex-col items-start text-left">
          <span>Open in ChatGPT</span>
          <span class="text-[10px] text-stone-500 dark:text-stone-400">
            Summarize &amp; discuss this article</span
          >
        </span>
      </button>

      <button
        type="button"
        role="menuitem"
        onclick={askClaude}
        data-sound="pop"
        class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-stone-100 dark:hover:bg-stone-900"
      >
        <span class="i-simple-icons-anthropic h-3.5 w-3.5 shrink-0" aria-hidden="true"></span>
        <span class="flex min-w-0 flex-col items-start text-left">
          <span>Open in Claude</span>
          <span class="text-[10px] text-stone-500 dark:text-stone-400">
            Analyze ideas and practical takeaways</span
          >
        </span>
      </button>
    </div>
  {/if}
</div>
