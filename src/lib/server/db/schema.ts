import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import type { InferSelectModel } from "drizzle-orm";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
};

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  ...timestamps,
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp_ms",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp_ms",
  }),
  scope: text("scope"),
  password: text("password"),
  ...timestamps,
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  ...timestamps,
});

export const techniques = sqliteTable("techniques", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  exampleText: text("example_text").notNull(),
  ...timestamps,
});

export const challenges = sqliteTable("challenges", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  contentText: text("content_text").notNull(),
  imageUrl: text("image_url"),
  historicalContext: text("historical_context").notNull(),
  difficulty: text("difficulty").notNull(),
  primaryTechnique: text("primary_technique")
    .notNull()
    .references(() => techniques.id, { onDelete: "restrict" }),
  techniques: text("techniques").notNull(), // JSON array of technique IDs
  explanation: text("explanation").notNull(),
  ...timestamps,
});

export const quizzes = sqliteTable("quizzes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  primaryTechniqueId: text("primary_technique_id")
    .notNull()
    .references(() => techniques.id, { onDelete: "restrict" }),
  techniqueIds: text("technique_ids").notNull(), // JSON array of technique IDs
  difficulty: text("difficulty").notNull(),
  orderIndex: integer("order_index").notNull(),
  ...timestamps,
});

export const quizChallenges = sqliteTable("quiz_challenges", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  challengeId: text("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  ...timestamps,
});

export const userChallengeAttempts = sqliteTable("user_challenge_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  challengeId: text("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  selectedTechniques: text("selected_techniques").notNull(), // JSON array
  correctTechniques: text("correct_techniques").notNull(), // JSON array
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  accuracyScore: real("accuracy_score").notNull(),
  attemptedAt: integer("attempted_at", { mode: "timestamp_ms" }).notNull(),
  ...timestamps,
});

export const userQuizAttempts = sqliteTable("user_quiz_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  quizId: text("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  totalChallenges: integer("total_challenges").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  accuracyScore: real("accuracy_score").notNull(),
  isCompleted: integer("is_completed", { mode: "boolean" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  attemptedAt: integer("attempted_at", { mode: "timestamp_ms" }).notNull(),
  ...timestamps,
});

// Type exports
export type User = InferSelectModel<typeof user>;
export type Session = InferSelectModel<typeof session>;
export type Account = InferSelectModel<typeof account>;
export type Verification = InferSelectModel<typeof verification>;
export type Technique = InferSelectModel<typeof techniques>;
export type Challenge = InferSelectModel<typeof challenges>;
export type Quiz = InferSelectModel<typeof quizzes>;
export type QuizChallenge = InferSelectModel<typeof quizChallenges>;
export type UserChallengeAttempt = InferSelectModel<
  typeof userChallengeAttempts
>;
export type UserQuizAttempt = InferSelectModel<typeof userQuizAttempts>;
