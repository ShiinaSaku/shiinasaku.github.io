<script setup lang="ts">
import { computed, ref } from "vue";
import { useClipboard } from "@vueuse/core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const props = defineProps<{
  body: string;
  slug: string;
  title: string;
  description?: string;
  tags?: string[];
}>();

const currentUrl = computed(() =>
  typeof window !== "undefined" ? window.location.href : `https://shiina.xyz/blog/${props.slug}/`,
);

const canNativeShare = computed(() => typeof navigator !== "undefined" && !!navigator.share);

const markdownPayload = computed(() => {
  const lines = [
    "---",
    `title: "${props.title.replaceAll('"', '\\"')}"`,
    ...(props.description ? [`description: "${props.description.replaceAll('"', '\\"')}"`] : []),
    ...(props.tags?.length
      ? [`tags: [${props.tags.map((t) => `"${t.replaceAll('"', '\\"')}"`).join(", ")}]`]
      : []),
    `source: "${currentUrl.value}"`,
    "---",
    "",
    `# ${props.title}`,
    "",
    ...(props.description ? [props.description, ""] : []),
    props.body.trim(),
    "",
    "---",
    "",
    `Source: ${currentUrl.value}`,
  ];
  return lines.join("\n");
});

const { copy: copyToClipboard, copied: copiedUrl } = useClipboard({
  legacy: true,
  copiedDuring: 2000,
});
const { copy: copyMdToClipboard, copied: copiedMd } = useClipboard({
  legacy: true,
  copiedDuring: 2000,
});

async function handlePrimaryShare() {
  if (canNativeShare.value) {
    try {
      await navigator.share({
        title: props.title,
        text: props.description,
        url: currentUrl.value,
      });
      return;
    } catch {
      /* fall through */
    }
  }
  await copyToClipboard(currentUrl.value);
}

async function handleCopyUrl() {
  await copyToClipboard(currentUrl.value);
}

async function handleCopyMarkdown() {
  await copyMdToClipboard(markdownPayload.value);
}

function openInNewTab(url: string) {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function openRawMd() {
  openInNewTab(`/blog/${props.slug}.md`);
}

function buildAiPrompt() {
  return [
    `Blog post: ${currentUrl.value}`,
    `Title: ${props.title}.`,
    props.description ? `Summary: ${props.description}.` : "",
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
</script>

<template>
  <!-- Share technical segmented bar -->
  <div
    class="inline-flex items-center rounded-md border border-taupe-200 bg-white/45 p-0.5 dark:border-ink-800 dark:bg-zinc-950/40 relative select-none"
  >
    <!-- Primary: share / copy link -->
    <button
      type="button"
      @click="handlePrimaryShare"
      :aria-label="copiedUrl ? 'Link copied!' : canNativeShare ? 'Share this article' : 'Copy link'"
      class="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-semibold hover:bg-rose-500/5 cursor-pointer transition-all duration-150 outline-none select-none"
      :class="
        copiedUrl
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-ink-700 hover:text-rose-600 dark:text-pink-100 dark:hover:text-rose-400'
      "
    >
      <span
        class="h-3.5 w-3.5 shrink-0"
        :class="
          copiedUrl ? 'i-lucide-check' : canNativeShare ? 'i-lucide-share-2' : 'i-lucide-link'
        "
        aria-hidden="true"
      />
      <span>{{ copiedUrl ? "Copied!" : canNativeShare ? "Share" : "Copy Link" }}</span>
    </button>

    <!-- Vertical Divider -->
    <span
      class="h-4 w-px shrink-0 bg-taupe-200 dark:bg-ink-800 my-auto mx-0.5"
      aria-hidden="true"
    />

    <!-- More actions dropdown -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-sm p-1 text-ink-700 hover:text-rose-600 hover:bg-rose-500/5 dark:text-pink-100 dark:hover:text-rose-400 cursor-pointer transition-all duration-150 outline-none"
          aria-label="More article actions"
        >
          <span class="i-lucide-ellipsis h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent class="w-64" align="end">
        <!-- Export section -->
        <DropdownMenuLabel
          class="text-[9px] font-bold uppercase tracking-widest text-ink-400 dark:text-ink-500"
          >Export</DropdownMenuLabel
        >

        <DropdownMenuItem as-child>
          <button
            type="button"
            class="w-full flex items-center gap-2 cursor-pointer"
            @click="handleCopyUrl"
          >
            <span
              class="h-4 w-4 shrink-0"
              :class="copiedUrl ? 'i-lucide-check text-emerald-500' : 'i-lucide-link'"
              aria-hidden="true"
            />
            <div class="flex min-w-0 flex-col items-start text-left">
              <span>{{ copiedUrl ? "Copied!" : "Copy link" }}</span>
              <span class="text-[10px] text-ink-500 dark:text-ink-400"
                >Shareable URL for this post</span
              >
            </div>
          </button>
        </DropdownMenuItem>

        <DropdownMenuItem as-child>
          <button
            type="button"
            class="w-full flex items-center gap-2 cursor-pointer"
            @click="handleCopyMarkdown"
          >
            <span
              class="h-4 w-4 shrink-0"
              :class="copiedMd ? 'i-lucide-check text-emerald-500' : 'i-lucide-clipboard'"
              aria-hidden="true"
            />
            <div class="flex min-w-0 flex-col items-start text-left">
              <span>{{ copiedMd ? "Copied!" : "Copy as Markdown" }}</span>
              <span class="text-[10px] text-ink-500 dark:text-ink-400"
                >Full article with title &amp; metadata</span
              >
            </div>
          </button>
        </DropdownMenuItem>

        <DropdownMenuItem as-child>
          <button
            type="button"
            class="w-full flex items-center gap-2 cursor-pointer"
            @click="openRawMd"
          >
            <span class="i-lucide-file-text h-4 w-4 shrink-0" aria-hidden="true" />
            <div class="flex min-w-0 flex-col items-start text-left">
              <span>View raw .md file</span>
              <span class="text-[10px] text-ink-500 dark:text-ink-400"
                >Open the Markdown source in browser</span
              >
            </div>
          </button>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <!-- AI section -->
        <DropdownMenuLabel
          class="text-[9px] font-bold uppercase tracking-widest text-ink-400 dark:text-ink-500"
          >Ask AI</DropdownMenuLabel
        >

        <DropdownMenuItem as-child>
          <button
            type="button"
            class="w-full flex items-center gap-2 cursor-pointer"
            @click="askChatGPT"
          >
            <span class="i-simple-icons-openai h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <div class="flex min-w-0 flex-col items-start text-left">
              <span>Open in ChatGPT</span>
              <span class="text-[10px] text-ink-500 dark:text-ink-400"
                >Summarize &amp; discuss this article</span
              >
            </div>
          </button>
        </DropdownMenuItem>

        <DropdownMenuItem as-child>
          <button
            type="button"
            class="w-full flex items-center gap-2 cursor-pointer"
            @click="askClaude"
          >
            <span class="i-simple-icons-anthropic h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <div class="flex min-w-0 flex-col items-start text-left">
              <span>Open in Claude</span>
              <span class="text-[10px] text-ink-500 dark:text-ink-400"
                >Analyze ideas and practical takeaways</span
              >
            </div>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
