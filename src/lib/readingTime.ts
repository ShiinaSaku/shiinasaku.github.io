/** Average reading speed in words per minute */
const WPM = 200;

/**
 * Returns estimated reading time in whole minutes (minimum 1).
 * Works on raw Markdown / MDX body text.
 */
export function getReadingTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WPM));
}

/** Returns the total word count of a text string. */
export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
