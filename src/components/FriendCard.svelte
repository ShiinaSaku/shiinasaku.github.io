<script lang="ts">
  import type { Friend } from "../lib/friends";

  interface Props {
    friend: Friend;
    index: number;
    avatarSrc: string;
  }

  const { friend, index, avatarSrc } = $props();

  const accents = ["#d4542f", "#f0a832", "#4f9dd4", "#58a55c"];
  const kaomojis = ["( ^o^ )/", "=^o^=", "＼(＾o＾)／", "(＝^＋^＝)"];

  const accent = $derived(accents[index % accents.length]);
  const kaomoji = $derived(kaomojis[index % kaomojis.length]);

  let rx = $state(0);
  let ry = $state(0);
  let mx = $state(50);
  let my = $state(50);
  let hovering = $state(false);

  function onPointerMove(event: PointerEvent) {
    const rect = event.currentTarget as HTMLElement;
    const card = rect.getBoundingClientRect();
    const px = (event.clientX - card.left) / card.width;
    const py = (event.clientY - card.top) / card.height;
    ry = (px - 0.5) * 10;
    rx = (0.5 - py) * 8;
    mx = px * 100;
    my = py * 100;
  }

  function onPointerLeave() {
    hovering = false;
    rx = 0;
    ry = 0;
    mx = 50;
    my = 50;
  }

  function withUtm(url: string): string {
    try {
      const u = new URL(url);
      u.searchParams.set("utm_source", "shiina.xyz");
      u.searchParams.set("utm_medium", "friends");
      u.searchParams.set("utm_content", friend.name);
      return u.toString();
    } catch {
      return url;
    }
  }
</script>

