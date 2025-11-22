import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import {
  challenges,
  techniques,
  userChallengeAttempts,
} from "$lib/server/db/schema";
import { sql, eq, gt } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    throw new Error("User not found");
  }

  const challengesByTechnique = await db
    .select({
      technique: techniques,
      challengeCount: sql<number>`count(distinct ${challenges.id})`.as(
        "challenge_count",
      ),
      attemptedCount:
        sql<number>`count(distinct ${userChallengeAttempts.challengeId})`.as(
          "attempted_count",
        ),
    })
    .from(techniques)
    .leftJoin(challenges, eq(challenges.primaryTechnique, techniques.id))
    .leftJoin(
      userChallengeAttempts,
      sql`${userChallengeAttempts.challengeId} = ${challenges.id} AND ${userChallengeAttempts.userId} = ${user.id}`,
    )
    .groupBy(techniques.id)
    .having(gt(sql`count(distinct ${userChallengeAttempts.challengeId})`, 0));

  return {
    challengesByTechnique,
  };
};
