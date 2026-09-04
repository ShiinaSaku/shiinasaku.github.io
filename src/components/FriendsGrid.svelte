<script lang="ts">
  import FriendCard from "./FriendCard.svelte";
  import type { Friend } from "../lib/friends";

  interface Props {
    friends: Friend[];
    avatars: string[];
  }

  const { friends, avatars } = $props();
</script>

<div class="flex flex-col gap-5">
  {#each friends as friend, index (friend.name)}
    <FriendCard {friend} {index} avatarSrc={avatars[index] ?? friend.avatarUrl} />
  {/each}
</div>
