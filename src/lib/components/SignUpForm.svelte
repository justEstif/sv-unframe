<script lang="ts">
  import { signup } from "$lib/api/auth.remote";
</script>

<form {...signup}>
  <fieldset class="space-y-4">
    <div class="form-control">
      <label class="label" for="username">
        <span class="label-text">Username</span>
      </label>
      <input {...signup.fields.name.as("text")} id="username" class="input input-bordered w-full" />
      {#each signup.fields.name.issues() ?? [] as issue}
        <div class="label">
          <span class="label-text-alt text-error">{issue.message}</span>
        </div>
      {/each}
    </div>

    <div class="form-control">
      <label class="label" for="email">
        <span class="label-text">Email</span>
      </label>
      <input {...signup.fields.email.as("text")} class="input input-bordered w-full" id="email" />
      {#each signup.fields.email.issues() as issue}
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
        {...signup.fields.password.as("password")}
        class="input input-bordered w-full"
        id="password"
      />
      {#each signup.fields.password.issues() as issue}
        <div class="label">
          <span class="label-text-alt text-error">{issue.message}</span>
        </div>
      {/each}
    </div>

    <button type="submit" class="btn btn-neutral w-full mt-2">Sign up</button>
  </fieldset>
</form>
