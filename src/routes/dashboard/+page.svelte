<script lang="ts">
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  console.log(data.user);
</script>

<div>This is a navbar with your data {JSON.stringify(data.user)}</div>

<h1>Dashboard</h1>

Courses Started
<div>course 1</div>
<div>course 1</div>

<div class="divider">OR</div>

Not started

<div>course 1</div>
<div>course 1</div>
<div>course 1</div>
