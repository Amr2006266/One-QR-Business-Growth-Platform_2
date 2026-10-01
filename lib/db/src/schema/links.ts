import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { businessesTable } from "./businesses";

export const socialPlatformEnum = pgEnum("social_platform", [
  "instagram",
  "facebook",
  "tiktok",
  "twitter",
  "youtube",
  "linkedin",
  "snapchat",
  "pinterest",
  "whatsapp",
  "telegram",
  "website",
  "custom",
]);

export const socialLinksTable = pgTable("social_links", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businessesTable.id, { onDelete: "cascade" }),

  platform: socialPlatformEnum("platform").notNull(),
  label: text("label"), // custom label
  url: text("url").notNull(),
  iconUrl: text("icon_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),

  clicks: integer("clicks").notNull().default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSocialLinkSchema = createInsertSchema(
  socialLinksTable,
).omit({
  createdAt: true,
  clicks: true,
});

export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type SocialLink = typeof socialLinksTable.$inferSelect;

// ─── QR Codes ────────────────────────────────────────────────────────────────

export const qrCodesTable = pgTable("qr_codes", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businessesTable.id, { onDelete: "cascade" }),

  label: text("label").notNull().default("Main QR"),
  destinationUrl: text("destination_url").notNull(),
  qrImageUrl: text("qr_image_url"), // cached QR PNG
  isActive: boolean("is_active").notNull().default(true),

  scans: integer("scans").notNull().default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertQrCodeSchema = createInsertSchema(qrCodesTable).omit({
  createdAt: true,
  updatedAt: true,
  scans: true,
});

export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;
export type QrCode = typeof qrCodesTable.$inferSelect;

// ─── Offers ──────────────────────────────────────────────────────────────────

export const offersTable = pgTable("offers", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businessesTable.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  description: text("description"),
  emoji: text("emoji").default("🎁"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),

  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offersTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offersTable.$inferSelect;
