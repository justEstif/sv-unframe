import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import {
  userQuizAttempts,
  userChallengeAttempts,
  quizzes,
  challenges,
} from "$lib/server/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }

  const attemptId = params.attemptId;

  // Fetch the quiz attempt
  const attempt = await db.query.userQuizAttempts.findFirst({
    where: and(
      eq(userQuizAttempts.id, attemptId),
      eq(userQuizAttempts.userId, locals.user.id)
    ),
  });

  if (!attempt) {
    throw error(404, "Quiz attempt not found");
  }

  // Fetch the quiz details
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, attempt.quizId),
  });

  if (!quiz) {
    throw error(404, "Quiz not found");
  }

  // Fetch individual challenge attempts
  // Use timestamp correlation since there's no direct foreign key
  const attemptTime = new Date(attempt.attemptedAt);
  const completionTime = attempt.completedAt
    ? new Date(attempt.completedAt)
    : attemptTime;

  // Query challenges within a 10-minute window around the attempt
  const timeWindowStart = new Date(attemptTime.getTime() - 5000); // 5 seconds before
  const timeWindowEnd = new Date(completionTime.getTime() + 5000); // 5 seconds after

  const challengeAttempts = await db
    .select({
      attempt: userChallengeAttempts,
      challenge: challenges,
    })
    .from(userChallengeAttempts)
    .innerJoin(
      challenges,
      eq(userChallengeAttempts.challengeId, challenges.id)
    )
    .where(
      and(
        eq(userChallengeAttempts.userId, locals.user.id),
        gte(userChallengeAttempts.attemptedAt, timeWindowStart),
        lte(userChallengeAttempts.attemptedAt, timeWindowEnd)
      )
    )
    .orderBy(userChallengeAttempts.attemptedAt);

  // Parse JSON fields and structure the data
  const challengeResults = challengeAttempts.map((row) => ({
    challengeId: row.challenge.id,
    title: row.challenge.title,
    contentText: row.challenge.contentText,
    imageUrl: row.challenge.imageUrl,
    historicalContext: row.challenge.historicalContext,
    explanation: row.challenge.explanation,
    primaryTechnique: row.challenge.primaryTechnique,
    correctTechniques: JSON.parse(row.challenge.techniques) as string[],
    selectedTechniques: JSON.parse(row.attempt.selectedTechniques) as string[],
    isCorrect: row.attempt.isCorrect,
    accuracyScore: row.attempt.accuracyScore,
  }));

  return {
    attempt: {
      id: attempt.id,
      quizId: attempt.quizId,
      totalChallenges: attempt.totalChallenges,
      correctAnswers: attempt.correctAnswers,
      accuracyScore: attempt.accuracyScore,
      completedAt: attempt.completedAt,
      attemptedAt: attempt.attemptedAt,
    },
    quiz: {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
    },
    challengeResults,
  };
};
