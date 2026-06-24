import { getCollection, type CollectionEntry } from "astro:content";

export const prerender = true;

export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

interface Props {
  post: CollectionEntry<"blog">;
}

export function GET({ props }: { props: Props }) {
  const { post } = props;
  const frontmatter = [
    `title: "${post.data.title.replaceAll('"', '\\"')}"`,
    `description: "${post.data.description.replaceAll('"', '\\"')}"`,
    `date: ${post.data.date.toISOString()}`,
    `tags: [${post.data.tags.map((tag) => `"${tag.replaceAll('"', '\\"')}"`).join(", ")}]`,
  ].join("\n");

  const markdown = `---\n${frontmatter}\n---\n\n${post.body}\n`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
