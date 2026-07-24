<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";

interface PalettePost {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

interface Item {
  key: string;
  label: string;
  hint: string;
  href: string;
  icon: string;
  external?: boolean;
  keywords: string;
}

const props = defineProps<{ posts: PalettePost[] }>();

const open = ref(false);
const query = ref("");
const activeIndex = ref(0);
const inputEl = ref<HTMLInputElement | null>(null);

const pages: Item[] = [
  {
    key: "p-home",
    label: "Home",
    hint: "Page",
    href: "/",
    icon: "i-lucide-house",
    keywords: "home index",
  },
  {
    key: "p-blog",
    label: "Blog",
    hint: "Page",
    href: "/blog/",
    icon: "i-lucide-book-open",
    keywords: "blog essays writing",
  },
  {
    key: "p-friends",
    label: "Friends",
    hint: "Page",
    href: "/friends/",
    icon: "i-lucide-contact",
    keywords: "friends links",
  },
  {
    key: "p-rss",
    label: "RSS Feed",
    hint: "Subscribe",
    href: "/rss.xml",
    icon: "i-lucide-rss",
    keywords: "rss feed subscribe",
  },
  {
    key: "p-github",
    label: "GitHub",
    hint: "External",
    href: "https://github.com/shiinasaku",
    icon: "i-mdi-github",
    external: true,
    keywords: "github code repos",
  },
  {
    key: "p-twitter",
    label: "Twitter / X",
    hint: "External",
    href: "https://x.com/saku_shiina",
    icon: "i-tabler-brand-x",
    external: true,
    keywords: "twitter x social",
  },
  {
    key: "p-email",
    label: "Email",
    hint: "Contact",
    href: "mailto:sakushiina@proton.me",
    icon: "i-tabler-mail-check",
    keywords: "email contact mail",
  },
];

const postItems = computed<Item[]>(() =>
  props.posts.map((p) => ({
    key: `post-${p.id}`,
    label: p.title,
    hint: "Essay",
    href: `/blog/${p.id}/`,
    icon: "i-lucide-file-text",
    keywords: `${p.title} ${p.description} ${p.tags.join(" ")}`.toLowerCase(),
  })),
);

const filtered = computed<Item[]>(() => {
  const q = query.value.trim().toLowerCase();
  const all = [...pages, ...postItems.value];
  if (!q) return all;
  return all.filter((item) => item.keywords.includes(q) || item.label.toLowerCase().includes(q));
});

watch(filtered, () => {
  activeIndex.value = 0;
});

function show() {
  open.value = true;
  query.value = "";
  activeIndex.value = 0;
  document.documentElement.style.overflow = "hidden";
  nextTick(() => inputEl.value?.focus());
}

function hide() {
  open.value = false;
  document.documentElement.style.overflow = "";
}

function go(item: Item) {
  hide();
  if (item.external) window.open(item.href, "_blank", "noreferrer noopener");
  else window.location.href = item.href;
}

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if (open.value) hide();
    else show();
    return;
  }
  if (!open.value) return;
  if (e.key === "Escape") {
    e.preventDefault();
    hide();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % filtered.value.length;
    scrollActiveIntoView();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex.value = (activeIndex.value - 1 + filtered.value.length) % filtered.value.length;
    scrollActiveIntoView();
  } else if (e.key === "Enter") {
    e.preventDefault();
    const item = filtered.value[activeIndex.value];
    if (item) go(item);
  }
}

function scrollActiveIntoView() {
  nextTick(() => {
    document
      .querySelector(`[data-palette-index="${activeIndex.value}"]`)
      ?.scrollIntoView({ block: "nearest" });
  });
}

function onOpenEvent() {
  show();
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("open-command-palette", onOpenEvent);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("open-command-palette", onOpenEvent);
  document.documentElement.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-100 flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        class="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm dark:bg-zinc-950/60"
        @click="hide"
      ></div>

      <div
        class="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/90 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/90"
      >
        <div class="flex items-center gap-3 border-b border-zinc-200/60 px-4 dark:border-white/10">
          <span class="i-lucide-search size-4 shrink-0 text-zinc-400" aria-hidden="true"></span>
          <input
            ref="inputEl"
            v-model="query"
            type="text"
            placeholder="Search pages and essays..."
            class="h-12 w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-600"
            role="combobox"
            aria-expanded="true"
            aria-label="Search"
          />
          <kbd
            class="shrink-0 rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400"
            >ESC</kbd
          >
        </div>

        <div class="max-h-80 overflow-y-auto p-2" role="listbox">
          <button
            v-for="(item, i) in filtered"
            :key="item.key"
            type="button"
            role="option"
            :data-palette-index="i"
            :aria-selected="i === activeIndex"
            class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-75 cursor-pointer"
            :class="
              i === activeIndex
                ? 'bg-rose-500/10 text-zinc-900 dark:text-white'
                : 'text-zinc-700 dark:text-zinc-300'
            "
            @mouseenter="activeIndex = i"
            @click="go(item)"
          >
            <span
              class="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200/60 bg-white/50 dark:border-white/10 dark:bg-white/5"
            >
              <span
                :class="[
                  item.icon,
                  'size-4',
                  i === activeIndex
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-zinc-500 dark:text-zinc-400',
                ]"
                aria-hidden="true"
              ></span>
            </span>
            <span class="flex-1 truncate text-sm font-medium">{{ item.label }}</span>
            <span
              class="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600"
              >{{ item.hint }}</span
            >
          </button>

          <div
            v-if="filtered.length === 0"
            class="px-3 py-10 text-center text-sm text-zinc-500 dark:text-zinc-500"
          >
            No results for "{{ query }}"
          </div>
        </div>

        <div
          class="flex items-center gap-4 border-t border-zinc-200/60 px-4 py-2.5 text-[10px] font-medium text-zinc-400 dark:border-white/10 dark:text-zinc-600"
        >
          <span class="inline-flex items-center gap-1.5">
            <kbd class="rounded border border-zinc-200 px-1 py-px dark:border-white/10">↑↓</kbd>
            navigate
          </span>
          <span class="inline-flex items-center gap-1.5">
            <kbd class="rounded border border-zinc-200 px-1 py-px dark:border-white/10">↵</kbd> open
          </span>
          <span class="ml-auto inline-flex items-center gap-1.5">
            <kbd class="rounded border border-zinc-200 px-1 py-px dark:border-white/10">⌘K</kbd>
            toggle
          </span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
