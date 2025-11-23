import { form, getRequestEvent, query } from "$app/server";
import { db } from "$lib/server/db";
import {
  quizzes,
  quizChallenges,
  challenges,
  techniques,
  userQuizAttempts,
} from "$lib/server/db/schema";
import { redirect, error } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Schema for submitting quiz answers
const quizAnswersSchema = z.object({
  quizId: z.string(),
  answers: z.array(
    z.object({
      challengeId: z.string(),
      selectedTechniques: z.optional(z.array(z.string())),
    }),
  ),
});

/**
 * Get quiz details with all associated challenges in order
 */
export const getQuizWithChallenges = query(z.string(), async (quizId) => {
  const { locals } = getRequestEvent();

  if (!locals.user) {
    redirect(303, "/");
  }

  // Fetch quiz
  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!quiz) {
    error(404, "Quiz not found");
  }

  // Fetch challenges for this quiz in order
  const quizChallengeRows = await db
    .select({
      challenge: challenges,
      orderIndex: quizChallenges.orderIndex,
    })
    .from(quizChallenges)
    .leftJoin(challenges, eq(quizChallenges.challengeId, challenges.id))
    .where(eq(quizChallenges.quizId, quizId))
    .orderBy(quizChallenges.orderIndex);

  const orderedChallenges = quizChallengeRows.map((row) => row.challenge);

  // Fetch all techniques for the selection checkboxes
  const allTechniques = await db
    .select({ id: techniques.id, name: techniques.name })
    .from(techniques);

  return {
    quiz,
    challenges: orderedChallenges,
    totalChallenges: orderedChallenges.length,
    allTechniques,
  };
});

/**
 * Submit quiz answers and store results
 */
export const submitQuiz = form(
  quizAnswersSchema,
  async ({ quizId, answers }) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
      redirect(303, "/");
    }

    const results = [];
    let correctCount = 0;

    // Process each challenge answer
    for (const answer of answers) {
      const { challengeId, selectedTechniques } = answer;

      const [challenge] = await db
        .select()
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

      if (!challenge) {
        error(404, `Challenge ${challengeId} not found`);
      }

      const correctTechniques: string[] = JSON.parse(challenge.techniques);
      const selected = selectedTechniques || [];

      const correctMatches = selected.filter((t) =>
        correctTechniques.includes(t),
      ).length;
      const totalCorrect = correctTechniques.length;
      const accuracyScore =
        totalCorrect > 0 ? correctMatches / totalCorrect : 0;

      const isCorrect =
        selected.length === correctTechniques.length &&
        selected.every((t) => correctTechniques.includes(t));

      if (isCorrect) {
        correctCount++;
      }

      results.push({
        challengeId,
        selected,
        correct: correctTechniques,
        isCorrect,
        accuracyScore,
      });
    }

    const overallAccuracy =
      answers.length > 0 ? correctCount / answers.length : 0;

    // Store quiz attempt
    await db.insert(userQuizAttempts).values({
      id: randomUUID(),
      userId: locals.user.id,
      quizId,
      totalChallenges: answers.length,
      correctAnswers: correctCount,
      accuracyScore: overallAccuracy,
      isCompleted: true,
      completedAt: new Date(),
      attemptedAt: new Date(),
    });

    return {
      success: true,
      results,
      score: overallAccuracy * 100,
      correctCount,
      totalChallenges: answers.length,
    };
  },
);
