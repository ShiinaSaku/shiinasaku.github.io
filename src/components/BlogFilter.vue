<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

interface Post {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readMinutes: number;
}

const props = defineProps<{ posts: Post[] }>();

const activeTag = ref<string | null>(null);

onMounted(() => {
  const tag = new URLSearchParams(window.location.search).get("tag");
  const allTagNames = allTags.value.map((t) => t.tag);
  if (tag && allTagNames.includes(tag)) activeTag.value = tag;
});

const allTags = computed(() => {
  const counts: Record<string, number> = {};
  props.posts.forEach((p) =>
    p.tags.forEach((t) => {
      counts[t] = (counts[t] ?? 0) + 1;
    }),
  );
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
});

const filtered = computed(() =>
  activeTag.value ? props.posts.filter((p) => p.tags.includes(activeTag.value!)) : props.posts,
);

const featured = computed(() => (activeTag.value === null ? (filtered.value[0] ?? null) : null));
const rest = computed(() => (featured.value ? filtered.value.slice(1) : filtered.value));

function toggle(tag: string) {
  activeTag.value = activeTag.value === tag ? null : tag;
  const url = new URL(window.location.href);
  if (activeTag.value) url.searchParams.set("tag", activeTag.value);
  else url.searchParams.delete("tag");
  history.replaceState({}, "", url);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Tag filter pills -->
    <div class="flex flex-wrap gap-2" role="group" aria-label="Filter posts by tag">
      <button
        type="button"
        class="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
        :class="
          activeTag === null
            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10'
        "
        @click="activeTag = null"
      >
        All
        <span class="ml-1 opacity-50">{{ posts.length }}</span>
      </button>

      <button
        v-for="{ tag, count } in allTags"
        :key="tag"
        type="button"
        class="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
        :class="
          activeTag === tag
            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10'
        "
        @click="toggle(tag)"
      >
        {{ tag }}
        <span class="ml-1 opacity-50">{{ count }}</span>
      </button>
    </div>

    <!-- Featured latest post -->
    <a
      v-if="featured"
      :href="`/blog/${featured.id}/`"
      class="glass-border spotlight-card card-hover group relative flex flex-col gap-4 rounded-2xl p-6 sm:p-8 cursor-pointer overflow-hidden"
    >
      <div class="flex items-center gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <span class="kicker">Latest</span>
        <span class="text-zinc-300 dark:text-zinc-700">·</span>
        <time>{{ formatDate(featured.date) }}</time>
        <span class="text-zinc-300 dark:text-zinc-700">·</span>
        <span>{{ featured.readMinutes }} min read</span>
      </div>

      <h2
        class="font-display text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-zinc-900 group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400 transition-colors text-balance"
      >
        {{ featured.title }}
      </h2>

      <p
        class="text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400 text-pretty line-clamp-2 max-w-2xl"
      >
        {{ featured.description }}
      </p>

      <div class="flex items-center justify-between gap-4 pt-1">
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="tag in featured.tags.slice(0, 3)"
            :key="tag"
            class="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-white/5 dark:text-zinc-400"
          >
            {{ tag }}
          </span>
        </div>
        <span
          class="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-rose-600 dark:text-rose-400"
        >
          Read
          <span
            class="i-lucide-arrow-right size-4 transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          ></span>
        </span>
      </div>
    </a>

    <!-- Post list -->
    <div v-if="rest.length > 0" class="flex flex-col gap-3">
      <a
        v-for="post in rest"
        :key="post.id"
        :href="`/blog/${post.id}/`"
        class="glass card-hover group rounded-2xl p-5 sm:p-6 flex flex-col gap-3 cursor-pointer"
      >
        <div class="flex items-center gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <time>{{ formatDate(post.date) }}</time>
          <span class="text-zinc-300 dark:text-zinc-700">·</span>
          <span>{{ post.readMinutes }} min read</span>
        </div>

        <h3
          class="font-display text-lg font-semibold leading-tight text-zinc-900 group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-400 transition-colors text-balance"
        >
          {{ post.title }}
        </h3>

        <p
          class="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 text-pretty line-clamp-2"
        >
          {{ post.description }}
        </p>

        <div class="flex flex-wrap gap-1.5 pt-1">
          <span
            v-for="tag in post.tags.slice(0, 3)"
            :key="tag"
            class="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-white/5 dark:text-zinc-400"
          >
            {{ tag }}
          </span>
        </div>
      </a>
    </div>

    <!-- Empty state -->
    <div v-if="filtered.length === 0" class="glass rounded-2xl py-16 text-center">
      <div
        class="inline-flex items-center justify-center size-12 rounded-full bg-zinc-100 text-zinc-400 mb-3 dark:bg-white/5"
      >
        <span class="i-lucide-search-x size-6" aria-hidden="true"></span>
      </div>
      <p class="kicker">No match</p>
      <h3 class="font-display text-lg font-semibold text-zinc-900 dark:text-white mt-2">
        Nothing fits that filter.
      </h3>
      <button
        type="button"
        class="mt-4 rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:border-rose-400/50 hover:text-rose-600 dark:border-white/10 dark:text-zinc-300 dark:hover:border-rose-400/40 dark:hover:text-rose-400 cursor-pointer transition-colors duration-150"
        @click="activeTag = null"
      >
        Reset filter
      </button>
    </div>
  </div>
</template>
