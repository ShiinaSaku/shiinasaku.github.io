<script setup lang="ts">
import { gsap } from "gsap";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

type PillNavItem = {
  label: string;
  href?: string;
  ariaLabel?: string;
};

interface PillNavProps {
  logo: string;
  logoAlt?: string;
  logoHref?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}

const props = withDefaults(defineProps<PillNavProps>(), {
  logoAlt: "Logo",
  logoHref: "/",
  className: "",
  ease: "power3.easeOut",
  baseColor: "#fff",
  pillColor: "#060010",
  hoveredPillTextColor: "#060010",
  initialLoadAnimation: true,
});

const resolvedPillTextColor = computed(() => props.pillTextColor ?? props.baseColor);

const isMobileMenuOpen = ref(false);

const circleRefs = ref<Array<HTMLSpanElement | null>>([]);
const tlRefs = ref<Array<gsap.core.Timeline | null>>([]);
const activeTweenRefs = ref<Array<gsap.core.Tween | null>>([]);
const logoImgRef = ref<HTMLImageElement | null>(null);
const logoTweenRef = ref<gsap.core.Tween | null>(null);
const hamburgerRef = ref<HTMLButtonElement | null>(null);
const mobileMenuRef = ref<HTMLDivElement | null>(null);
const navItemsRef = ref<HTMLDivElement | null>(null);
const logoRef = ref<HTMLAnchorElement | null>(null);

watch(
  () => props.items,
  (items) => {
    circleRefs.value = Array.from({ length: items.length }, () => null);
    tlRefs.value = Array.from({ length: items.length }, () => null);
    activeTweenRefs.value = Array.from({ length: items.length }, () => null);
  },
  { immediate: true },
);

const layout = () => {
  circleRefs.value.forEach((circle) => {
    if (!circle?.parentElement) return;

    const pill = circle.parentElement as HTMLElement;
    const rect = pill.getBoundingClientRect();
    const { width: w, height: h } = rect;
    const R = ((w * w) / 4 + h * h) / (2 * h);
    const D = Math.ceil(2 * R) + 2;
    const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
    const originY = D - delta;

    circle.style.width = `${D}px`;
    circle.style.height = `${D}px`;
    circle.style.bottom = `-${delta}px`;

    gsap.set(circle, {
      xPercent: -50,
      scale: 0,
      transformOrigin: `50% ${originY}px`,
    });

    const label = pill.querySelector<HTMLElement>(".pill-label");
    const white = pill.querySelector<HTMLElement>(".pill-label-hover");

    if (label) gsap.set(label, { y: 0 });
    if (white) gsap.set(white, { y: h + 12, opacity: 0 });

    const index = circleRefs.value.indexOf(circle);
    if (index === -1) return;

    tlRefs.value[index]?.kill();
    const tl = gsap.timeline({ paused: true });

    tl.to(
      circle,
      { scale: 1.2, xPercent: -50, duration: 2, ease: props.ease, overwrite: "auto" },
      0,
    );

    if (label) {
      tl.to(label, { y: -(h + 8), duration: 2, ease: props.ease, overwrite: "auto" }, 0);
    }

    if (white) {
      gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
      tl.to(white, { y: 0, opacity: 1, duration: 2, ease: props.ease, overwrite: "auto" }, 0);
    }

    tlRefs.value[index] = tl;
  });
};

const runInitialAnimation = () => {
  if (props.initialLoadAnimation) {
    const logo = logoRef.value;
    const navItems = navItemsRef.value;

    if (logo) {
      gsap.set(logo, { scale: 0 });
      gsap.to(logo, { scale: 1, duration: 0.6, ease: props.ease });
    }

    if (navItems) {
      gsap.set(navItems, { width: 0, overflow: "hidden" });
      gsap.to(navItems, { width: "auto", duration: 0.6, ease: props.ease });
    }
  }
};

const onResize = () => layout();

onMounted(async () => {
  await nextTick();

  layout();

  window.addEventListener("resize", onResize);

  if (document.fonts?.ready) {
    document.fonts.ready.then(layout).catch(() => {});
  }

  const menu = mobileMenuRef.value;
  if (menu) {
    gsap.set(menu, { visibility: "hidden", opacity: 0, scaleY: 1 });
  }

  runInitialAnimation();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});

