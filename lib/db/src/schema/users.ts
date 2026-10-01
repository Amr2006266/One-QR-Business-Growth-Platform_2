import { pgTable, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "free",
  "pro",
  "business",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "expired",
  "cancelled",
  "trial",
]);

export const authProviderEnum = pgEnum("auth_provider", [
  "google",
  "apple",
  "email",
]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(), // UUID from auth provider
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash"),
  authProvider: authProviderEnum("auth_provider").notNull().default("email"),
  authProviderId: text("auth_provider_id"), // Google/Apple sub ID

  // Subscription
  subscriptionPlan: subscriptionPlanEnum("subscription_plan")
    .notNull()
    .default("free"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status")
    .notNull()
    .default("active"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),

  // Admin
  isAdmin: boolean("is_admin").notNull().default(false),
  isSuspended: boolean("is_suspended").notNull().default(false),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at"),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
