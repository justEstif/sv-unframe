<script lang="ts">
  import SignInForm from "$lib/components/SignInForm.svelte";
  import SignUpForm from "$lib/components/SignUpForm.svelte";

  let activeTab: "sign-in" | "sign-up" = $state("sign-in");
</script>

<svelte:head>
  <title>Home - Unframe</title>
</svelte:head>

<h1>Welcome to Unframe</h1>

<p>
  Unframe is a daily critical thinking practice tool that helps you develop
  immunity to manipulation by training you to recognize persuasive techniques in
  historical materials.
</p>

<div role="tablist" class="tabs tabs-border">
  <button
    role="tab"
    class={["tab", activeTab === "sign-in" && "tab-active"]}
    onclick={() => (activeTab = "sign-in")}>Sign In</button
  >
  <button
    role="tab"
    class={["tab", activeTab === "sign-up" && "tab-active"]}
    onclick={() => (activeTab = "sign-up")}>Sign Up</button
  >
</div>

{#if activeTab === "sign-in"}
  <SignInForm />
{:else}
  <SignUpForm />
{/if}