<div class="scene">
  <div
    class="card group"
    role="group"
    aria-label={`${friend.name} — ${friend.location}`}
    class:hovering={hovering}
    style:--rx="{rx}deg"
    style:--ry="{ry}deg"
    style:--mx="{mx}%"
    style:--my="{my}%"
    style:--accent={accent}
    style:--enter-delay="{index * 120}ms"
    onpointermove={onPointerMove}
    onpointerenter={() => (hovering = true)}
    onpointerleave={onPointerLeave}
  >
    <!-- shine sweep follows the cursor -->
    <div class="shine" aria-hidden="true"></div>

    <!-- kaomoji bubble -->
    <div class="bubble" aria-hidden="true">
      <span>{kaomoji}</span>
    </div>

    <img
      src={avatarSrc}
      alt="{friend.name} avatar"
      width={64}
      height={64}
      loading={index === 0 ? "eager" : "lazy"}
      fetchpriority={index === 0 ? "high" : "auto"}
      decoding="async"
      class="avatar"
    />

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p class="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
          {friend.name}
        </p>
        <span class="flex items-center gap-1 text-xs font-medium text-stone-400 dark:text-stone-600">
          <span class="i-lucide-map-pin size-3" aria-hidden="true"></span>
          {friend.location}
        </span>
      </div>
      <p class="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        {friend.description}
      </p>
    </div>

    <div class="links">
      {#each friend.links as link (link.url)}
        <a
          href={withUtm(link.url)}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="{friend.name} — {link.type}"
          title={link.type}
          data-sound="pop"
          class="link-btn {link.type}"
        >
          <span
            class="{link.type === 'github'
              ? 'i-simple-icons-github'
              : link.type === 'twitter'
                ? 'i-simple-icons-x'
                : link.type === 'blog'
                  ? 'i-lucide-pencil-line'
                  : 'i-lucide-globe'} size-4"
            aria-hidden="true"
          ></span>
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
  .scene {
    perspective: 900px;
  }

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    border-radius: 16px;
    border: 1px solid var(--color-stone-200, #e7e5e4);
    background:
      radial-gradient(
        120% 140% at 100% 0%,
        color-mix(in srgb, var(--accent) 7%, transparent),
        transparent 55%
      ),
      linear-gradient(160deg, #fffdf9 0%, #fff 60%, color-mix(in srgb, var(--accent) 4%, #fff) 100%);
    transform: rotateX(var(--rx)) rotateY(var(--ry));
    transition:
      transform 500ms cubic-bezier(0.16, 1, 0.3, 1),
      border-color 300ms ease,
      box-shadow 300ms ease,
      background 300ms ease;
    animation: card-in 600ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) both;
    animation-delay: var(--enter-delay);
    will-change: transform;
  }

  @media (min-width: 640px) {
    .card {
      gap: 20px;
      padding: 24px;
    }
  }

  .card.hovering {
    transition:
      transform 80ms linear,
      border-color 300ms ease,
      box-shadow 300ms ease,
      background 300ms ease;
    border-color: color-mix(in srgb, var(--accent) 55%, transparent);
    background:
      radial-gradient(
        120% 140% at 100% 0%,
        color-mix(in srgb, var(--accent) 12%, transparent),
        transparent 60%
      ),
      linear-gradient(160deg, #fffdf9 0%, #fff 55%, color-mix(in srgb, var(--accent) 7%, #fff) 100%);
    box-shadow:
      0 18px 40px -18px color-mix(in srgb, var(--accent) 35%, transparent),
      0 2px 8px -2px rgb(28 25 23 / 0.08);
  }

  :global(.dark) .card {
    background:
      radial-gradient(
        120% 140% at 100% 0%,
        color-mix(in srgb, var(--accent) 9%, transparent),
        transparent 55%
      ),
      linear-gradient(
        160deg,
        rgb(255 255 255 / 0.045) 0%,
        rgb(255 255 255 / 0.02) 60%,
        rgb(255 255 255 / 0.045) 100%
      );
    border-color: rgb(231 229 228 / 0.08);
  }

  :global(.dark) .card.hovering {
    background:
      radial-gradient(
        120% 140% at 100% 0%,
        color-mix(in srgb, var(--accent) 15%, transparent),
        transparent 60%
      ),
      linear-gradient(
        160deg,
        rgb(255 255 255 / 0.06) 0%,
        rgb(255 255 255 / 0.03) 55%,
        rgb(255 255 255 / 0.06) 100%
      );
  }

  @keyframes card-in {
    from {
      opacity: 0;
      transform: translateY(18px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Cursor-tracking shine */
  .shine {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
    background: radial-gradient(
      420px circle at var(--mx) var(--my),
      color-mix(in srgb, var(--accent) 9%, transparent),
      transparent 65%
    );
    transition: opacity 300ms ease;
  }

  .card.hovering .shine {
    opacity: 1;
  }

  /* Kaomoji speech bubble */
  .bubble {
    position: absolute;
    top: -14px;
    left: 68px;
    padding: 4px 10px;
    border-radius: 10px 10px 10px 2px;
    background: var(--accent);
    color: #faf9f5;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    opacity: 0;
    transform: translateY(6px) rotate(-4deg) scale(0.9);
    transform-origin: bottom left;
    pointer-events: none;
    transition:
      opacity 220ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)),
      transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .card.hovering .bubble {
    opacity: 1;
    transform: translateY(0) rotate(-4deg) scale(1);
  }

  .avatar {
    width: 64px;
    height: 64px;
    flex-shrink: 0;
    border-radius: 9999px;
    object-fit: cover;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 30%, transparent);
    transition:
      transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 300ms ease;
  }

  .card.hovering .avatar {
    transform: rotate(-8deg) scale(1.08);
    box-shadow: 0 0 0 2px var(--accent);
  }

  .links {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 8px;
    align-self: center;
  }

  .link-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid var(--color-stone-200, #e7e5e4);
    color: var(--color-stone-400, #a8a29e);
    transition:
      transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1),
      border-color 200ms ease,
      color 200ms ease,
      background-color 200ms ease;
  }

  :global(.dark) .link-btn {
    border-color: rgb(231 229 228 / 0.1);
    color: var(--color-stone-500, #78716c);
  }

  .link-btn:hover {
    transform: translateY(-3px) scale(1.08);
    border-color: color-mix(in srgb, var(--accent) 70%, transparent);
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 8%, transparent);
  }

  :global(.dark) .link-btn:hover {
    color: color-mix(in srgb, var(--accent) 80%, #fff 20%);
  }
</style>
