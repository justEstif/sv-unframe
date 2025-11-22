<script lang="ts">
  import NavBar from "$lib/components/NavBar.svelte";
  import {
    submitChallenges,
    getTechnique,
    getAllTechniques,
    getQuizChallenges,
  } from "$lib/api/challenges.remote";
  import { page } from "$app/state";

  const techniqueId = $derived(page.params.id);
  const technique = $derived(await getTechnique(techniqueId!));
  const allTechniques = $derived(await getAllTechniques());
  const quizData = $derived(await getQuizChallenges(techniqueId!));
</script>

<svelte:head>
  <title>{technique.name} - Practice Quiz - Unframe</title>
</svelte:head>

<NavBar />

<div class="container mx-auto p-6">
  {#if submitChallenges.result?.success}
    <div class="max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">Quiz Results</h2>
      <div class="stats shadow mb-6">
        <div class="stat">
          <div class="stat-title">Score</div>
          <div class="stat-value">
            {submitChallenges.result.score.toFixed(1)}%
          </div>
          <div class="stat-desc">
            {submitChallenges.result.correctCount}/{submitChallenges.result
              .totalChallenges} correct
          </div>
        </div>
      </div>

      {#each submitChallenges.result.results as result}
        {@const challengeTitle = quizData.challenges.find(
          (c) => c.id === result.challengeId,
        )?.title}
        <div
          class="alert {result.isCorrect
            ? 'alert-success'
            : 'alert-error'} mb-4"
        >
          <div>
            <p class="font-bold">{challengeTitle}</p>
            <p class="text-sm">
              <strong>Your answer:</strong>
              {result.selected
                .map((id) => allTechniques.find((t) => t.id === id)?.name)
                .join(", ") || "None"}
            </p>
            <p class="text-sm">
              <strong>Correct:</strong>
              {result.correct
                .map((id) => allTechniques.find((t) => t.id === id)?.name)
                .join(", ")}
            </p>
          </div>
        </div>
      {/each}

      <div class="flex justify-center mt-6">
        <button
          class="btn btn-primary"
          onclick={() => getQuizChallenges(techniqueId).refresh()}
        >
          Try More Challenges
        </button>
      </div>
    </div>
  {:else}
    <form {...submitChallenges} class="max-w-4xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold">{technique.name} Quiz</h1>
        <p class="text-sm opacity-70">
          {quizData.totalUnattempted} challenges remaining
        </p>
      </div>

      {#each quizData.challenges as challenge, index (challenge.id)}
        <div class="card bg-base-200 shadow-md mb-6">
          <div class="card-body">
            <h3 class="card-title">
              Question {index + 1}: {challenge.title}
            </h3>

            <input
              type="hidden"
              name="answers[{index}].challengeId"
              value={challenge.id}
            />

            {#if challenge.imageUrl}
              <figure>
                <img
                  src={challenge.imageUrl}
                  alt={challenge.title}
                  class="rounded-lg max-h-64 object-cover w-full"
                />
              </figure>
            {/if}

            <p class="text-sm opacity-70">
              <strong>Historical Context:</strong>
              {@html challenge.historicalContext}
            </p>

            <div
              class="badge {challenge.difficulty === 'easy'
                ? 'badge-success'
                : challenge.difficulty === 'medium'
                  ? 'badge-warning'
                  : 'badge-error'}"
            >
              {challenge.difficulty}
            </div>

            <div class="divider"></div>

            <p class="font-semibold">Select the propaganda techniques used:</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              {#each allTechniques as tech (tech.id)}
                <label class="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    name="answers[{index}].selectedTechniques"
                    value={tech.id}
                    class="checkbox checkbox-primary"
                  />
                  <span class="label-text">{tech.name}</span>
                </label>
              {/each}
            </div>
          </div>
        </div>
      {/each}

      {#if quizData.challenges.length === 0}
        <div class="alert alert-info">
          <span>You've completed all challenges for this technique!</span>
        </div>
      {:else}
        <div class="flex justify-center">
          <button
            type="submit"
            disabled={!!submitChallenges.pending}
            class="btn btn-primary btn-lg"
          >
            {#if submitChallenges.pending}
              <span class="loading loading-spinner"></span>
              Submitting...
            {:else}
              Submit Quiz
            {/if}
          </button>
        </div>
      {/if}
    </form>
  {/if}
</div>
