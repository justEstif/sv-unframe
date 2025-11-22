import { relations } from "drizzle-orm/relations";
import { user, account, techniques, challenges, session, userChallengeAttempts } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	userChallengeAttempts: many(userChallengeAttempts),
}));

export const challengesRelations = relations(challenges, ({one, many}) => ({
	technique: one(techniques, {
		fields: [challenges.primaryTechnique],
		references: [techniques.id]
	}),
	userChallengeAttempts: many(userChallengeAttempts),
}));

export const techniquesRelations = relations(techniques, ({many}) => ({
	challenges: many(challenges),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userChallengeAttemptsRelations = relations(userChallengeAttempts, ({one}) => ({
	challenge: one(challenges, {
		fields: [userChallengeAttempts.challengeId],
		references: [challenges.id]
	}),
	user: one(user, {
		fields: [userChallengeAttempts.userId],
		references: [user.id]
	}),
}));