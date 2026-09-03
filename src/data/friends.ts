export type FriendLinkType = "website" | "blog" | "github" | "twitter";

interface FriendLink {
  type: FriendLinkType;
  url: string;
}

export interface Friend {
  name: string;
  avatarUrl: string;
  location: string;
  description: string;
  links: FriendLink[];
}

export const friends: Friend[] = [
  {
    name: "ruattd",
    avatarUrl: "https://blog.rqwq.link/img/avatar.webp",
    location: "China",
    description: "🍰 / .NET & TS / BE dev / INTJ / ACG / 🍏 user / Walk softly through the world.",
    links: [{ type: "blog", url: "https://blog.rqwq.link" }],
  },
  {
    name: "冷柠",
    avatarUrl: "https://blog.lemonice.top/img/avatar.webp",
    location: "China",
    description: "一位野生插画师、混音师，也是一名普通的大学生。",
    links: [
      { type: "github", url: "https://github.com" },
      { type: "blog", url: "https://example.com" },
    ],
  },
  {
    name: "cos",
    avatarUrl: "https://blog.cosine.ren/img/avatar.webp",
    location: "China",
    description: "E / ACG / 手工 / 深色模式强迫症 / INFP / 兴趣广泛养两只猫的老宅女 / remote",
    links: [
      { type: "blog", url: "https://example.com/portfolio" },
      { type: "twitter", url: "https://x.com" },
    ],
  },
];
