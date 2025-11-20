<script lang="ts">
  import { login } from "$lib/api/auth.remote";
</script>

<form {...login}>
  <fieldset class="space-y-4">
    <div class="form-control">
      <label class="label" for="email">
        <span class="label-text">Email</span>
      </label>
      <input
        {...login.fields.email.as("email")}
        class="input input-bordered w-full"
        id="email"
      />
      {#each login.fields.email.issues() as issue}
        <div class="label">
          <span class="label-text-alt text-error">{issue.message}</span>
        </div>
      {/each}
    </div>

    <div class="form-control">
      <label class="label" for="password">
        <span class="label-text">Password</span>
      </label>
      <input
        {...login.fields.password.as("password")}
        class="input input-bordered w-full"
        id="password"
      />
      {#each login.fields.password.issues() as issue}
        <div class="label">
          <span class="label-text-alt text-error">{issue.message}</span>
        </div>
      {/each}
    </div>

    <button type="submit" class="btn btn-neutral w-full mt-2">Login</button>
  </fieldset>
</form>
