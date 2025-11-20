<script lang="ts">
  import { login } from "$lib/api/auth.remote";
</script>

<form {...login}>
  <fieldset
    class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4"
  >
    <label class="label" for="email"> Email</label>
    <input {...login.fields.email.as("email")} class="input" id="email" />

    {#each login.fields.email.issues() ?? [] as issue}
      <p class="issue">{issue.message}</p>
    {/each}

    <label class="label" for="password"> Password </label>
    <input
      {...login.fields.password.as("password")}
      class="input"
      id="password"
    />
    {#each login.fields.password.issues() ?? [] as issue}
      <p class="issue">{issue.message}</p>
    {/each}

    <button type="submit" class="btn btn-neutral">Login</button>
  </fieldset>
</form>
