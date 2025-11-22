import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { challenges, userChallengeAttempts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw new Error('User not found');
	}

	// Get all challenges the user has attempted
	const attempts = await db
		.select({
			challenge: challenges,
			attempt: userChallengeAttempts
		})
		.from(userChallengeAttempts)
		.innerJoin(challenges, eq(userChallengeAttempts.challengeId, challenges.id))
		.where(eq(userChallengeAttempts.userId, user.id));

	// Group by challenge and get the latest attempt for each
	const challengeMap = new Map();
	attempts.forEach(({ challenge, attempt }) => {
		if (!challengeMap.has(challenge.id)) {
			challengeMap.set(challenge.id, { challenge, latestAttempt: attempt });
		} else {
			const existing = challengeMap.get(challenge.id);
			if (attempt.attemptedAt > existing.latestAttempt.attemptedAt) {
				challengeMap.set(challenge.id, { challenge, latestAttempt: attempt });
			}
		}
	});

	// Convert to array and sort alphabetically by title
	const userChallenges = Array.from(challengeMap.values())
		.sort((a, b) => a.challenge.title.localeCompare(b.challenge.title));

	return {
		userChallenges
	};
};
