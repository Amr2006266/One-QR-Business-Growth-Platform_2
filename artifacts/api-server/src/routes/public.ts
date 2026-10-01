import { Router } from "express";
import { db, businessesTable, socialLinksTable, offersTable, qrCodesTable, analyticsEventsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { generateId } from "../lib/utils";
import { createHash } from "crypto";

const router = Router();

// ─── Public business profile (QR destination) ─────────────────────────────────
router.get("/b/:slug", async (req, res) => {
  try {
    const [business] = await db
      .select()
      .from(businessesTable)
      .where(and(
        eq(businessesTable.slug, req.params.slug),
        eq(businessesTable.isActive, true),
      ))
      .limit(1);

    if (!business) return res.status(404).json({ error: "Business not found" });

    const links = await db
      .select()
      .from(socialLinksTable)
      .where(and(
        eq(socialLinksTable.businessId, business.id),
        eq(socialLinksTable.isActive, true),
      ));

    const offers = await db
      .select()
      .from(offersTable)
      .where(and(
        eq(offersTable.businessId, business.id),
        eq(offersTable.isActive, true),
      ));

    // Track profile view
    const ip = req.headers["x-forwarded-for"]?.toString() ?? req.ip ?? "";
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);

    await db.insert(analyticsEventsTable).values({
      id: generateId(),
      businessId: business.id,
      eventType: "profile_view",
      ipHash,
      userAgent: req.headers["user-agent"]?.slice(0, 256),
      referer: req.headers["referer"]?.slice(0, 256),
    });

    res.json({ business, links, offers });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
