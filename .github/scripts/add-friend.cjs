// Parses a friend-request issue body, validates it, and appends the entry
// to src/data/friends.json. Expects the YAML issue-form markdown body.
//
// Outputs:
//   changed  — "true" when friends.json was modified
//   name     — the friend that was added
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const DATA_PATH = "src/data/friends.json";
const AVATAR_DIR = "src/assets/friends";
const LINK_TYPES = new Set(["website", "blog", "github", "twitter"]);
const LIMITS = {
  name: 40,
  location: 40,
  description: 200,
  links: 5,
  total: 60,
  avatarBytes: 2 * 1024 * 1024,
};
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

function field(body, label) {
  const re = new RegExp(`### ${label}\\s*\\n\\n([\\s\\S]*?)(?=\\n### |$)`);
  return body.match(re)?.[1]?.trim() ?? "";
}

function clean(value) {
  return value.replace(/\r/g, "").replace(/\s+/g, " ").trim();
}

function parseLinks(raw) {
  const links = [];
  for (const line of raw.split("\n").map((l) => l.trim()).filter(Boolean)) {
    const m = line.match(/^(website|blog|github|twitter)\s+(\S+)$/i);
    if (!m) return { error: `Links must look like \`type url\` (one per line), got: ${line}` };
    const url = new URL(m[2]);
    if (url.protocol !== "https:") return { error: `Link must be https: ${m[2]}` };
    links.push({ type: m[1].toLowerCase(), url: url.toString() });
  }
  if (links.length === 0) return { error: "At least one link is required." };
  return { links };
}

module.exports = async function addFriend({ github, context, core }) {
  const issue = context.payload.issue;
  const body = issue?.body ?? "";
  const fail = async (message) => {
    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issue.number,
      body: `**Could not add you — ${message}**\n\nEdit the issue and re-open it, or submit a new one.`,
    });
    await github.rest.issues.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issue.number,
      state: "closed",
      state_reason: "not_planned",
    });
    core.setFailed(message);
  };

  const name = clean(field(body, "Name"));
  const avatarUrl = field(body, "Avatar URL").replace(/\s+/g, "");
  const location = clean(field(body, "Location")) || "Somewhere";
  const description = clean(field(body, "Description"));

  if (!name) return fail("Name is required.");
  if (name.length > LIMITS.name) return fail(`Name must be ≤${LIMITS.name} characters.`);
  if (!description) return fail("Description is required.");
  if (description.length > LIMITS.description)
    return fail(`Description must be ≤${LIMITS.description} characters.`);

  let avatar;
  try {
    avatar = new URL(avatarUrl);
    if (avatar.protocol !== "https:") throw new Error("https only");
  } catch {
    return fail("Avatar URL must be a direct https image link.");
  }

  const parsedLinks = parseLinks(field(body, "Links"));
  if (parsedLinks.error) return fail(parsedLinks.error);
  if (parsedLinks.links.length > LIMITS.links)
    return fail(`At most ${LIMITS.links} links.`);

  const friends = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  if (friends.length >= LIMITS.total) return fail(`Friends list is full (${LIMITS.total}).`);

  const duplicate = friends.find(
    (f) =>
      f.name.toLowerCase() === name.toLowerCase() ||
      f.avatarUrl === avatar.toString(),
  );
  if (duplicate) return fail(`Already friends with **${duplicate.name}**!`);

  // Download the avatar into the repo so the site never hotlinks.
  let avatarPath;
  try {
    const res = await fetch(avatar.toString(), {
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
      headers: { "user-agent": "shiina.xyz friends bot" },
    });
    if (!res.ok) return fail(`Avatar download failed (HTTP ${res.status}).`);
    const type = res.headers.get("content-type")?.split(";")[0] ?? "";
    if (!IMAGE_TYPES.has(type))
      return fail(`Avatar must be a direct image (png/jpg/webp/gif), got "${type}".`);
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length > LIMITS.avatarBytes) return fail("Avatar must be ≤2 MB.");
    if (bytes.length === 0) return fail("Avatar is empty.");

    const ext = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" }[type];
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const file = `${slug || "friend"}-${crypto.randomBytes(3).toString("hex")}.${ext}`;
    fs.mkdirSync(AVATAR_DIR, { recursive: true });
    fs.writeFileSync(path.join(AVATAR_DIR, file), bytes);
    avatarPath = file;
  } catch {
    return fail("Avatar download failed — check the URL is a direct, public https image link.");
  }

  friends.push({
    name,
    avatarUrl: avatarPath,
    location: location.slice(0, LIMITS.location),
    description: description.slice(0, LIMITS.description),
    links: parsedLinks.links,
  });

  fs.writeFileSync(DATA_PATH, `${JSON.stringify(friends, null, 2)}\n`);
  core.setOutput("changed", "true");
  core.setOutput("name", name);
};
