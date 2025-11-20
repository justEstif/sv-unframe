<script lang="ts">
  import { getUser, signout } from "$lib/api/auth.remote";

  const user = await getUser();
</script>

<div class="navbar bg-base-100 shadow-sm">
  <div class="flex-1">
    <a class="btn btn-ghost text-xl" href="/dashboard">Unframe</a>
  </div>
  <div class="flex-none">
    <ul class="menu menu-horizontal px-1">
      <li>
        <details>
          <summary>{user.name}</summary>
          <ul class="bg-base-100 rounded-t-none p-2">
            <li>
              <button
                class="btn btn-link"
                onclick={async () => {
                  await signout();
                }}>Sign out</button
              >
            </li>
          </ul>
        </details>
      </li>
    </ul>
  </div>
</div>
