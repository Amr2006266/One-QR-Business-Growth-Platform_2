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
import { usersTable } from "./users";

export const businessCategoryEnum = pgEnum("business_category", [
  "restaurant",
  "cafe",
  "retail",
  "barbershop",
  "salon",
  "hotel",
  "gym",
  "clinic",
  "ecommerce",
  "other",
]);

export const businessesTable = pgTable("businesses", {
  id: text("id").primaryKey(), // UUID
  ownerId: text("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  // Identity
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // used as QR URL: /b/slug
  description: text("description"),
  category: businessCategoryEnum("category").notNull().default("other"),
  logoUrl: text("logo_url"),
  coverImageUrl: text("cover_image_url"),
  primaryColor: text("primary_color").default("#16a34a"), // green-600

  // Contact
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  address: text("address"),
  city: text("city"),
  country: text("country"),

  // Google
  googleMapsUrl: text("google_maps_url"),
  googlePlaceId: text("google_place_id"),
  googleReviewUrl: text("google_review_url"),

  // WhatsApp
  whatsappNumber: text("whatsapp_number"),

  // Visibility
  isActive: boolean("is_active").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),

  // Analytics summary (denormalized for perf)
  totalScans: integer("total_scans").notNull().default(0),
  totalClicks: integer("total_clicks").notNull().default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBusinessSchema = createInsertSchema(businessesTable).omit({
  createdAt: true,
  updatedAt: true,
  totalScans: true,
  totalClicks: true,
});

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businessesTable.$inferSelect;
