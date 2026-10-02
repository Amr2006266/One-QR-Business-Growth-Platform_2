import { Router, type Request, type Response } from "express";
import { randomBytes } from "node:crypto";
import { dbService } from "../../../database/src/db.ts";
import { requireAuth } from "../middlewares/auth.ts";

const router = Router();

// ── List Businesses ─────────────────────────────────────────────────────────
router.get("/businesses", requireAuth, (req: Request, res: Response) => {
  try {
    const businesses = dbService.getBusinessesByOwner(req.user!.id);
    return res.json(businesses);
  } catch (err) {
    console.error("List businesses error:", err);
    return res.status(500).json({ error: "Failed to load businesses." });
  }
});

// ── Create Business ─────────────────────────────────────────────────────────
router.post("/businesses", requireAuth, (req: Request, res: Response) => {
  try {
    const {
      name, slug, description, category, phone, email, website,
      address, city, country, googleMapsUrl, googleReviewUrl,
      whatsappNumber, primaryColor, rating, reviewCount
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: "Business name and slug are required." });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");
    const existing = dbService.getBusinessBySlug(cleanSlug);
    if (existing) {
      return res.status(409).json({ error: "This slug is already taken. Please choose another." });
    }

    const businessId = "biz_" + randomBytes(8).toString("hex");
    const business = dbService.createBusiness({
      id: businessId,
      ownerId: req.user!.id,
      name: name.trim(),
      slug: cleanSlug,
      description: description || null,
      category: category || "cafe",
      primaryColor: primaryColor || "#15803d",
      phone: phone || null,
      email: email || null,
      website: website || null,
      address: address || null,
      city: city || null,
      country: country || null,
      googleMapsUrl: googleMapsUrl || null,
      googleReviewUrl: googleReviewUrl || null,
      whatsappNumber: whatsappNumber || null,
      rating: typeof rating === "number" ? rating : 4.9,
      reviewCount: typeof reviewCount === "number" ? reviewCount : 385,
    });

    // Auto-create default QR code
    const host = req.get("host") || "localhost:5173";
    const appUrl = `${req.protocol}://${host}`;
    dbService.createQRCode({
      id: "qr_" + randomBytes(8).toString("hex"),
      businessId: business.id,
      label: "Main QR Code",
      destinationUrl: `${appUrl}/b/${business.slug}`,
    });

    return res.status(201).json(business);
  } catch (err) {
    console.error("Create business error:", err);
    return res.status(500).json({ error: "Failed to create business." });
  }
});

// ── Get Single Business ─────────────────────────────────────────────────────
router.get("/businesses/:id", requireAuth, (req: Request, res: Response) => {
  try {
    const business = dbService.getBusinessById(req.params.id);
    if (!business || business.ownerId !== req.user!.id) {
      return res.status(404).json({ error: "Business not found." });
    }
    return res.json(business);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load business." });
  }
});

// ── Update Business ─────────────────────────────────────────────────────────
router.put("/businesses/:id", requireAuth, (req: Request, res: Response) => {
  try {
    const business = dbService.getBusinessById(req.params.id);
    if (!business || business.ownerId !== req.user!.id) {
      return res.status(404).json({ error: "Business not found." });
    }

    const updated = dbService.updateBusiness(req.params.id, req.body);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update business." });
  }
});

// ── Social Links ────────────────────────────────────────────────────────────
router.get("/businesses/:id/links", (req: Request, res: Response) => {
  try {
    const links = dbService.getLinksByBusiness(req.params.id);
    return res.json(links);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load links." });
  }
});

router.post("/businesses/:id/links", requireAuth, (req: Request, res: Response) => {
  try {
    const business = dbService.getBusinessById(req.params.id);
    if (!business || business.ownerId !== req.user!.id) {
      return res.status(404).json({ error: "Business not found." });
    }

    const { platform, label, url, displayOrder } = req.body;
    if (!platform || !url) {
      return res.status(400).json({ error: "Platform and URL are required." });
    }

    const link = dbService.createLink({
      id: "lnk_" + randomBytes(8).toString("hex"),
      businessId: business.id,
      platform,
      label: label || null,
      url,
      displayOrder: displayOrder || 0,
    });

    return res.status(201).json(link);
  } catch (err) {
    return res.status(500).json({ error: "Failed to add link." });
  }
});

router.put("/businesses/:id/links/:linkId", requireAuth, (req: Request, res: Response) => {
  try {
    const updated = dbService.updateLink(req.params.linkId, req.body);
    if (!updated) return res.status(404).json({ error: "Link not found." });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update link." });
  }
});

router.delete("/businesses/:id/links/:linkId", requireAuth, (req: Request, res: Response) => {
  try {
    dbService.deleteLink(req.params.linkId);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete link." });
  }
});

// ── Offers & Menu ───────────────────────────────────────────────────────────
router.get("/businesses/:id/offers", (req: Request, res: Response) => {
  try {
    const offers = dbService.getOffersByBusiness(req.params.id);
    return res.json(offers);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load offers." });
  }
});

router.post("/businesses/:id/offers", requireAuth, (req: Request, res: Response) => {
  try {
    const business = dbService.getBusinessById(req.params.id);
    if (!business || business.ownerId !== req.user!.id) {
      return res.status(404).json({ error: "Business not found." });
    }

    const { title, description, price, emoji, tag, expiresAt } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required." });
    }

    const offer = dbService.createOffer({
      id: "off_" + randomBytes(8).toString("hex"),
      businessId: business.id,
      title,
      description: description || null,
      price: price || null,
      emoji: emoji || "🎁",
      tag: tag || null,
      expiresAt: expiresAt || null,
    });

    return res.status(201).json(offer);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create offer." });
  }
});

router.delete("/businesses/:id/offers/:offerId", requireAuth, (req: Request, res: Response) => {
  try {
    dbService.deleteOffer(req.params.offerId);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete offer." });
  }
});

// ── QR Codes ────────────────────────────────────────────────────────────────
router.get("/businesses/:id/qrcodes", requireAuth, (req: Request, res: Response) => {
  try {
    const qrs = dbService.getQRCodesByBusiness(req.params.id);
    return res.json(qrs);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load QR codes." });
  }
});

export default router;
