<script lang="ts">
  import type { PageData } from "./$types";
  import EmptyState from "$lib/components/EmptyState.svelte";

  const { data }: { data: PageData } = $props();

  function formatScore(score: number): string {
    return `${Math.round(score * 100)}%`;
  }

  function formatDate(date: Date | null): string {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

<div class="container mx-auto max-w-6xl px-4 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold mb-2">My Quiz Results</h1>
    <p class="text-base-content/70">
      View your quiz attempt history and track your progress
    </p>
  </div>

  {#if data.attempts.length === 0}
    <EmptyState
      message={data.currentQuizFilter
        ? "No attempts found for this quiz"
        : "You haven't completed any quizzes yet"}
      actionLabel="Browse Quizzes"
      actionHref="/quizzes"
    />
  {:else}
    <div class="grid gap-6">
      {#each data.attempts as attempt}
        <div class="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
          <div class="card-body">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div class="flex-1">
                <h2 class="card-title text-xl mb-2">
                  {attempt.quizTitle}
                </h2>

                <div class="flex flex-wrap gap-2 mb-3">
                  <span
                    class="badge {getDifficultyBadgeClass(attempt.quizDifficulty)}"
                  >
                    {attempt.quizDifficulty}
                  </span>
                  <span class="badge badge-outline">
                    {attempt.totalChallenges} Questions
                  </span>
                </div>

                <p class="text-sm text-base-content/70">
                  Completed {formatDate(attempt.completedAt)}
                </p>
              </div>

              <div class="flex flex-col items-end gap-3">
                <div class="text-center">
                  <div class="text-3xl font-bold mb-1">
                    {formatScore(attempt.accuracyScore)}
                  </div>
                  <div
                    class="badge {getScoreBadgeClass(attempt.accuracyScore)} badge-lg"
                  >
                    {attempt.correctAnswers}/{attempt.totalChallenges} Correct
                  </div>
                </div>

                <div class="flex gap-2">
                  <a
                    href="/results/{attempt.id}"
                    class="btn btn-primary btn-sm"
                  >
                    View Details
                  </a>
                  <a
                    href="/quizzes/{attempt.quizId}"
                    class="btn btn-outline btn-sm"
                  >
                    Retake
                  </a>
                </div>
              </div>
            </div>

            <progress
              class="progress progress-primary w-full mt-4"
              value={attempt.accuracyScore * 100}
              max="100"
            ></progress>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
