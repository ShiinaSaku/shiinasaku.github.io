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

    <!-- Post list -->
    <div v-if="filtered.length > 0" class="flex flex-col gap-3">
      <a
        v-for="post in filtered"
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
    <div v-else class="glass rounded-2xl py-16 text-center">
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
