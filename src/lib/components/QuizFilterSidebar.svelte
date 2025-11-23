<script lang="ts">
    import FilterSection from "./FilterSection.svelte";
    import { page } from "$app/state";
    import type { Technique } from "$lib/server/db/schema";

    // note: the "techniques" should be moved into a remote function
    interface QuizFilterSidebarProps {
        allTechniques: Technique[];
    }

    let { allTechniques }: QuizFilterSidebarProps = $props();

    function buildFilterUrl(filterType: string, filterValue: string | null) {
        const params = new URLSearchParams(page.url.searchParams);
        if (filterValue) {
            params.set(filterType, filterValue);
        } else {
            params.delete(filterType);
        }
        return `/quizzes?${params.toString()}`;
    }

    // Make filters reactive to URL changes
    const selectedTechnique = $derived(page.url.searchParams.get("technique"));
    const selectedDifficulty = $derived(
        page.url.searchParams.get("difficulty"),
    );
    const selectedStatus = $derived(page.url.searchParams.get("status"));

    // Check if any filters are active
    const hasActiveFilters = $derived(
        selectedTechnique !== null ||
            selectedDifficulty !== null ||
            selectedStatus !== null,
    );

    // Status filter options
    const statusOptions = $derived([
        {
            label: "All",
            value: null,
            isActive: !selectedStatus,
            href: buildFilterUrl("status", null),
        },
        {
            label: "Not Started",
            value: "not-started",
            isActive: selectedStatus === "not-started",
            href: buildFilterUrl("status", "not-started"),
        },
        {
            label: "In Progress",
            value: "in-progress",
            isActive: selectedStatus === "in-progress",
            href: buildFilterUrl("status", "in-progress"),
        },
        {
            label: "Completed",
            value: "completed",
            isActive: selectedStatus === "completed",
            href: buildFilterUrl("status", "completed"),
        },
    ]);

    // Difficulty filter options
    const difficultyOptions = $derived([
        {
            label: "All",
            value: null,
            isActive: !selectedDifficulty,
            href: buildFilterUrl("difficulty", null),
        },
        {
            label: "Beginner",
            value: "beginner",
            isActive: selectedDifficulty === "beginner",
            href: buildFilterUrl("difficulty", "beginner"),
        },
        {
            label: "Intermediate",
            value: "intermediate",
            isActive: selectedDifficulty === "intermediate",
            href: buildFilterUrl("difficulty", "intermediate"),
        },
        {
            label: "Advanced",
            value: "advanced",
            isActive: selectedDifficulty === "advanced",
            href: buildFilterUrl("difficulty", "advanced"),
        },
    ]);

    // Technique filter options
    const techniqueOptions = $derived([
        {
            label: "All",
            value: null,
            isActive: !selectedTechnique,
            href: buildFilterUrl("technique", null),
        },
        ...allTechniques.map((technique) => ({
            label: technique.name,
            value: technique.id,
            isActive: selectedTechnique === technique.id,
            href: buildFilterUrl("technique", technique.id),
        })),
    ]);
</script>

<ul class="menu bg-base-200 min-h-full w-80 p-4 text-base-content space-y-2">
    <!-- Reset Filters Button -->
    {#if hasActiveFilters}
        <li class="mb-2">
            <a
                href="/quizzes"
                class="btn btn-outline btn-sm btn-error w-full gap-2"
            >
                Reset All Filters
            </a>
        </li>
        <li class="divider my-2"></li>
    {/if}

    <!-- Status Filter -->
    <FilterSection title="Filter by Status" options={statusOptions} />

    <!-- Divider -->
    <li class="divider my-2"></li>

    <!-- Difficulty Filter -->
    <FilterSection title="Filter by Difficulty" options={difficultyOptions} />

    <!-- Divider -->
    <li class="divider my-2"></li>

    <!-- Technique Filter -->
    <FilterSection title="Filter by Technique" options={techniqueOptions} />
</ul>
