<script lang="ts">
    import type { PageData } from "./$types";
    import QuizCard from "$lib/components/QuizCard.svelte";
    import QuizFilterSidebar from "$lib/components/QuizFilterSidebar.svelte";
    import EmptyState from "$lib/components/EmptyState.svelte";

    let { data }: { data: PageData } = $props();
    const quizzesWithProgress = $derived(data.quizzesWithProgress);
    const allTechniques = $derived(data.allTechniques);
</script>

<svelte:head>
    <title>Quizzes - Unframe</title>
</svelte:head>

{#snippet funnelIcon()}
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
    >
        <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
        />
    </svg>
{/snippet}

<div class="drawer lg:drawer-open">
    <input id="quiz-filter-drawer" type="checkbox" class="drawer-toggle" />

    <!-- Main content -->
    <div class="drawer-content flex flex-col">
        <!-- Mobile filter button -->
        <div class="flex items-center gap-4 p-4 lg:hidden">
            <label for="quiz-filter-drawer" class="btn btn-primary btn-sm">
                {@render funnelIcon()}
            </label>
            <h1 class="text-2xl font-bold">Quizzes</h1>
        </div>

        <!-- Desktop title -->
        <h1 class="hidden lg:block text-3xl font-bold p-6">Quizzes</h1>

        <!-- Quiz grid -->
        <div class="p-4 lg:p-6">
            {#if quizzesWithProgress.length === 0}
                <EmptyState message="No quizzes available for this filter." />
            {:else}
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {#each quizzesWithProgress as { quiz, technique, attemptCount, bestScore, isCompleted } (quiz.id)}
                        <QuizCard
                            {quiz}
                            {technique}
                            {attemptCount}
                            {bestScore}
                            {isCompleted}
                        />
                    {/each}
                </div>
            {/if}
        </div>
    </div>

    <!-- Sidebar -->
    <div class="drawer-side">
        <label
            for="quiz-filter-drawer"
            aria-label="close sidebar"
            class="drawer-overlay"
        ></label>
        <QuizFilterSidebar {allTechniques} />
    </div>
</div>
