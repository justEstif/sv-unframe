import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { quizzes } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals, params }) => {
  const user = locals.user;
  if (!user) {
    throw new Error("User not found");
  }

  if (!params.id) {
    throw new Error("Quiz ID not provided");
  }

  // Preload quiz metadata
  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, params.id))
    .limit(1);

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  return {
    quiz,
  };
};
