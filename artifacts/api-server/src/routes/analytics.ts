import { Router } from "express";
import { db, analyticsEventsTable, analyticsDailySummaryTable, businessesTable, socialLinksTable } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { generateId } from "../lib/utils";
import { createHash } from "crypto";
import { z } from "zod/v4";

const router = Router();

// ─── Track event (public endpoint) ────────────────────────────────────────────
const trackSchema = z.object({
  businessId: z.string(),
  eventType: z.enum([
    "qr_scan", "profile_view", "link_click", "google_maps_click",
    "google_review_click", "phone_click", "whatsapp_click", "offer_view", "website_click",
  ]),
  targetId: z.string().optional(),
  targetLabel: z.string().optional(),
});

router.post("/analytics/track", async (req, res) => {
  try {
    const data = trackSchema.parse(req.body);

    // Check business exists
    const [biz] = await db
      .select({ id: businessesTable.id })
      .from(businessesTable)
      .where(eq(businessesTable.id, data.businessId))
      .limit(1);
    if (!biz) return res.status(404).json({ error: "Business not found" });

    const ip = req.headers["x-forwarded-for"]?.toString() ?? req.ip ?? "";
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);

    await db.insert(analyticsEventsTable).values({
      id: generateId(),
      businessId: data.businessId,
      eventType: data.eventType,
      targetId: data.targetId,
      targetLabel: data.targetLabel,
      ipHash,
      userAgent: req.headers["user-agent"]?.slice(0, 256),
      referer: req.headers["referer"]?.slice(0, 256),
    });

    // Increment link clicks counter if it's a link_click
    if (data.eventType === "link_click" && data.targetId) {
      await db
        .update(socialLinksTable)
        .set({ clicks: sql`${socialLinksTable.clicks} + 1` })
        .where(eq(socialLinksTable.id, data.targetId));
    }

    // Increment business totals
    if (data.eventType === "qr_scan") {
      await db
        .update(businessesTable)
        .set({ totalScans: sql`${businessesTable.totalScans} + 1` })
        .where(eq(businessesTable.id, data.businessId));
    } else if (["link_click", "google_maps_click", "google_review_click", "website_click"].includes(data.eventType)) {
      await db
        .update(businessesTable)
        .set({ totalClicks: sql`${businessesTable.totalClicks} + 1` })
        .where(eq(businessesTable.id, data.businessId));
    }

    res.status(204).send();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: err.issues });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Get analytics dashboard data ─────────────────────────────────────────────
router.get("/businesses/:id/analytics", requireAuth, async (req, res) => {
  try {
    // Verify ownership
    const [biz] = await db
      .select({ id: businessesTable.id, totalScans: businessesTable.totalScans, totalClicks: businessesTable.totalClicks })
      .from(businessesTable)
      .where(and(eq(businessesTable.id, req.params.id), eq(businessesTable.ownerId, req.user!.id)))
      .limit(1);
    if (!biz) return res.status(404).json({ error: "Business not found" });

    const periodDays = req.query.period === "30d" ? 30 : req.query.period === "90d" ? 90 : 7;
    const since = new Date();
    since.setDate(since.getDate() - periodDays);

    // Get events in period
    const events = await db
      .select()
      .from(analyticsEventsTable)
      .where(and(
        eq(analyticsEventsTable.businessId, req.params.id),
        gte(analyticsEventsTable.createdAt, since),
      ));

    // Aggregate daily stats
    const dailyMap: Record<string, { qrScans: number; profileViews: number; linkClicks: number }> = {};
    for (const event of events) {
      const day = event.createdAt.toISOString().split("T")[0];
      if (!dailyMap[day]) dailyMap[day] = { qrScans: 0, profileViews: 0, linkClicks: 0 };
      if (event.eventType === "qr_scan") dailyMap[day].qrScans++;
      if (event.eventType === "profile_view") dailyMap[day].profileViews++;
      if (["link_click", "google_maps_click", "google_review_click", "website_click"].includes(event.eventType)) {
        dailyMap[day].linkClicks++;
      }
    }

    const daily = Object.entries(dailyMap)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top links breakdown
    const linkClickEvents = events.filter((e) => e.eventType === "link_click" && e.targetLabel);
    const linkMap: Record<string, number> = {};
    for (const event of linkClickEvents) {
      const label = event.targetLabel ?? "unknown";
      linkMap[label] = (linkMap[label] ?? 0) + 1;
    }
    const totalLinkClicks = linkClickEvents.length;
    const topLinks = Object.entries(linkMap)
      .map(([platform, clicks]) => ({
        platform,
        clicks,
        percentage: totalLinkClicks > 0 ? Math.round((clicks / totalLinkClicks) * 100) : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    const reviewClicks = events.filter((e) => e.eventType === "google_review_click").length;

    res.json({
      totalScans: biz.totalScans,
      totalClicks: biz.totalClicks,
      totalReviewClicks: reviewClicks,
      daily,
      topLinks,
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
