<script lang="ts">
    interface EmptyStateProps {
        message: string;
        actionLabel?: string;
        actionHref?: string;
    }

    let { message, actionLabel, actionHref }: EmptyStateProps = $props();
</script>

<div class="text-center py-12">
    <p class="text-lg">{message}</p>
    {#if actionLabel && actionHref}
        <a href={actionHref} class="btn btn-primary mt-4">
            {actionLabel}
        </a>
    {/if}
</div>
