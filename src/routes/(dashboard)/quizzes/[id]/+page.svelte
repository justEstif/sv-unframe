<script lang="ts">
  import { getQuizWithChallenges, submitQuiz } from "$lib/api/quizzes.remote";
  import type { PageData } from "./$types";
  import { page } from "$app/state";

  let { data }: { data: PageData } = $props();
  const quizId = $derived(page.params.id);

  // Load quiz data
  const quizData = $derived(getQuizWithChallenges(quizId!));

  // Quiz state
  let currentQuestionIndex = $state(0);
  let userAnswers: Record<string, string[]> = $state({});
  let submitted = $state(false);
  let submitting = $state(false);
  let results: any = $state(null);

  // Derived values
  const quiz = $derived.by(() => {
    const qd = quizData;
    return qd instanceof Promise ? null : qd?.quiz;
  });

  const challenges = $derived.by(() => {
    const qd = quizData;
    return qd instanceof Promise ? [] : qd?.challenges || [];
  });

  const allTechniques = $derived.by(() => {
    const qd = quizData;
    return qd instanceof Promise ? [] : qd?.allTechniques || [];
  });

  const currentChallenge = $derived(challenges[currentQuestionIndex]);
  const totalQuestions = $derived(challenges.length);
  const isFirstQuestion = $derived(currentQuestionIndex === 0);
  const isLastQuestion = $derived(currentQuestionIndex === totalQuestions - 1);

  // Get current challenge's correct answers
  const currentCorrectTechniques = $derived.by(() => {
    if (!currentChallenge) return [];
    return JSON.parse(currentChallenge.techniques) as string[];
  });

  // Check if user has selected all correct answers
  const hasSelectedAllCorrect = $derived.by(() => {
    const selected = userAnswers[currentChallenge?.id] || [];
    return (
      selected.length === currentCorrectTechniques.length &&
      selected.every((t) => currentCorrectTechniques.includes(t))
    );
  });

  // Navigation functions
  function goToNextQuestion() {
    if (!isLastQuestion) {
      currentQuestionIndex++;
    }
  }

  function goToPreviousQuestion() {
    if (!isFirstQuestion) {
      currentQuestionIndex--;
    }
  }

  // Toggle technique selection
  function toggleTechnique(techniqueId: string) {
    if (!currentChallenge) return;

    const challengeId = currentChallenge.id;
    const selected = userAnswers[challengeId] || [];

    if (selected.includes(techniqueId)) {
      userAnswers[challengeId] = selected.filter((t) => t !== techniqueId);
    } else {
      userAnswers[challengeId] = [...selected, techniqueId];
    }
  }

  // Submit quiz
  async function handleSubmitQuiz() {
    submitting = true;
    try {
      const answers = challenges.map((challenge) => ({
        challengeId: challenge.id,
        selectedTechniques: userAnswers[challenge.id] || [],
      }));

      const formData = new FormData();
      formData.append("quizId", quizId!);
      formData.append("answers", JSON.stringify(answers));

      const response = await fetch("?/submitQuiz", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.data) {
        results = result.data;
        submitted = true;
      }
    } catch (e) {
      console.error("Error submitting quiz:", e);
    } finally {
      submitting = false;
    }
  }

  // Check if all challenges have answers
  const allAnswered = $derived(
    challenges.every((challenge) => (userAnswers[challenge.id] || []).length > 0)
  );
</script>

<svelte:head>
  <title>{quiz?.title || "Quiz"} - Unframe</title>
</svelte:head>

