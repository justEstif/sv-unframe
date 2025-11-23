<script lang="ts">
  import NavBar from "$lib/components/NavBar.svelte";
  import { page } from "$app/state";
  let { children } = $props();
</script>

<NavBar />

<div class="min-h-screen">
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

    <!-- Tabs -->
    <div class="tabs tabs-boxed bg-base-100 rounded-lg mb-6 px-0">
      <a
        href="/quizzes"
        class="tab"
        class:tab-active={page.url.pathname.startsWith("/quizzes")}
      >
        Quizzes
      </a>
    </div>

    <!-- Page Content -->
    {@render children()}
  </div>
</div>
