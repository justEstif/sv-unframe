<script lang="ts">
  import { signout } from "$lib/api/auth.remote";
</script>

<div class="navbar bg-base-100 shadow-sm">
  <div class="flex-1">
    <a class="btn btn-ghost text-lg" href="/your-courses">Unframe</a>
  </div>
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1">
      <li>
        <button
          class="btn btn-link"
          onclick={async () => {
            await signout();
          }}>Sign out</button
        >
      </li>
    </ul>
  </div>
</div>
