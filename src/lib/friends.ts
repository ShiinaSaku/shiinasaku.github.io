import friendsData from "../data/friends.json";

export type FriendLinkType = "website" | "blog" | "github" | "twitter";

export interface FriendLink {
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

// The bot (`.github/scripts/add-friend.cjs`) validates `link.type` before
// writing this file, so the narrowing assertion is safe.
export const friends = friendsData as Friend[];
