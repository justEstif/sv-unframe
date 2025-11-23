import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { quizzes, techniques, userQuizAttempts } from "$lib/server/db/schema";
import { eq, sql } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = locals.user;
  if (!user) {
    throw new Error("User not found");
  }

  // Get technique filter from query params
  const techniqueFilter = url.searchParams.get("technique");

  // Get all techniques for sidebar
  const allTechniques = await db
    .select()
    .from(techniques)
    .orderBy(techniques.id);

  // Build quiz query with user progress
  let query = db
    .select({
      quiz: quizzes,
      technique: techniques,
      attemptCount: sql<number>`count(distinct ${userQuizAttempts.id})`.as(
        "attempt_count",
      ),
      bestScore: sql<number>`max(${userQuizAttempts.accuracyScore})`.as(
        "best_score",
      ),
      isCompleted: sql<boolean>`max(${userQuizAttempts.isCompleted})`.as(
        "is_completed",
      ),
    })
    .from(quizzes)
    .leftJoin(techniques, eq(quizzes.primaryTechniqueId, techniques.id))
    .leftJoin(
      userQuizAttempts,
      sql`${userQuizAttempts.quizId} = ${quizzes.id} AND ${userQuizAttempts.userId} = ${user.id}`,
    )
    .groupBy(quizzes.id)
    .$dynamic();

  // Apply technique filter if provided
  if (techniqueFilter) {
    query = query.where(eq(quizzes.primaryTechniqueId, techniqueFilter));
  }

  const quizzesWithProgress = await query.orderBy(quizzes.orderIndex);

  return {
    quizzesWithProgress,
    allTechniques,
    selectedTechnique: techniqueFilter,
  };
};