watch(
  () => [props.items, props.ease, props.initialLoadAnimation] as const,
  async () => {
    await nextTick();
    layout();
    runInitialAnimation();
  },
  { deep: true },
);

const handleEnter = (i: number) => {
  const tl = tlRefs.value[i];
  if (!tl) return;
  activeTweenRefs.value[i]?.kill();
  activeTweenRefs.value[i] = tl.tweenTo(tl.duration(), {
    duration: 0.3,
    ease: props.ease,
    overwrite: "auto",
  });
};

const handleLeave = (i: number) => {
  const tl = tlRefs.value[i];
  if (!tl) return;
  activeTweenRefs.value[i]?.kill();
  activeTweenRefs.value[i] = tl.tweenTo(0, {
    duration: 0.2,
    ease: props.ease,
    overwrite: "auto",
  });
};

const handleLogoEnter = () => {
  const img = logoImgRef.value;
  if (!img) return;
  logoTweenRef.value?.kill();
  gsap.set(img, { rotate: 0 });
  logoTweenRef.value = gsap.to(img, {
    rotate: 360,
    duration: 0.2,
    ease: props.ease,
    overwrite: "auto",
  });
};

const toggleMobileMenu = () => {
  const newState = !isMobileMenuOpen.value;
  isMobileMenuOpen.value = newState;

  const hamburger = hamburgerRef.value;
  const menu = mobileMenuRef.value;

  if (hamburger) {
    const lines = hamburger.querySelectorAll(".hamburger-line");
    if (newState) {
      gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease: props.ease });
      gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease: props.ease });
    } else {
      gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease: props.ease });
      gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease: props.ease });
    }
  }

  if (menu) {
    if (newState) {
      gsap.set(menu, { visibility: "visible" });
      gsap.fromTo(
        menu,
        { opacity: 0, y: 10, scaleY: 1 },
        {
          opacity: 1,
          y: 0,
          scaleY: 1,
          duration: 0.3,
          ease: props.ease,
          transformOrigin: "top center",
        },
      );
    } else {
      gsap.to(menu, {
        opacity: 0,
        y: 10,
        scaleY: 1,
        duration: 0.2,
        ease: props.ease,
        transformOrigin: "top center",
        onComplete: () => {
          gsap.set(menu, { visibility: "hidden" });
        },
      });
    }
  }

  props.onMobileMenuClick?.();
};

const cssVars = computed(() => ({
  "--base": props.baseColor,
  "--pill-bg": props.pillColor,
  "--hover-text": props.hoveredPillTextColor,
  "--pill-text": resolvedPillTextColor.value,
  "--nav-h": "42px",
  "--logo": "36px",
  "--pill-pad-x": "18px",
  "--pill-gap": "3px",
}));

