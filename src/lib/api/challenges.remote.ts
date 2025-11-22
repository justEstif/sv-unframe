import { form, getRequestEvent, query } from "$app/server";
import { db } from "$lib/server/db";
import {
  challenges,
  techniques,
  userChallengeAttempts,
} from "$lib/server/db/schema";
import { redirect, error } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { eq, sql, isNull, and } from "drizzle-orm";
import { z } from "zod";

const answersSchema = z.object({
  answers: z.array(
    z.object({
      challengeId: z.string(),
      selectedTechniques: z.optional(z.array(z.string())),
    }),
  ),
});

export const submitChallenges = form(answersSchema, async ({ answers }) => {
  const { locals } = getRequestEvent();

  if (!locals.user) {
    redirect(303, "/");
  }

  const results = [];

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

    const correctCount = selected.filter((t) =>
      correctTechniques.includes(t),
    ).length;
    const totalCorrect = correctTechniques.length;
    const accuracyScore = totalCorrect > 0 ? correctCount / totalCorrect : 0;

    const isCorrect =
      selected.length === correctTechniques.length &&
      selected.every((t) => correctTechniques.includes(t));

    await db.insert(userChallengeAttempts).values({
      id: randomUUID(),
      userId: locals.user.id,
      challengeId,
      selectedTechniques: JSON.stringify(selected),
      correctTechniques: JSON.stringify(correctTechniques),
      isCorrect,
      accuracyScore,
      attemptedAt: new Date(),
    });

    results.push({
      challengeId,
      selected,
      correct: correctTechniques,
      isCorrect,
      accuracyScore,
    });
  }

  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalScore = (correctCount / results.length) * 100;

  return {
    success: true,
    results,
    score: totalScore,
    correctCount,
    totalChallenges: results.length,
  };
});

export const getTechnique = query(z.string(), async (techniqueId) => {
  const { locals } = getRequestEvent();

  if (!locals.user) {
    redirect(303, "/");
  }

  const [technique] = await db
    .select()
    .from(techniques)
    .where(eq(techniques.id, techniqueId))
    .limit(1);

  if (!technique) {
    error(404, "Technique not found");
  }

  return technique;
});

// Query for all techniques (for the checkbox options)
export const getAllTechniques = query(async () => {
  const { locals } = getRequestEvent();

  if (!locals.user) {
    redirect(303, "/");
  }

  return db
    .select({ id: techniques.id, name: techniques.name })
    .from(techniques);
});

// Query for random unattempted challenges
export const getQuizChallenges = query(z.string(), async (techniqueId) => {
  const { locals } = getRequestEvent();

  if (!locals.user) {
    redirect(303, "/");
  }

  const unattemptedChallenges = await db
    .select({ challenge: challenges })
    .from(challenges)
    .leftJoin(
      userChallengeAttempts,
      sql`${userChallengeAttempts.challengeId} = ${challenges.id} AND ${userChallengeAttempts.userId} = ${locals.user.id}`,
    )
    .where(
      and(
        eq(challenges.primaryTechnique, techniqueId),
        isNull(userChallengeAttempts.id),
      ),
    );

  const quizChallenges = unattemptedChallenges
    .map((row) => row.challenge)
    .sort(() => Math.random() - 0.5)
    .slice(0, 10);

  return {
    challenges: quizChallenges,
    totalUnattempted: unattemptedChallenges.length,
  };
});
