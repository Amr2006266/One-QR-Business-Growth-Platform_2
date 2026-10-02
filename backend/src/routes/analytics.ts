import { Router, type Request, type Response } from "express";
import { randomBytes, createHash } from "node:crypto";
import { dbService } from "../../../database/src/db.ts";
import { requireAuth } from "../middlewares/auth.ts";

const router = Router();

// ── Public Analytics Event Tracker ──────────────────────────────────────────
router.post("/analytics/track", (req: Request, res: Response) => {
  try {
    const { businessId, eventType, targetId, targetLabel } = req.body;
    if (!businessId || !eventType) {
      return res.status(400).json({ error: "businessId and eventType are required." });
    }

    const business = dbService.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found." });
    }

    const ip = req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || "";
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);
    const userAgent = req.headers["user-agent"]?.slice(0, 256);
    const referer = req.headers["referer"]?.slice(0, 256);

    dbService.recordEvent({
      id: "ev_" + randomBytes(8).toString("hex"),
      businessId,
      eventType,
      targetId,
      targetLabel,
      ipHash,
      userAgent,
      referer,
    });

    return res.status(204).send();
  } catch (err) {
    console.error("Analytics track error:", err);
    return res.status(500).json({ error: "Failed to record event." });
  }
});

// ── Protected Analytics Dashboard Query ─────────────────────────────────────
router.get("/businesses/:id/analytics", requireAuth, (req: Request, res: Response) => {
  try {
    const business = dbService.getBusinessById(req.params.id);
    if (!business || business.ownerId !== req.user!.id) {
      return res.status(404).json({ error: "Business not found." });
    }

    const days = req.query.period === "30d" ? 30 : req.query.period === "90d" ? 90 : 7;
    const analytics = dbService.getAnalytics(business.id, days);

    return res.json(analytics);
  } catch (err) {
    console.error("Analytics fetch error:", err);
    return res.status(500).json({ error: "Failed to load analytics." });
  }
});

export default router;
