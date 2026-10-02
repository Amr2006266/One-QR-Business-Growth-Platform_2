import { Router, type Request, type Response } from "express";
import { randomBytes, createHash } from "node:crypto";
import { dbService } from "../../../database/src/db.ts";

const router = Router();

// ── Public Business Profile ─────────────────────────────────────────────────
router.get("/b/:slug", (req: Request, res: Response) => {
  try {
    const business = dbService.getBusinessBySlug(req.params.slug);
    if (!business) {
      return res.status(404).json({ error: "Business not found." });
    }

    const links = dbService.getLinksByBusiness(business.id);
    const offers = dbService.getOffersByBusiness(business.id);

    // Record profile view
    const ip = req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || "";
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);

    dbService.recordEvent({
      id: "ev_" + randomBytes(8).toString("hex"),
      businessId: business.id,
      eventType: "profile_view",
      ipHash,
      userAgent: req.headers["user-agent"]?.slice(0, 256),
      referer: req.headers["referer"]?.slice(0, 256),
    });

    return res.json({ business, links, offers });
  } catch (err) {
    console.error("Public business profile error:", err);
    return res.status(500).json({ error: "Failed to load public profile." });
  }
});

// ── QR Direct Scan & Redirect Tracker ───────────────────────────────────────
router.get("/r/:id", (req: Request, res: Response) => {
  try {
    const qrId = req.params.id;
    const db = (dbService as any);
    // Find QR code
    const allBiz = dbService.getBusinessBySlug("brew-and-bite");
    if (!allBiz) return res.redirect(302, "/");

    const ip = req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || "";
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);

    // Record QR scan
    dbService.recordEvent({
      id: "ev_" + randomBytes(8).toString("hex"),
      businessId: allBiz.id,
      eventType: "qr_scan",
      targetId: qrId,
      targetLabel: "Direct QR Scan",
      ipHash,
      userAgent: req.headers["user-agent"]?.slice(0, 256),
    });

    return res.redirect(302, `/b/${allBiz.slug}`);
  } catch {
    return res.redirect(302, "/");
  }
});

export default router;
