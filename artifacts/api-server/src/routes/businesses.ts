import { Router } from "express";
import { db, businessesTable, socialLinksTable, qrCodesTable, offersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { generateId } from "../lib/utils";
import { z } from "zod/v4";

const router = Router();

// ─── List user's businesses ───────────────────────────────────────────────────
router.get("/businesses", requireAuth, async (req, res) => {
  try {
    const businesses = await db
      .select()
      .from(businessesTable)
      .where(eq(businessesTable.ownerId, req.user!.id));
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Create business ──────────────────────────────────────────────────────────
const createBusinessSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().max(500).optional(),
  category: z.enum(["restaurant","cafe","retail","barbershop","salon","hotel","gym","clinic","ecommerce","other"]).default("other"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.url().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  googleMapsUrl: z.url().optional(),
  googlePlaceId: z.string().optional(),
  googleReviewUrl: z.url().optional(),
  whatsappNumber: z.string().optional(),
  primaryColor: z.string().default("#16a34a"),
});

router.post("/businesses", requireAuth, async (req, res) => {
  try {
    const data = createBusinessSchema.parse(req.body);

    // Check slug uniqueness
    const existing = await db
      .select({ id: businessesTable.id })
      .from(businessesTable)
      .where(eq(businessesTable.slug, data.slug))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "Slug already taken. Please choose a different one." });
    }

    // Check plan limits (free plan: 1 business)
    if (req.user!.subscriptionPlan === "free") {
      const count = await db
        .select({ id: businessesTable.id })
        .from(businessesTable)
        .where(eq(businessesTable.ownerId, req.user!.id));
      if (count.length >= 1) {
        return res.status(403).json({
          error: "Free plan allows only 1 business. Upgrade to Pro to create more.",
        });
      }
    }

    const id = generateId();
    const [business] = await db
      .insert(businessesTable)
      .values({
        id,
        ownerId: req.user!.id,
        ...data,
      })
      .returning();

    // Auto-create default QR code
    await db.insert(qrCodesTable).values({
      id: generateId(),
      businessId: id,
      label: "Main QR",
      destinationUrl: `${process.env.APP_URL ?? "https://oneqr.app"}/b/${data.slug}`,
    });

    res.status(201).json(business);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: err.issues });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Get business ─────────────────────────────────────────────────────────────
router.get("/businesses/:id", requireAuth, async (req, res) => {
  try {
    const [business] = await db
      .select()
      .from(businessesTable)
      .where(and(
        eq(businessesTable.id, req.params.id),
        eq(businessesTable.ownerId, req.user!.id),
      ))
      .limit(1);

    if (!business) return res.status(404).json({ error: "Business not found" });
    res.json(business);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Update business ──────────────────────────────────────────────────────────
const updateBusinessSchema = createBusinessSchema.partial().omit({ slug: true });

router.patch("/businesses/:id", requireAuth, async (req, res) => {
  try {
    const data = updateBusinessSchema.parse(req.body);

    const [updated] = await db
      .update(businessesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(businessesTable.id, req.params.id),
        eq(businessesTable.ownerId, req.user!.id),
      ))
      .returning();

    if (!updated) return res.status(404).json({ error: "Business not found" });
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: err.issues });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Social Links CRUD ────────────────────────────────────────────────────────
router.get("/businesses/:id/links", requireAuth, async (req, res) => {
  try {
    const [biz] = await db
      .select({ id: businessesTable.id })
      .from(businessesTable)
      .where(and(eq(businessesTable.id, req.params.id), eq(businessesTable.ownerId, req.user!.id)))
      .limit(1);
    if (!biz) return res.status(404).json({ error: "Business not found" });

    const links = await db
      .select()
      .from(socialLinksTable)
      .where(eq(socialLinksTable.businessId, req.params.id));
    res.json(links);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

const createLinkSchema = z.object({
  platform: z.enum(["instagram","facebook","tiktok","twitter","youtube","linkedin","snapchat","pinterest","whatsapp","telegram","website","custom"]),
  label: z.string().max(60).optional(),
  url: z.url(),
  sortOrder: z.number().int().default(0),
});

router.post("/businesses/:id/links", requireAuth, async (req, res) => {
  try {
    const [biz] = await db
      .select({ id: businessesTable.id })
      .from(businessesTable)
      .where(and(eq(businessesTable.id, req.params.id), eq(businessesTable.ownerId, req.user!.id)))
      .limit(1);
    if (!biz) return res.status(404).json({ error: "Business not found" });

    const data = createLinkSchema.parse(req.body);
    const [link] = await db
      .insert(socialLinksTable)
      .values({ id: generateId(), businessId: req.params.id, ...data })
      .returning();

    res.status(201).json(link);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: err.issues });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/businesses/:id/links/:linkId", requireAuth, async (req, res) => {
  try {
    const [biz] = await db
      .select({ id: businessesTable.id })
      .from(businessesTable)
      .where(and(eq(businessesTable.id, req.params.id), eq(businessesTable.ownerId, req.user!.id)))
      .limit(1);
    if (!biz) return res.status(404).json({ error: "Business not found" });

    const data = createLinkSchema.partial().parse(req.body);
    const [updated] = await db
      .update(socialLinksTable)
      .set(data)
      .where(and(
        eq(socialLinksTable.id, req.params.linkId),
        eq(socialLinksTable.businessId, req.params.id),
      ))
      .returning();

    if (!updated) return res.status(404).json({ error: "Link not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/businesses/:id/links/:linkId", requireAuth, async (req, res) => {
  try {
    await db
      .delete(socialLinksTable)
      .where(and(
        eq(socialLinksTable.id, req.params.linkId),
        eq(socialLinksTable.businessId, req.params.id),
      ));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── QR Codes ────────────────────────────────────────────────────────────────
router.get("/businesses/:id/qrcodes", requireAuth, async (req, res) => {
  try {
    const codes = await db
      .select()
      .from(qrCodesTable)
      .where(eq(qrCodesTable.businessId, req.params.id));
    res.json(codes);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Offers ──────────────────────────────────────────────────────────────────
const createOfferSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  emoji: z.string().max(4).default("🎁"),
  expiresAt: z.string().datetime().optional(),
});

router.get("/businesses/:id/offers", requireAuth, async (req, res) => {
  try {
    const offers = await db
      .select()
      .from(offersTable)
      .where(eq(offersTable.businessId, req.params.id));
    res.json(offers);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/businesses/:id/offers", requireAuth, async (req, res) => {
  try {
    const data = createOfferSchema.parse(req.body);
    const [offer] = await db
      .insert(offersTable)
      .values({
        id: generateId(),
        businessId: req.params.id,
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      })
      .returning();
    res.status(201).json(offer);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: err.issues });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/businesses/:id/offers/:offerId", requireAuth, async (req, res) => {
  try {
    await db.delete(offersTable).where(
      and(eq(offersTable.id, req.params.offerId), eq(offersTable.businessId, req.params.id))
    );
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
