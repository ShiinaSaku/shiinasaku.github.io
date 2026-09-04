// UI sound feedback via @thenormvg/web-have-sounds — synthesized, zero audio files.
// Plays on elements with [data-sound] plus .btn-primary/.btn-secondary fallbacks;
// mute persisted in localStorage under "sounds".
import {
  configureUISounds,
  playUISound,
  setUISoundsEnabled,
  warmUpAudio,
} from "@thenormvg/web-have-sounds";

type SoundName = "blip" | "pop" | "chime";

const nameMap: Record<SoundName, Parameters<typeof playUISound>[0]> = {
  blip: "click",
  pop: "pop",
  chime: "success",
};

export function initSounds() {
  configureUISounds({
    feel: "glass",
    volume: 0.6,
    debug: import.meta.env?.DEV,
  });

  setUISoundsEnabled(!["off", "false"].includes(localStorage.getItem("sounds") ?? ""));

  document.addEventListener("click", (e) => {
    const target = e.target as Element | null;
    const el = target?.closest?.("[data-sound], .btn-primary, .btn-secondary");
    if (!el) return;
    const name = (el as HTMLElement).dataset.sound as SoundName | undefined;
    playUISound(nameMap[name ?? "blip"]);
  });

  // Unlock the AudioContext on the first user gesture (autoplay policy).
  document.addEventListener("pointerdown", () => warmUpAudio(), { once: true });
}

export function setSoundsEnabled(enabled: boolean) {
  localStorage.setItem("sounds", enabled ? "on" : "off");
  setUISoundsEnabled(enabled);
}
