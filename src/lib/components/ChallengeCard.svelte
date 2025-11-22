<script lang="ts">
  import type { Challenge } from "$lib/server/db/schema";
  import { goto } from "$app/navigation";

  interface Props {
    challenge: Challenge;
    userAccuracy?: number;
    isAttempted?: boolean;
  }

  const { challenge, userAccuracy, isAttempted } = $props();

  const difficultyColors = {
    easy: "badge-success",
    medium: "badge-warning",
    hard: "badge-error",
  };

  const getDifficultyColor = (difficulty: string) => {
    return (
      difficultyColors[difficulty as keyof typeof difficultyColors] ||
      "badge-neutral"
    );
  };

  const handleCardClick = async () => {
    await goto(`/challenges/${challenge.id}`);
  };

  // Store previous location (defaults to /your-courses)
  const goBack = async () => {
    await goto("/your-courses");
  };
</script>

<div
  class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
  onclick={handleCardClick}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === "Enter" && handleCardClick()}
>
  {#if challenge.imageUrl}
    <figure class="px-4 pt-4 h-32 overflow-hidden">
      <img
        src={challenge.imageUrl}
        alt={challenge.title}
        class="w-full h-full object-cover rounded-lg"
      />
    </figure>
  {/if}

  <div class="card-body">
    <h2 class="card-title text-lg">{challenge.title}</h2>

    <div class="flex gap-2 flex-wrap">
      <span class="badge {getDifficultyColor(challenge.difficulty)}">
        {challenge.difficulty}
      </span>
      {#if isAttempted}
        <span class="badge badge-info">Attempted</span>
      {/if}
    </div>

    <p class="text-sm line-clamp-2">{challenge.contentText}</p>

    {#if userAccuracy !== undefined}
      <div class="divider my-1"></div>
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-600">Accuracy:</span>
        <span class="font-semibold">{Math.round(userAccuracy * 100)}%</span>
      </div>
    {/if}

    <div class="card-actions justify-end mt-4">
      <button class="btn btn-sm btn-primary" onclick={handleCardClick}>
        {isAttempted ? "Try Again" : "Start"}
      </button>
    </div>
  </div>
</div>
