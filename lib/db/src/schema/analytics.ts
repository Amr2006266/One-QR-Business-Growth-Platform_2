import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { businessesTable } from "./businesses";

export const analyticsEventTypeEnum = pgEnum("analytics_event_type", [
  "qr_scan",
  "profile_view",
  "link_click",
  "google_maps_click",
  "google_review_click",
  "phone_click",
  "whatsapp_click",
  "offer_view",
  "website_click",
]);

export const analyticsEventsTable = pgTable("analytics_events", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businessesTable.id, { onDelete: "cascade" }),

  eventType: analyticsEventTypeEnum("event_type").notNull(),
  targetId: text("target_id"), // socialLinkId, offerId, etc.
  targetLabel: text("target_label"),

  // Context
  ipHash: text("ip_hash"), // hashed for privacy
  userAgent: text("user_agent"),
  referer: text("referer"),
  country: text("country"),
  city: text("city"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAnalyticsEventSchema = createInsertSchema(
  analyticsEventsTable,
).omit({
  createdAt: true,
});

export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEventsTable.$inferSelect;

// ─── Daily Analytics Summary (for fast dashboard charts) ────────────────────

export const analyticsDailySummaryTable = pgTable("analytics_daily_summary", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businessesTable.id, { onDelete: "cascade" }),

  date: text("date").notNull(), // YYYY-MM-DD
  qrScans: integer("qr_scans").notNull().default(0),
  profileViews: integer("profile_views").notNull().default(0),
  linkClicks: integer("link_clicks").notNull().default(0),
  googleClicks: integer("google_clicks").notNull().default(0),
  reviewClicks: integer("review_clicks").notNull().default(0),
  whatsappClicks: integer("whatsapp_clicks").notNull().default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type AnalyticsDailySummary =
  typeof analyticsDailySummaryTable.$inferSelect;
