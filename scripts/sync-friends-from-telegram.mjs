import fs from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const inputPath = process.argv[2] ?? "data/telegram-members.json";
const outputPath = process.argv[3] ?? "src/lib/friends.generated.ts";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function pickUsername(entry) {
  const username = firstNonEmpty(
    entry.username,
    entry.user?.username,
    Array.isArray(entry.usernames) ? entry.usernames[0] : "",
  );
  return username || null;
}

function pickName(entry) {
  const fullName = firstNonEmpty(
    entry.name,
    [entry.first_name, entry.last_name].filter(Boolean).join(" "),
    entry.title,
    entry.user?.name,
    entry.user?.first_name,
  );
  return fullName || "Unknown";
}

function pickId(entry) {
  return toNumber(entry.id ?? entry.user_id ?? entry.user?.id, Date.now());
}

function pickUrl(entry, username) {
  const url = firstNonEmpty(entry.url, entry.website, entry.link);
  if (url) return url;
  if (username) return `https://t.me/${username}`;
  return "#";
}

function pickAvatar(entry, username) {
  const direct = firstNonEmpty(entry.avatarUrl, entry.avatar_url, entry.photo_url, entry.photo);
  if (direct) return direct;
  if (username) return `https://unavatar.io/telegram/${username}`;
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(pickName(entry))}`;
}

function normalize(input) {
  const rawList = Array.isArray(input)
    ? input
    : Array.isArray(input?.result)
      ? input.result
      : Array.isArray(input?.members)
        ? input.members
        : Array.isArray(input?.participants)
          ? input.participants
          : [];

  const dedup = new Map();

  for (const entry of rawList) {
    const username = pickUsername(entry);
    const id = pickId(entry);
    const name = pickName(entry);
    const url = pickUrl(entry, username);
    const avatarUrl = pickAvatar(entry, username);

    if (!name || url === "#") continue;

    dedup.set(id, { id, name, username, url, avatarUrl });
  }

  return Array.from(dedup.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function toTs(data) {
  const body = JSON.stringify(data, null, 2)
    .replace(/"([^"\\]+)":/g, "$1:")
    .replace(/"/g, '"');

  return `export type GeneratedFriend = {\n  id: number;\n  name: string;\n  username: string | null;\n  url: string;\n  avatarUrl: string;\n};\n\nexport const telegramFriends: GeneratedFriend[] = ${body};\n`;
}

async function main() {
  const resolvedInput = path.resolve(cwd, inputPath);
  const resolvedOutput = path.resolve(cwd, outputPath);

  const file = await fs.readFile(resolvedInput, "utf8");
  const parsed = JSON.parse(file);
  const normalized = normalize(parsed);

  if (!normalized.length) {
    throw new Error("No members found. Check your JSON shape or input file path.");
  }

  await fs.writeFile(resolvedOutput, toTs(normalized), "utf8");
  console.log(`Synced ${normalized.length} friends -> ${path.relative(cwd, resolvedOutput)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
