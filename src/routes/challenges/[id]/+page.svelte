<script lang="ts">
  import NavBar from '$lib/components/NavBar.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const { challenge, relatedTechniques, latestAttempt, allAttempts } = data;

  const difficultyColors = {
    easy: 'badge-success',
    medium: 'badge-warning',
    hard: 'badge-error'
  };

  const getDifficultyColor = (difficulty: string) => {
    return difficultyColors[difficulty as keyof typeof difficultyColors] || 'badge-neutral';
  };
</script>

<svelte:head>
  <title>{challenge.title} - Unframe</title>
</svelte:head>

<NavBar />

<div class="min-h-screen bg-base-200">
  <div class="container mx-auto px-4 py-8">
    <!-- Back button -->
    <a href="/your-courses" class="btn btn-ghost btn-sm mb-6">
      ← Back to Courses
    </a>

    <!-- Challenge Header -->
    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body">
        <h1 class="card-title text-4xl mb-4">{challenge.title}</h1>

        <div class="flex gap-2 flex-wrap mb-4">
          <span class="badge {getDifficultyColor(challenge.difficulty)}">
            {challenge.difficulty}
          </span>
          {#if latestAttempt}
            <span class="badge badge-info">Attempted</span>
          {/if}
        </div>

        <!-- Challenge Content -->
        <div class="divider"></div>
        <div class="prose max-w-none mb-4">
          <h3>Challenge</h3>
          <p>{challenge.contentText}</p>
        </div>

        {#if challenge.historicalContext}
          <div class="divider"></div>
          <div class="prose max-w-none mb-4">
            <h3>Historical Context</h3>
            <p>{challenge.historicalContext}</p>
          </div>
        {/if}

        {#if challenge.explanation}
          <div class="divider"></div>
          <div class="prose max-w-none mb-4">
            <h3>Explanation</h3>
            <p>{challenge.explanation}</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Related Techniques -->
    {#if relatedTechniques.length > 0}
      <div class="card bg-base-100 shadow-lg mb-6">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">Related Techniques</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each relatedTechniques as technique (technique.id)}
              <div class="card bg-base-200">
                <div class="card-body p-4">
                  <h3 class="card-title text-lg">{technique.name}</h3>
                  <p class="text-sm">{technique.description}</p>
                  {#if technique.exampleText}
                    <div class="text-xs text-gray-500 mt-2 font-mono bg-base-300 p-2 rounded">
                      {technique.exampleText}
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    <!-- Challenge Image -->
    {#if challenge.imageUrl}
      <div class="card bg-base-100 shadow-lg mb-6">
        <figure class="px-6 pt-6 h-96">
          <img
            src={challenge.imageUrl}
            alt={challenge.title}
            class="w-full h-full object-cover rounded-lg"
          />
        </figure>
      </div>
    {/if}

    <!-- Attempt History -->
    {#if allAttempts.length > 0}
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">Your Attempts</h2>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Accuracy</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {#each allAttempts as attempt (attempt.id)}
                  <tr>
                    <td>{new Date(attempt.attemptedAt).toLocaleDateString()}</td>
                    <td>{Math.round(attempt.accuracyScore * 100)}%</td>
                    <td>
                      {#if attempt.isCorrect}
                        <span class="badge badge-success">Correct</span>
                      {:else}
                        <span class="badge badge-error">Incorrect</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    {/if}

    <!-- Action Button -->
    <div class="mt-6 flex gap-2">
      <button class="btn btn-primary btn-lg">
        {latestAttempt ? 'Try Again' : 'Start Challenge'}
      </button>
      <a href="/your-courses" class="btn btn-secondary btn-lg">
        Back to Courses
      </a>
    </div>
  </div>
</div>
