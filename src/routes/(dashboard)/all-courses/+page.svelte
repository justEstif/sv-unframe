<script lang="ts">
  import ChallengeCard from "$lib/components/ChallengeCard.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { challengesWithAttempts } = data;
</script>

<svelte:head>
  <title>All Courses - Unframe</title>
</svelte:head>

{#if challengesWithAttempts.length === 0}
  <div class="text-center py-12">
    <p class="text-lg text-gray-600">No challenges available yet.</p>
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each challengesWithAttempts as { challenge, latestAttempt } (challenge.id)}
      <ChallengeCard
        {challenge}
        userAccuracy={latestAttempt?.accuracyScore}
        isAttempted={!!latestAttempt}
      />
    {/each}
  </div>
{/if}
