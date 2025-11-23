import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { quizzes, techniques, userQuizAttempts } from "$lib/server/db/schema";
import { eq, sql, and } from "drizzle-orm";

type StatusFilter = "not-started" | "in-progress" | "completed";
type DifficultyFilter = "beginner" | "intermediate" | "advanced";

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = locals.user;
  if (!user) {
    throw new Error("User not found");
  }

  // Get filters from query params
  const techniqueFilter = url.searchParams.get("technique");
  const difficultyFilter = url.searchParams.get("difficulty") as DifficultyFilter | null;
  const statusFilter = url.searchParams.get("status") as StatusFilter | null;

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

  // Apply filters
  const conditions = [];

  // Technique filter
  if (techniqueFilter) {
    conditions.push(eq(quizzes.primaryTechniqueId, techniqueFilter));
  }

  // Difficulty filter
  if (difficultyFilter) {
    conditions.push(eq(quizzes.difficulty, difficultyFilter));
  }

  // Status filter (requires post-query filtering based on calculated status)
  // We'll apply this after fetching

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  let quizzesWithProgress = await query.orderBy(quizzes.orderIndex);

  // Apply status filter post-query
  if (statusFilter) {
    quizzesWithProgress = quizzesWithProgress.filter(({ attemptCount, isCompleted }) => {
      if (statusFilter === "not-started") return attemptCount === 0;
      if (statusFilter === "in-progress") return attemptCount > 0 && !isCompleted;
      if (statusFilter === "completed") return isCompleted;
      return true;
    });
  }

  return {
    quizzesWithProgress,
    allTechniques,
    selectedTechnique: techniqueFilter,
    selectedDifficulty: difficultyFilter,
    selectedStatus: statusFilter,
  };
};