const setCircleRef = (el: HTMLSpanElement | null, index: number) => {
  if (circleRefs.value.length > index) {
    circleRefs.value[index] = el;
  }
};
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-4 z-99 flex justify-center">
    <nav
      :class="[
        'pointer-events-auto box-border flex w-max items-center justify-between gap-2 px-4 md:justify-start md:gap-0 md:px-0',
        className,
      ]"
      aria-label="Primary"
      :style="cssVars"
    >
      <a
        :href="logoHref"
        aria-label="Home"
        role="menuitem"
        ref="logoRef"
        class="inline-flex items-center justify-center overflow-hidden rounded-full p-1"
        :style="{
          width: 'var(--nav-h)',
          height: 'var(--nav-h)',
          background: 'var(--base, #000)',
        }"
        @mouseenter="handleLogoEnter"
      >
        <img
          :src="logo"
          :alt="logoAlt"
          ref="logoImgRef"
          class="block h-full w-full rounded-full object-cover"
        />
      </a>

      <div
        ref="navItemsRef"
        class="relative hidden items-center rounded-full md:flex"
        :style="{
          height: 'var(--nav-h)',
          background: 'var(--base, #000)',
        }"
      >
        <ul
          role="menubar"
          class="m-0 flex h-full list-none items-stretch"
          :style="{ gap: 'var(--pill-gap)', padding: '3px' }"
        >
          <li
            v-for="(item, i) in items"
            :key="item.href || `item-${i}`"
            class="flex h-full"
            role="none"
          >
            <a
              :href="item.href"
              role="menuitem"
              :aria-label="item.ariaLabel || item.label"
              :aria-current="activeHref === item.href ? 'page' : undefined"
              class="relative inline-flex h-full cursor-pointer items-center justify-center overflow-hidden rounded-full text-sm font-semibold uppercase leading-none tracking-[0.2px] whitespace-nowrap no-underline"
              :class="{ 'is-active': activeHref === item.href }"
              :style="{
                background: 'var(--pill-bg, #fff)',
                color: 'var(--pill-text, var(--base, #000))',
                paddingLeft: 'var(--pill-pad-x)',
                paddingRight: 'var(--pill-pad-x)',
              }"
              @mouseenter="handleEnter(i)"
              @mouseleave="handleLeave(i)"
            >
              <span
                class="hover-circle pointer-events-none absolute bottom-0 left-1/2 block rounded-full"
                :style="{
                  background: 'var(--base, #000)',
                  willChange: 'transform',
                }"
                aria-hidden="true"
                :ref="(el) => setCircleRef(el as HTMLSpanElement, i)"
              />
              <span class="label-stack relative z-2 inline-block leading-none">
                <span
                  class="pill-label relative z-2 inline-block leading-none"
                  :style="{ willChange: 'transform' }"
                >
                  {{ item.label }}
                </span>
                <span
                  class="pill-label-hover absolute left-0 top-0 z-3 inline-block"
                  :style="{
                    color: 'var(--hover-text, #fff)',
                    willChange: 'transform, opacity',
                  }"
                  aria-hidden="true"
                >
                  {{ item.label }}
                </span>
              </span>
            </a>
          </li>
        </ul>
      </div>

      <div class="flex items-center gap-2">
        <slot name="actions" />

        <button
          ref="hamburgerRef"
          @click="toggleMobileMenu"
          aria-label="Toggle menu"
          :aria-expanded="isMobileMenuOpen"
          class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-full border-0 p-0 md:hidden"
          :style="{
            width: 'var(--nav-h)',
            height: 'var(--nav-h)',
            background: 'var(--base, #000)',
          }"
        >
          <span
            class="hamburger-line h-0.5 w-4 origin-center rounded"
            :style="{ background: 'var(--pill-bg, #fff)' }"
          />
          <span
            class="hamburger-line h-0.5 w-4 origin-center rounded"
            :style="{ background: 'var(--pill-bg, #fff)' }"
          />
        </button>
      </div>
    </nav>

    <div
      ref="mobileMenuRef"
      class="pointer-events-auto absolute inset-x-4 top-[3.5em] z-998 origin-top rounded-[27px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] md:hidden"
      :style="{
        ...cssVars,
        background: 'var(--base, #f0f0f0)',
      }"
    >
      <ul class="m-0 flex list-none flex-col" :style="{ gap: '3px', padding: '3px' }">
        <li v-for="item in items" :key="item.href || `mobile-${item.label}`">
          <a
            :href="item.href"
            class="mobile-menu-link block rounded-[50px] px-4 py-3 text-base font-medium no-underline transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            :class="{ 'is-active': activeHref === item.href }"
            :style="{ background: 'var(--pill-bg, #fff)', color: 'var(--pill-text, #fff)' }"
            @click="isMobileMenuOpen = false"
            @mouseenter="
              (e: MouseEvent) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = 'var(--hover-text, #fff)';
                el.style.color = 'var(--base)';
              }
            "
            @mouseleave="
              (e: MouseEvent) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = 'var(--pill-bg, #fff)';
                el.style.color = 'var(--pill-text, #fff)';
              }
            "
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.is-active::after {
  content: "";
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: var(--base, #000);
  border-radius: 50px;
  z-index: 4;
}
</style>
