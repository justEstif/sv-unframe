import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { challenges, userChallengeAttempts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw new Error('User not found');
	}

	// Get all challenges
	const allChallenges = await db
		.select()
		.from(challenges)
		.orderBy(challenges.title);

	// Get user's attempts for these challenges
	const userAttempts = await db
		.select()
		.from(userChallengeAttempts)
		.where(eq(userChallengeAttempts.userId, user.id));

	// Create a map of challenge attempts for quick lookup
	const attemptsMap = new Map();
	userAttempts.forEach((attempt) => {
		if (!attemptsMap.has(attempt.challengeId)) {
			attemptsMap.set(attempt.challengeId, attempt);
		} else {
			// Keep only the latest attempt
			const existing = attemptsMap.get(attempt.challengeId);
			if (attempt.attemptedAt > existing.attemptedAt) {
				attemptsMap.set(attempt.challengeId, attempt);
			}
		}
	});

	// Combine challenges with their attempt data (if any)
	const challengesWithAttempts = allChallenges.map((challenge) => ({
		challenge,
		latestAttempt: attemptsMap.get(challenge.id)
	}));

	return {
		challengesWithAttempts
	};
};
