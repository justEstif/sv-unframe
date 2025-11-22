<script lang="ts">
  import NavBar from "$lib/components/NavBar.svelte";
  import { page } from "$app/state";
  let { children } = $props();
</script>

<NavBar />

<div class="min-h-screen">
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

    <!-- Tabs -->
    <div class="tabs tabs-boxed bg-base-100 rounded-lg mb-6">
      <a
        href="/your-courses"
        class="tab"
        class:tab-active={page.url.pathname === "/your-courses"}
      >
        Your Courses
      </a>
      <a
        href="/all-courses"
        class="tab"
        class:tab-active={page.url.pathname === "/all-courses"}
      >
        All Courses
      </a>
    </div>

    <!-- Page Content -->
    {@render children()}
  </div>
</div>
