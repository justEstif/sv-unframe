import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { userQuizAttempts, quizzes } from "$lib/server/db/schema";
import { eq, and, desc } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) {
    return { attempts: [] };
  }

  const quizFilter = url.searchParams.get("quiz");

  // Build query conditions
  const conditions = [eq(userQuizAttempts.userId, locals.user.id)];

  if (quizFilter) {
    conditions.push(eq(userQuizAttempts.quizId, quizFilter));
  }

  // Fetch all attempts with quiz details
  const attempts = await db
    .select({
      attempt: userQuizAttempts,
      quiz: quizzes,
    })
    .from(userQuizAttempts)
    .innerJoin(quizzes, eq(userQuizAttempts.quizId, quizzes.id))
    .where(and(...conditions))
    .orderBy(desc(userQuizAttempts.attemptedAt));

  return {
    attempts: attempts.map((row) => ({
      id: row.attempt.id,
      quizId: row.attempt.quizId,
      quizTitle: row.quiz.title,
      quizDifficulty: row.quiz.difficulty,
      totalChallenges: row.attempt.totalChallenges,
      correctAnswers: row.attempt.correctAnswers,
      accuracyScore: row.attempt.accuracyScore,
      completedAt: row.attempt.completedAt,
      attemptedAt: row.attempt.attemptedAt,
    })),
    currentQuizFilter: quizFilter,
  };
};
