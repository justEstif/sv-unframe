<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { challengesByTechnique } = data;
</script>

<svelte:head>
  <title>Your Courses - Unframe</title>
</svelte:head>

{#if challengesByTechnique.length === 0}
  <div class="text-center py-12">
    <p class="text-lg">You haven't started any challenges yet.</p>
    <a href="/all-courses" class="btn btn-primary mt-4"> Explore Challenges </a>
  </div>
{:else}
  <div class="space-y-12">
    {#each challengesByTechnique as { technique, attemptedCount, challengeCount } (technique.id)}
      <section class="space-y-4">
        <h2 class="text-2xl font-bold">{technique.name}</h2>
        <p class="mt-1">{technique.description}</p>
        <p class="text-sm mt-2">
          {attemptedCount} / {challengeCount}
          {challengeCount === 1 ? "challenge" : "challenges"}
        </p>
      </section>
    {/each}
  </div>
{/if}
