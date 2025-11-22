<script lang="ts">
  import { signout } from "$lib/api/auth.remote";
</script>

<div class="navbar bg-base-100 shadow-sm px-0">
  <div class="flex-1">
    <a class="btn btn-ghost text-lg pl-0 bl-0" href="/your-courses">Unframe</a>
  </div>
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1">
      <li>
        <button
          class="btn btn-link pr-0"
          onclick={async () => {
            await signout();
          }}>Sign out</button
        >
      </li>
    </ul>
  </div>
</div>
