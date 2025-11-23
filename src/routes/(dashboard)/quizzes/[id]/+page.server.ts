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

  try {
    const result = await db
      .select()
      .from(challenges)
      .innerJoin(quizChallenges, eq(challenges.id, quizChallenges.challengeId))
      .where(eq(quizChallenges.quizId, params.id))
      .orderBy(quizChallenges.orderIndex);

    // Extract just the challenges
    const quiz = result.map((row) => row.challenges);

    if (quiz.length === 0) throw new Error("Quiz not found");

    return { quiz };
  } catch (error) {
    // Will have to haandle error better next time
    console.error("Error loading quiz:", error);
    throw error;
  }
};
