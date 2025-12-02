<script lang="ts">
  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();

  function formatScore(score: number): string {
    return `${Math.round(score * 100)}%`;
  }

  function formatDate(date: Date | null): string {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getScoreBadgeClass(score: number): string {
    if (score >= 0.8) return "badge-success";
    if (score >= 0.6) return "badge-warning";
    return "badge-error";
  }

  function getDifficultyBadgeClass(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "badge-success";
      case "medium":
        return "badge-warning";
      case "hard":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  }
</script>

<div class="container mx-auto max-w-5xl px-4 py-8">
  <!-- Header with breadcrumbs -->
  <div class="text-sm breadcrumbs mb-4">
    <ul>
      <li><a href="/quizzes">Quizzes</a></li>
      <li><a href="/results">Results</a></li>
      <li>{data.quiz.title}</li>
    </ul>
  </div>

  <!-- Summary Card -->
  <div class="card bg-base-200 shadow-xl mb-8">
    <div class="card-body">
      <h1 class="text-3xl font-bold mb-4">{data.quiz.title}</h1>

      <div class="flex flex-wrap gap-2 mb-6">
        <span class="badge {getDifficultyBadgeClass(data.quiz.difficulty)}">
          {data.quiz.difficulty}
        </span>
        <span class="badge badge-outline">
          {data.attempt.totalChallenges} Questions
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="text-center">
          <div class="text-5xl font-bold mb-2">
            {formatScore(data.attempt.accuracyScore)}
          </div>
          <div
            class="badge {getScoreBadgeClass(data.attempt.accuracyScore)} badge-lg"
          >
            Overall Score
          </div>
        </div>

        <div class="text-center">
          <div class="text-5xl font-bold mb-2">
            {data.attempt.correctAnswers}
          </div>
          <div class="badge badge-outline badge-lg">Correct Answers</div>
        </div>

        <div class="text-center">
          <div class="text-5xl font-bold mb-2">
            {data.attempt.totalChallenges - data.attempt.correctAnswers}
          </div>
          <div class="badge badge-outline badge-lg">Incorrect</div>
        </div>
      </div>

      <div class="mb-4">
        <p class="text-sm text-base-content/70">
          Completed: {formatDate(data.attempt.completedAt)}
        </p>
      </div>

      <progress
        class="progress progress-primary w-full mb-6"
        value={data.attempt.accuracyScore * 100}
        max="100"
      ></progress>

      <div class="flex flex-wrap gap-3">
        <a href="/quizzes/{data.quiz.id}" class="btn btn-primary">
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Retake Quiz
        </a>
        <a
          href="/results?quiz={data.quiz.id}"
          class="btn btn-outline"
        >
          View All Attempts
        </a>
        <a href="/results" class="btn btn-ghost">
          Back to Results
        </a>
      </div>
    </div>
  </div>

  <!-- Challenge Breakdown -->
  <div class="mb-4">
    <h2 class="text-2xl font-bold">Question Breakdown</h2>
    <p class="text-base-content/70">
      Review each question and see how you performed
    </p>
  </div>

  <div class="space-y-6">
    {#each data.challengeResults as result, index}
      <div
        class="card bg-base-200 shadow-md border-l-4 {result.isCorrect
          ? 'border-success'
          : 'border-error'}"
      >
        <div class="card-body">
          <div class="flex items-start justify-between gap-4 mb-4">
            <h3 class="text-xl font-semibold flex-1">
              Question {index + 1}: {result.title}
            </h3>
            <div class="flex flex-col items-end gap-2">
              <span
                class="badge badge-lg {result.isCorrect
                  ? 'badge-success'
                  : 'badge-error'}"
              >
                {#if result.isCorrect}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-1"
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
                  Correct
                {:else}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Incorrect
                {/if}
              </span>
              <span class="text-sm text-base-content/70">
                {formatScore(result.accuracyScore)} accuracy
              </span>
            </div>
          </div>

          {#if result.imageUrl}
            <figure class="mb-4">
              <img
                src={result.imageUrl}
                alt={result.title}
                class="rounded-lg max-h-64 object-contain w-full"
              />
            </figure>
          {/if}

          <div class="mb-4">
            <p class="text-base">{result.contentText}</p>
          </div>

          {#if result.historicalContext}
            <div class="alert alert-info mb-4">
              <div>
                <h4 class="font-bold text-sm">Historical Context</h4>
                <p class="text-xs">{result.historicalContext}</p>
              </div>
            </div>
          {/if}

          <div class="divider"></div>

          <div class="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 class="font-semibold mb-2 text-sm">Your Selection:</h4>
              <div class="flex flex-wrap gap-2">
                {#each result.selectedTechniques as technique}
                  {@const isCorrect =
                    result.correctTechniques.includes(technique)}
                  <span
                    class="badge {isCorrect
                      ? 'badge-success'
                      : 'badge-error'} gap-1"
                  >
                    {#if isCorrect}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
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
                    {:else}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    {/if}
                    {technique}
                  </span>
                {/each}
                {#if result.selectedTechniques.length === 0}
                  <span class="text-sm text-base-content/70 italic"
                    >No techniques selected</span
                  >
                {/if}
              </div>
            </div>

            <div>
              <h4 class="font-semibold mb-2 text-sm">Correct Techniques:</h4>
              <div class="flex flex-wrap gap-2">
                {#each result.correctTechniques as technique}
                  <span class="badge badge-success badge-outline">
                    {technique}
                  </span>
                {/each}
              </div>
              <div class="mt-2">
                <span class="text-xs text-base-content/70">
                  Primary: <strong>{result.primaryTechnique}</strong>
                </span>
              </div>
            </div>
          </div>

          {#if result.explanation}
            <div class="alert alert-warning">
              <div>
                <h4 class="font-bold text-sm">Explanation</h4>
                <p class="text-xs">{result.explanation}</p>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <!-- Bottom Navigation -->
  <div class="mt-8 flex justify-center gap-3">
    <a href="/quizzes/{data.quiz.id}" class="btn btn-primary">
      Retake Quiz
    </a>
    <a href="/results" class="btn btn-outline">
      Back to All Results
    </a>
  </div>
</div>
