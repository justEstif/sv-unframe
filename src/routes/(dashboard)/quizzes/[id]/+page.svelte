<script lang="ts">
  import { submitAnswer } from "$lib/api/quiz.remote";
  import type { Challenge } from "$lib/server/db/schema";
  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();

  // State for multi-step form
  let currentStep = $state(0);

  let answers = $state<Record<string, string[]>>({});
  $inspect(answers);

  // Progress tracking
  const totalSteps = $derived(data.quiz.length);
  const progress = $derived(((currentStep + 1) / totalSteps) * 100);

  // Navigation handlers
  function nextStep() {
    if (currentStep < totalSteps - 1) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
    }
  }

  // Answer management
  function toggleTechnique(challengeId: string, techniqueId: string) {
    if (!answers[challengeId]) {
      answers[challengeId] = [];
    }

    const index = answers[challengeId].indexOf(techniqueId);
    if (index > -1) {
      answers[challengeId] = answers[challengeId].filter(
        (id) => id !== techniqueId,
      );
    } else {
      answers[challengeId] = [...answers[challengeId], techniqueId];
    }
  }

  function isSelected(challengeId: string, techniqueId: string): boolean {
    return answers[challengeId]?.includes(techniqueId) ?? false;
  }

  const currentChallenge = $derived(data.quiz[currentStep]);
</script>

{#snippet ProgressBar(progress: number)}
  <div class="mb-8">
    <h1 class="text-3xl font-bold mb-4">Quiz</h1>

    <div class="flex justify-between text-sm mb-2">
      <span>Question {currentStep + 1} of {totalSteps}</span>
      <span>{progress.toFixed(0)}% Complete</span>
    </div>
    <progress
      class="progress progress-primary w-full"
      value={progress}
      max="100"
    ></progress>
  </div>
{/snippet}

{#snippet QuestionCard(challenge: Challenge)}
  <div class="card bg-base-200 shadow-xl mb-6">
    <div class="card-body">
      <h2 class="card-title text-2xl mb-4">
        {challenge.title}
      </h2>

      {#if challenge.imageUrl}
        <figure class="mb-4">
          <img
            src={challenge.imageUrl}
            alt={challenge.title}
            class="rounded-lg max-h-96 object-contain w-full"
          />
        </figure>
      {/if}

      <div class="mb-4">
        <p class="text-base mb-2">{challenge.contentText}</p>
      </div>

      {#if challenge.historicalContext}
        <div class="alert alert-info mb-4">
          <div>
            <h3 class="font-bold">Historical Context</h3>
            <div class="text-xs">
              {challenge.historicalContext}
            </div>
          </div>
        </div>
      {/if}

      <div class="divider"></div>

      <div>
        <p class="font-semibold mb-3">Select the propaganda techniques used:</p>

        {#if challenge.techniques}
          {@const availableTechniques = JSON.parse(challenge.techniques)}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            {#each availableTechniques as techniqueId}
              <label
                class="label cursor-pointer justify-start gap-3 bg-base-100 p-4 rounded-lg hover:bg-base-300 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isSelected(challenge.id, techniqueId)}
                  onchange={() => toggleTechnique(challenge.id, techniqueId)}
                  class="checkbox checkbox-primary"
                />
                <span class="label-text">{techniqueId}</span>
              </label>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/snippet}

{#snippet NavigationButtons(currentStep: number, totalSteps: number)}
  <div class="flex justify-between items-center">
    <button
      type="button"
      class="btn btn-outline"
      onclick={prevStep}
      disabled={currentStep === 0}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      Previous
    </button>

    {#if currentStep === totalSteps - 1}
      <button type="submit" class="btn btn-primary btn-lg">
        Submit Quiz
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </button>
    {:else}
      <button type="button" class="btn btn-primary" onclick={nextStep}>
        Next
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    {/if}
  </div>
{/snippet}

<div class="container mx-auto max-w-4xl">
  {@render ProgressBar(progress)}

  {#if currentChallenge}
    <form {...submitAnswer} method="POST">
      <input type="hidden" name="answers" value={JSON.stringify(answers)} />
      {@render QuestionCard(currentChallenge)}
      {@render NavigationButtons(currentStep, totalSteps)}
    </form>
  {:else}
    <div class="alert alert-warning">
      <span>No questions available in this quiz.</span>
    </div>
  {/if}
</div>