{#if submitted && results}
  <!-- Results Screen -->
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4">{quiz?.title} - Results</h1>

      <!-- Score Summary -->
      <div class="stats stats-vertical lg:stats-horizontal shadow-md bg-base-200 w-full mb-8">
        <div class="stat">
          <div class="stat-title">Score</div>
          <div class="stat-value text-primary">{Math.round(results.score)}%</div>
        </div>
        <div class="stat">
          <div class="stat-title">Correct</div>
          <div class="stat-value">{results.correctCount}/{results.totalChallenges}</div>
        </div>
      </div>
    </div>

    <!-- Detailed Results -->
    <div class="space-y-6">
      {#each results.results as result, idx}
        {@const challenge = challenges[idx]}
        <div
          class="card {result.isCorrect
            ? 'bg-success/10 border border-success'
            : 'bg-error/10 border border-error'}"
        >
          <div class="card-body">
            <h3 class="card-title text-lg">{challenge.title}</h3>

            <div class="grid md:grid-cols-2 gap-4 mt-4">
              <!-- Your Answer -->
              <div>
                <p class="text-sm font-semibold mb-2">Your Answer:</p>
                {#if result.selected.length === 0}
                  <p class="text-sm italic text-gray-500">No techniques selected</p>
                {:else}
                  <div class="flex flex-wrap gap-2">
                    {#each result.selected as tech}
                      <span class="badge badge-outline">{tech}</span>
                    {/each}
                  </div>
                {/if}
              </div>

              <!-- Correct Answer -->
              <div>
                <p class="text-sm font-semibold mb-2">Correct Answer:</p>
                <div class="flex flex-wrap gap-2">
                  {#each result.correct as tech}
                    <span class="badge badge-success">{tech}</span>
                  {/each}
                </div>
              </div>
            </div>

            <!-- Feedback -->
            {#if result.isCorrect}
              <div class="alert alert-success mt-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>Perfect! All techniques correctly identified.</span>
              </div>
            {:else}
              <div class="alert alert-error mt-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m0 0l-2 2"
                  ></path>
                </svg>
                <span>Not quite right. Review the correct techniques above.</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- Back Button -->
    <div class="mt-8 flex gap-4">
      <a href="/quizzes" class="btn btn-primary">Back to Quizzes</a>
      <a href={`/quizzes/${quizId}`} class="btn btn-outline">Try Again</a>
    </div>
  </div>
{:else}
  <!-- Quiz In Progress -->
  {#await quizData}
    <div class="flex items-center justify-center h-screen">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:then _}
    {#if currentChallenge}
      <div class="max-w-4xl mx-auto p-6">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-2">{quiz?.title}</h1>
          <p class="text-gray-600 mb-4">{quiz?.description}</p>

          <!-- Progress -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="font-semibold">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span class="text-gray-500">{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
            </div>
            <progress
              class="progress progress-primary w-full"
              value={currentQuestionIndex + 1}
              max={totalQuestions}
            ></progress>
          </div>
        </div>

        <!-- Challenge Card -->
        <div class="card bg-base-200 shadow-lg mb-8">
          <div class="card-body">
            <!-- Challenge Image -->
            {#if currentChallenge.imageUrl}
              <div class="mb-6 rounded-lg overflow-hidden">
                <img
                  src={currentChallenge.imageUrl}
                  alt={currentChallenge.title}
                  class="w-full h-64 object-cover"
                />
              </div>
            {/if}

            <!-- Challenge Title -->
            <h2 class="card-title text-2xl mb-4">{currentChallenge.title}</h2>

            <!-- Challenge Content -->
            <p class="mb-6">{currentChallenge.contentText}</p>

            <!-- Historical Context -->
            {#if currentChallenge.historicalContext}
              <div class="alert bg-info/20 border border-info mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <div>
                  <h4 class="font-bold">Historical Context</h4>
                  <p class="text-sm">{currentChallenge.historicalContext}</p>
                </div>
              </div>
            {/if}

            <!-- Question -->
            <p class="text-lg font-semibold mb-4">
              What techniques of persuasion are being used?
            </p>

            <!-- Technique Checkboxes -->
            <div class="space-y-3">
              {#each allTechniques as technique}
                <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-base-300">
                  <input
                    type="checkbox"
                    class="checkbox checkbox-primary"
                    checked={(userAnswers[currentChallenge.id] || []).includes(technique.id)}
                    onchange={() => toggleTechnique(technique.id)}
                  />
                  <span class="flex-1">{technique.name}</span>
                </label>
              {/each}
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex gap-4 justify-between">
          <button
            onclick={goToPreviousQuestion}
            disabled={isFirstQuestion}
            class="btn btn-outline"
          >
            ← Previous
          </button>

          <div class="flex gap-4">
            {#if !isLastQuestion}
              <button
                onclick={goToNextQuestion}
                class="btn btn-primary"
              >
                Next →
              </button>
            {:else}
              <button
                onclick={handleSubmitQuiz}
                disabled={submitting || !allAnswered}
                class="btn btn-success"
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            {/if}
          </div>
        </div>

        {#if !allAnswered && isLastQuestion}
          <div class="alert alert-warning mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4v2m0 4v2"
              ></path>
            </svg>
            <span>Please answer all questions before submitting.</span>
          </div>
        {/if}
      </div>
    {/if}
  {/await}
{/if}
