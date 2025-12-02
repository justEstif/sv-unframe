import { form, getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import {
  challenges,
  quizChallenges,
  userChallengeAttempts,
  userQuizAttempts,
} from "$lib/server/db/schema";
import { error, redirect } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";

const answerSchema = z.object({
  answers: z
    .string()
    .transform((str) => JSON.parse(str))
    .pipe(z.record(z.string(), z.array(z.string()))),
});

export const submitAnswer = form(answerSchema, async ({ answers }) => {
  const { params, locals } = getRequestEvent();

  if (!locals.user) {
    throw redirect(302, "/");
  }

  const quizId = params.id;
  const userId = locals.user.id;

  if (!quizId) {
    throw error(404, "Quiz not found");
  }

  // Use a transaction for atomicity
  const attemptId = randomUUID();
  await db.transaction(async (tx) => {
    // Verify quiz exists and get challenge count
    const quizChallengesList = await tx.query.quizChallenges.findMany({
      where: eq(quizChallenges.quizId, quizId),
    });

    if (quizChallengesList.length === 0) {
      throw error(404, "Quiz not found");
    }

    let correctCount = 0;
    const totalChallenges = Object.keys(answers).length;

    for (const [challengeId, userAnswer] of Object.entries(answers)) {
      const challenge = await tx.query.challenges.findFirst({
        where: eq(challenges.id, challengeId),
      });

      if (!challenge) {
        throw error(404, `Challenge ${challengeId} not found`);
      }

      // Parse the stored techniques JSON array
      const correctTechniques: string[] = JSON.parse(challenge.techniques);

      const userSet = new Set(userAnswer);
      const correctSet = new Set(correctTechniques);

      // Calculate accuracy: intersection / union (Jaccard similarity)
      const intersectionSize = userSet.intersection(correctSet).size;
      const unionSize = userSet.union(correctSet).size;
      const accuracyScore = unionSize > 0 ? intersectionSize / unionSize : 0;

      // Consider correct if primary technique is selected
      const isCorrect =
        userAnswer.includes(challenge.primaryTechnique) && accuracyScore >= 0.5;

      if (isCorrect) {
        correctCount++;
      }

      // Insert individual challenge attempt
      await tx.insert(userChallengeAttempts).values({
        id: randomUUID(),
        userId,
        challengeId,
        selectedTechniques: JSON.stringify(userAnswer),
        correctTechniques: challenge.techniques,
        isCorrect,
        accuracyScore,
        attemptedAt: new Date(),
      });
    }

    // Calculate overall quiz score
    const quizAccuracy =
      totalChallenges > 0 ? correctCount / totalChallenges : 0;

    // Insert or update quiz attempt
    await tx.insert(userQuizAttempts).values({
      id: attemptId,
      userId,
      quizId,
      totalChallenges,
      correctAnswers: correctCount,
      accuracyScore: quizAccuracy,
      isCompleted: true,
      completedAt: new Date(),
      attemptedAt: new Date(),
    });

    return attemptId;
  });

  redirect(302, `/results/${attemptId}`);
});
