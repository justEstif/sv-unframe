import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) {
    redirect(303, "/login");
  }
  if (!params.id) {
    redirect(404, "/");
  }
};
