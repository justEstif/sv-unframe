<script lang="ts">
    let { attemptCount, bestScore } = $props();

    function formatScore(score: number | null) {
        if (!score) return "—";
        return `${Math.round(score * 100)}%`;
    }
</script>

<div class="text-xs text-gray-500 mt-3 space-y-1">
    {#if attemptCount > 0}
        <p>
            Best Score: <span class="font-semibold"
                >{formatScore(bestScore)}</span
            >
        </p>
        <p>
            Attempts: <span class="font-semibold">{attemptCount}</span>
        </p>
    {:else}
        <p class="italic">Not attempted yet</p>
    {/if}
</div>
