<script lang="ts">
    let { quiz, technique, isCompleted, attemptCount } = $props();

    function getStatus(isCompleted: boolean | null, attemptCount: number) {
        if (!isCompleted && attemptCount === 0)
            return { label: "Not Started", class: "badge-neutral" };
        if (!isCompleted && attemptCount > 0)
            return { label: "In Progress", class: "badge-warning" };
        return { label: "Completed", class: "badge-success" };
    }
</script>

<div class="flex flex-wrap gap-2 mt-3">
    {#if technique}
        <span class="badge badge-outline">{technique.name}</span>
    {/if}
    <span
        class="badge badge-{quiz.difficulty === 'beginner'
            ? 'success'
            : quiz.difficulty === 'intermediate'
              ? 'warning'
              : 'error'}"
    >
        {quiz.difficulty}
    </span>
    <span class="badge {getStatus(isCompleted, attemptCount).class}">
        {getStatus(isCompleted, attemptCount).label}
    </span>
</div>
