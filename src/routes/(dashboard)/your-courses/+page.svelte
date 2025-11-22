<script lang="ts">
  import ChallengeCard from '$lib/components/ChallengeCard.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const { userChallenges } = data;
</script>

<svelte:head>
  <title>Your Courses - Unframe</title>
</svelte:head>

{#if userChallenges.length === 0}
  <div class="text-center py-12">
    <p class="text-lg text-gray-600">You haven't started any challenges yet.</p>
    <a href="/all-courses" class="btn btn-primary mt-4">
      Explore Challenges
    </a>
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each userChallenges as { challenge, latestAttempt } (challenge.id)}
      <ChallengeCard
        {challenge}
        userAccuracy={latestAttempt.accuracyScore}
        isAttempted={true}
      />
    {/each}
  </div>
{/if}
