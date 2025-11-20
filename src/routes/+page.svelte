<script lang="ts">
  import SignInForm from "$lib/components/SignInForm.svelte";
  import SignUpForm from "$lib/components/SignUpForm.svelte";
</script>

<svelte:head>
  <title>Home - Unframe</title>
</svelte:head>

<div class="hero min-h-screen">
  <div class="hero-content flex-col lg:flex-row">
    <div class="text-center lg:text-left">
      <h1 class="text-5xl font-bold">Welcome to Unframe</h1>
      <p class="py-6 text-lg">
        Unframe is a daily critical thinking practice tool that helps you
        develop immunity to manipulation by training you to recognize persuasive
        techniques in historical materials.
      </p>
    </div>
    <div class="card bg-base-300 w-full max-w-sm shrink-0 shadow-2xl">
      <div class="card-body">
        <div role="tablist" class="tabs tabs-boxed">
          <input
            type="radio"
            name="auth_tabs"
            class="tab"
            aria-label="Sign In"
            checked
          />
          <div class="tab-content p-6">
            <SignInForm />
          </div>

          <input
            type="radio"
            name="auth_tabs"
            class="tab"
            aria-label="Sign Up"
          />
          <div class="tab-content p-6">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
