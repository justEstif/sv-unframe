import { sqliteTable, AnySQLiteColumn, foreignKey, text, integer, uniqueIndex, real } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const account = sqliteTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at"),
	refreshTokenExpiresAt: integer("refresh_token_expires_at"),
	scope: text(),
	password: text(),
	createdAt: integer("created_at").default(sql`(current_timestamp)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(current_timestamp)`).notNull(),
});

export const challenges = sqliteTable("challenges", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	contentText: text("content_text").notNull(),
	imageUrl: text("image_url"),
	historicalContext: text("historical_context").notNull(),
	difficulty: text().notNull(),
	primaryTechnique: text("primary_technique").notNull().references(() => techniques.id, { onDelete: "restrict" } ),
	techniques: text().notNull(),
	explanation: text().notNull(),
	createdAt: integer("created_at").default(sql`(current_timestamp)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(current_timestamp)`).notNull(),
});

export const session = sqliteTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: integer("expires_at").notNull(),
	token: text().notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	createdAt: integer("created_at").default(sql`(current_timestamp)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(current_timestamp)`).notNull(),
},
(table) => [
	uniqueIndex("session_token_unique").on(table.token),
]);

export const techniques = sqliteTable("techniques", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	exampleText: text("example_text").notNull(),
	category: text().notNull(),
	createdAt: integer("created_at").default(sql`(current_timestamp)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(current_timestamp)`).notNull(),
});

export const user = sqliteTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: integer("email_verified").default(false).notNull(),
	image: text(),
	createdAt: integer("created_at").default(sql`(current_timestamp)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(current_timestamp)`).notNull(),
},
(table) => [
	uniqueIndex("user_email_unique").on(table.email),
]);

export const userChallengeAttempts = sqliteTable("user_challenge_attempts", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	challengeId: text("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" } ),
	selectedTechniques: text("selected_techniques").notNull(),
	correctTechniques: text("correct_techniques").notNull(),
	isCorrect: integer("is_correct").notNull(),
	accuracyScore: real("accuracy_score").notNull(),
	attemptedAt: integer("attempted_at").notNull(),
	createdAt: integer("created_at").default(sql`(current_timestamp)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(current_timestamp)`).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: integer("expires_at").notNull(),
	createdAt: integer("created_at").default(sql`(current_timestamp)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(current_timestamp)`).notNull(),
});

