<script lang="ts">
  import { signup } from "$lib/api/auth.remote";
</script>

<form {...signup}>
  <fieldset
    class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4"
  >
    <label class="label" for="username"> Username </label>
    <input {...signup.fields.name.as("text")} id="username" class="input" />
    {#each signup.fields.name.issues() ?? [] as issue}
      <p class="issue">{issue.message}</p>
    {/each}

    <label for="email" class="label"> Email </label>
    <input {...signup.fields.email.as("text")} class="input" id="email" />
    {#each signup.fields.email.issues() as issue}
      <p class="issue">{issue.message}</p>
    {/each}

    <label class="label" for="password">Password </label>
    <input
      {...signup.fields.password.as("password")}
      class="input"
      id="password"
    />
    {#each signup.fields.password.issues() as issue}
      <p class="issue">{issue.message}</p>
    {/each}

    <button type="submit" class="btn btn-neutral">Sign up</button>
  </fieldset>
</form>
