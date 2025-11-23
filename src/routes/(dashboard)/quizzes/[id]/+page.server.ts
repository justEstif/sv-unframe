import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { challenges, quizChallenges } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals, params }) => {
  const user = locals.user;
  if (!user) {
    throw new Error("User not found");
  }

  if (!params.id) {
    throw new Error("Quiz ID not provided");
  }

  const result = await db
    .select()
    .from(challenges)
    .innerJoin(quizChallenges, eq(challenges.id, quizChallenges.challengeId))
    .where(eq(quizChallenges.quizId, params.id))
    .orderBy(quizChallenges.orderIndex);

  // Extract just the challenges
  const quiz = result.map((row) => row.challenges);
  return { quiz };
};
