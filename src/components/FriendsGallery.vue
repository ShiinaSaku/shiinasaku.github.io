<script setup lang="ts">
import { computed, ref } from "vue";
import type { Friend, FriendLink } from "../data/friends";

const props = defineProps<{ friends: Friend[] }>();
const query = ref("");

const linkIconMap: Record<FriendLink["type"], string> = {
  website: "i-lucide-globe",
  blog: "i-lucide-book-text",
  github: "i-mdi-github",
  twitter: "i-tabler-brand-x",
};

const linkLabelMap: Record<FriendLink["type"], string> = {
  website: "Website",
  blog: "Blog",
  github: "GitHub",
  twitter: "Updates",
};

const linkColorMap: Record<FriendLink["type"], string> = {
  website: "hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400",
  blog: "hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400",
  github: "hover:bg-zinc-500/15 hover:text-zinc-900 dark:hover:text-white",
  twitter: "hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400",
};

const avatarRings = [
  "from-rose-400 via-mauve-500 to-amber-400",
  "from-mauve-400 via-rose-500 to-violet-400",
  "from-amber-400 via-rose-400 to-mauve-500",
];

const visible = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.friends;
  return props.friends.filter((f) => {
    const haystack = [f.name, f.location, f.description, ...f.links.map((l) => l.type)]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
});

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Search -->
    <div class="flex items-center justify-start">
      <div class="relative w-full max-w-md">
        <span
          class="i-lucide-search absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none"
          aria-hidden="true"
        ></span>
        <input
          v-model="query"
          type="search"
          placeholder="Search by name or location…"
          class="w-full rounded-full border border-zinc-200/80 bg-white/50 pl-10 pr-10 py-2.5 text-sm font-medium text-zinc-900 focus:border-rose-400/50 outline-none transition-colors duration-150 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-rose-400/40"
        />
        <button
          v-if="query"
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-150 cursor-pointer flex items-center justify-center size-5 rounded-full hover:bg-rose-500/5"
          @click="query = ''"
          aria-label="Clear search"
        >
          <span class="i-lucide-x size-3.5" aria-hidden="true"></span>
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="visible.length === 0" class="glass rounded-2xl py-16 text-center">
      <div
        class="inline-flex items-center justify-center size-12 rounded-full bg-zinc-100 text-zinc-400 mb-3 dark:bg-white/5"
      >
        <span class="i-lucide-search-x size-6" aria-hidden="true"></span>
      </div>
      <p class="kicker">No match</p>
      <h3 class="font-display text-lg font-semibold text-zinc-900 dark:text-white mt-2">
        Nothing fits that search.
      </h3>
      <button
        type="button"
        class="mt-4 rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:border-rose-400/50 hover:text-rose-600 dark:border-white/10 dark:text-zinc-300 dark:hover:border-rose-400/40 dark:hover:text-rose-400 cursor-pointer transition-colors duration-150"
        @click="query = ''"
      >
        Reset search
      </button>
    </div>

    <!-- Cards Grid -->
    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <article
        v-for="(friend, i) in visible"
        :key="friend.name"
        class="glass spotlight-card card-hover group flex flex-col rounded-2xl p-4"
      >
        <!-- Header -->
        <div class="flex items-center gap-3">
          <div
            class="h-11 w-11 shrink-0 rounded-full bg-linear-to-br p-0.5 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
            :class="avatarRings[i % avatarRings.length]"
          >
            <img
              v-if="friend.avatarUrl"
              :src="friend.avatarUrl"
              :alt="friend.name"
              class="h-full w-full rounded-full bg-white object-cover dark:bg-zinc-900"
              loading="lazy"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-500 dark:bg-white/5 dark:text-zinc-400"
            >
              {{ getInitials(friend.name) }}
            </div>
          </div>

          <div class="min-w-0">
            <h3
              class="truncate font-display text-sm font-semibold leading-tight text-zinc-900 dark:text-white"
            >
              {{ friend.name }}
            </h3>
            <p
              class="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400"
            >
              <span class="i-lucide-map-pin size-3" aria-hidden="true"></span>
              {{ friend.location }}
            </p>
          </div>
        </div>

        <p
          class="mt-3 flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 text-pretty line-clamp-3"
        >
          {{ friend.description }}
        </p>

        <!-- Links -->
        <div
          class="mt-3 flex flex-wrap gap-1.5 border-t border-zinc-200/50 pt-3 dark:border-white/5"
        >
          <a
            v-for="link in friend.links"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noreferrer noopener"
            :aria-label="`${friend.name} — ${linkLabelMap[link.type]}`"
            :title="linkLabelMap[link.type]"
            class="inline-flex size-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-all duration-200 hover:-translate-y-0.5 dark:bg-white/5 dark:text-zinc-400"
            :class="linkColorMap[link.type]"
          >
            <span :class="linkIconMap[link.type]" class="size-3.5" aria-hidden="true"></span>
          </a>
        </div>
      </article>
    </div>
  </div>
</template>
