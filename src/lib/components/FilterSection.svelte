<script lang="ts">
    interface FilterOption {
        label: string;
        value: string | null;
        isActive: boolean;
        href: string;
    }

    interface FilterSectionProps {
        title: string;
        options: FilterOption[];
    }

    let { title, options }: FilterSectionProps = $props();
</script>

<li class="menu-title mb-2">
    <span>{title}</span>
</li>

{#each options as option (option.value ?? 'all')}
    <li>
        <a
            href={option.href}
            class="rounded-lg {option.isActive
                ? 'active bg-primary text-primary-content'
                : ''}"
        >
            {option.label}
        </a>
    </li>
{/each}
