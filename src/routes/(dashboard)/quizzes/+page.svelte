<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { quizzesWithProgress, allTechniques, selectedTechnique } = data;

  // Helper function to get completion status badge
  function getStatus(isCompleted: boolean | null, attemptCount: number) {
    if (!isCompleted && attemptCount === 0) return { label: "Not Started", class: "badge-neutral" };
    if (!isCompleted && attemptCount > 0) return { label: "In Progress", class: "badge-warning" };
    return { label: "Completed", class: "badge-success" };
  }

  // Helper function to format percentage
  function formatScore(score: number | null) {
    if (!score) return "—";
    return `${Math.round(score * 100)}%`;
  }
</script>

<svelte:head>
  <title>Quizzes - Unframe</title>
</svelte:head>

<div class="drawer lg:drawer-open">
  <input id="quiz-filter-drawer" type="checkbox" class="drawer-toggle" />

  <!-- Main content -->
  <div class="drawer-content flex flex-col">
    <!-- Mobile filter button -->
    <div class="flex items-center gap-4 p-4 lg:hidden">
      <label for="quiz-filter-drawer" class="btn btn-primary btn-sm">
        Filters
      </label>
      <h1 class="text-2xl font-bold">Quizzes</h1>
    </div>

    <!-- Desktop title -->
    <h1 class="hidden lg:block text-3xl font-bold p-6">Quizzes</h1>

    <!-- Quiz grid -->
    <div class="p-4 lg:p-6">
      {#if quizzesWithProgress.length === 0}
        <div class="text-center py-12">
          <p class="text-lg">No quizzes available for this filter.</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each quizzesWithProgress as { quiz, technique, attemptCount, bestScore, isCompleted } (quiz.id)}
            <a href={`/quizzes/${quiz.id}`} class="card bg-base-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <div class="card-body">
                <h3 class="card-title text-lg">{quiz.title}</h3>
                <p class="text-sm text-gray-600">{quiz.description}</p>

                <!-- Badges -->
                <div class="flex flex-wrap gap-2 mt-3">
                  {#if technique}
                    <span class="badge badge-outline">{technique.name}</span>
                  {/if}
                  <span class="badge badge-{quiz.difficulty === 'beginner' ? 'success' : quiz.difficulty === 'intermediate' ? 'warning' : 'error'}">
                    {quiz.difficulty}
                  </span>
                  <span class="badge {getStatus(isCompleted, attemptCount).class}">
                    {getStatus(isCompleted, attemptCount).label}
                  </span>
                </div>

                <!-- Progress info -->
                <div class="text-xs text-gray-500 mt-3 space-y-1">
                  {#if attemptCount > 0}
                    <p>Best Score: <span class="font-semibold">{formatScore(bestScore)}</span></p>
                    <p>Attempts: <span class="font-semibold">{attemptCount}</span></p>
                  {:else}
                    <p class="italic">Not attempted yet</p>
                  {/if}
                </div>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Sidebar -->
  <div class="drawer-side">
    <label for="quiz-filter-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <ul class="menu bg-base-200 min-h-full w-80 p-4 text-base-content">
      <!-- Sidebar title -->
      <li class="menu-title mb-4">
        <span>Filter by Technique</span>
      </li>

      <!-- All Quizzes link -->
      <li>
        <a
          href="/quizzes"
          class="rounded-lg {!selectedTechnique ? 'active bg-primary text-primary-content' : ''}"
        >
          All Quizzes
        </a>
      </li>

      <!-- Divider -->
      <li class="divider my-2"></li>

      <!-- Technique links -->
      {#each allTechniques as technique (technique.id)}
        <li>
          <a
            href={`/quizzes?technique=${technique.id}`}
            class="rounded-lg {selectedTechnique === technique.id ? 'active bg-primary text-primary-content' : ''}"
          >
            {technique.name}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</div>
