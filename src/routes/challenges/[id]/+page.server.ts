import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { challenges, techniques, userChallengeAttempts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { id } = params;
	const user = locals.user;

	if (!user) {
		throw error(401, 'Unauthorized');
	}

	// Get the challenge
	const challenge = await db
		.select()
		.from(challenges)
		.where(eq(challenges.id, id))
		.get();

	if (!challenge) {
		throw error(404, 'Challenge not found');
	}

	// Parse techniques array from JSON
	let techniqueIds: string[] = [];
	try {
		techniqueIds = JSON.parse(challenge.techniques);
	} catch {
		techniqueIds = [];
	}

	// Get technique details
	let relatedTechniques = [];
	if (techniqueIds.length > 0) {
		relatedTechniques = await db
			.select()
			.from(techniques)
			.where((t) => techniqueIds.includes(t.id));
	}

	// Get user's attempts for this challenge
	const userAttempts = await db
		.select()
		.from(userChallengeAttempts)
		.where(
			(a) =>
				a.userId === user.id && a.challengeId === id
		);

	// Get the latest attempt
	const latestAttempt = userAttempts.length > 0
		? userAttempts.reduce((latest, current) =>
			current.attemptedAt > latest.attemptedAt ? current : latest
		)
		: null;

	return {
		challenge,
		relatedTechniques,
		latestAttempt,
		allAttempts: userAttempts
	};
};
