import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import type { User, Business, SocialLink, Offer, QRCode, AnalyticsEvent } from "./schema.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB file stored at database/oneqr.db
const dbDir = path.resolve(__dirname, "..");
const dbPath = process.env.SQLITE_DB_PATH || path.join(dbDir, "oneqr.db");

let sqliteDb: DatabaseSync | null = null;

function getSqlite(): DatabaseSync {
  if (!sqliteDb) {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    sqliteDb = new DatabaseSync(dbPath);
    initTables(sqliteDb);
  }
  return sqliteDb;
}

function initTables(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatarUrl TEXT,
      passwordHash TEXT,
      authProvider TEXT NOT NULL DEFAULT 'email',
      authProviderId TEXT,
      subscriptionPlan TEXT NOT NULL DEFAULT 'free',
      subscriptionStatus TEXT NOT NULL DEFAULT 'active',
      isAdmin INTEGER NOT NULL DEFAULT 0,
      isSuspended INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      ownerId TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'cafe',
      logoUrl TEXT,
      coverImageUrl TEXT,
      primaryColor TEXT NOT NULL DEFAULT '#16a34a',
      phone TEXT,
      email TEXT,
      website TEXT,
      address TEXT,
      city TEXT,
      country TEXT,
      googleMapsUrl TEXT,
      googlePlaceId TEXT,
      googleReviewUrl TEXT,
      rating REAL NOT NULL DEFAULT 4.9,
      reviewCount INTEGER NOT NULL DEFAULT 385,
      whatsappNumber TEXT,
      totalScans INTEGER NOT NULL DEFAULT 0,
      totalClicks INTEGER NOT NULL DEFAULT 0,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id TEXT PRIMARY KEY,
      businessId TEXT NOT NULL,
      platform TEXT NOT NULL,
      label TEXT,
      url TEXT NOT NULL,
      displayOrder INTEGER NOT NULL DEFAULT 0,
      clicks INTEGER NOT NULL DEFAULT 0,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (businessId) REFERENCES businesses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      businessId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      price TEXT,
      emoji TEXT NOT NULL DEFAULT '🎁',
      tag TEXT,
      expiresAt TEXT,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (businessId) REFERENCES businesses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS qr_codes (
      id TEXT PRIMARY KEY,
      businessId TEXT NOT NULL,
      label TEXT NOT NULL DEFAULT 'Main QR',
      destinationUrl TEXT NOT NULL,
      scans INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (businessId) REFERENCES businesses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      businessId TEXT NOT NULL,
      eventType TEXT NOT NULL,
      targetId TEXT,
      targetLabel TEXT,
      ipHash TEXT,
      userAgent TEXT,
      referer TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (businessId) REFERENCES businesses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
    CREATE INDEX IF NOT EXISTS idx_analytics_biz_event ON analytics_events(businessId, eventType);
    CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(createdAt);
  `);
}

// Ensure database is initialized immediately
getSqlite();

// ── Database Operations ─────────────────────────────────────────────────────

export const dbService = {
  // Users
  getUserById(id: string): User | null {
    const db = getSqlite();
    const stmt = db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
    const row = stmt.get(id) as any;
    if (!row) return null;
    return { ...row, isAdmin: Boolean(row.isAdmin), isSuspended: Boolean(row.isSuspended) };
  },

  getUserByEmail(email: string): User | null {
    const db = getSqlite();
    const stmt = db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1");
    const row = stmt.get(email) as any;
    if (!row) return null;
    return { ...row, isAdmin: Boolean(row.isAdmin), isSuspended: Boolean(row.isSuspended) };
  },

  getUserByProvider(provider: string, providerId: string): User | null {
    const db = getSqlite();
    const stmt = db.prepare("SELECT * FROM users WHERE authProvider = ? AND authProviderId = ? LIMIT 1");
    const row = stmt.get(provider, providerId) as any;
    if (!row) return null;
    return { ...row, isAdmin: Boolean(row.isAdmin), isSuspended: Boolean(row.isSuspended) };
  },

  createUser(user: Omit<User, "createdAt" | "updatedAt"> & { createdAt?: string; updatedAt?: string }): User {
    const db = getSqlite();
    const now = new Date().toISOString();
    const record: User = {
      ...user,
      isAdmin: user.isAdmin ?? false,
      isSuspended: user.isSuspended ?? false,
      subscriptionPlan: user.subscriptionPlan ?? "pro",
      subscriptionStatus: user.subscriptionStatus ?? "active",
      createdAt: user.createdAt || now,
      updatedAt: user.updatedAt || now,
    };

    const stmt = db.prepare(`
      INSERT INTO users (id, email, name, avatarUrl, passwordHash, authProvider, authProviderId, subscriptionPlan, subscriptionStatus, isAdmin, isSuspended, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id,
      record.email.toLowerCase().trim(),
      record.name,
      record.avatarUrl || null,
      record.passwordHash || null,
      record.authProvider,
      record.authProviderId || null,
      record.subscriptionPlan,
      record.subscriptionStatus,
      record.isAdmin ? 1 : 0,
      record.isSuspended ? 1 : 0,
      record.createdAt,
      record.updatedAt
    );

    return record;
  },

  // Businesses
  getBusinessesByOwner(ownerId: string): Business[] {
    const db = getSqlite();
    const stmt = db.prepare("SELECT * FROM businesses WHERE ownerId = ? ORDER BY createdAt DESC");
    const rows = stmt.all(ownerId) as any[];
    return rows.map((r) => ({ ...r, isActive: Boolean(r.isActive) }));
  },

  getBusinessById(id: string): Business | null {
    const db = getSqlite();
    const stmt = db.prepare("SELECT * FROM businesses WHERE id = ? LIMIT 1");
    const row = stmt.get(id) as any;
    if (!row) return null;
    return { ...row, isActive: Boolean(row.isActive) };
  },

  getBusinessBySlug(slug: string): Business | null {
    const db = getSqlite();
    const stmt = db.prepare("SELECT * FROM businesses WHERE slug = ? AND isActive = 1 LIMIT 1");
    const row = stmt.get(slug) as any;
    if (!row) return null;
    return { ...row, isActive: Boolean(row.isActive) };
  },

  createBusiness(business: Omit<Business, "totalScans" | "totalClicks" | "isActive" | "createdAt" | "updatedAt"> & Partial<Business>): Business {
    const db = getSqlite();
    const now = new Date().toISOString();
    const record: Business = {
      ...business,
      rating: business.rating ?? 4.9,
      reviewCount: business.reviewCount ?? 385,
      totalScans: business.totalScans ?? 0,
      totalClicks: business.totalClicks ?? 0,
      isActive: business.isActive ?? true,
      createdAt: business.createdAt || now,
      updatedAt: business.updatedAt || now,
    };

    const stmt = db.prepare(`
      INSERT INTO businesses (
        id, ownerId, name, slug, description, category, logoUrl, coverImageUrl, primaryColor,
        phone, email, website, address, city, country, googleMapsUrl, googlePlaceId, googleReviewUrl,
        rating, reviewCount, whatsappNumber, totalScans, totalClicks, isActive, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id, record.ownerId, record.name, record.slug, record.description || null, record.category,
      record.logoUrl || null, record.coverImageUrl || null, record.primaryColor,
      record.phone || null, record.email || null, record.website || null,
      record.address || null, record.city || null, record.country || null,
      record.googleMapsUrl || null, record.googlePlaceId || null, record.googleReviewUrl || null,
      record.rating, record.reviewCount, record.whatsappNumber || null,
      record.totalScans, record.totalClicks, record.isActive ? 1 : 0, record.createdAt, record.updatedAt
    );

    return record;
  },

  updateBusiness(id: string, updates: Partial<Business>): Business | null {
    const current = this.getBusinessById(id);
    if (!current) return null;
    const db = getSqlite();
    const updated: Business = { ...current, ...updates, updatedAt: new Date().toISOString() };

    const stmt = db.prepare(`
      UPDATE businesses SET
        name = ?, slug = ?, description = ?, category = ?, logoUrl = ?, coverImageUrl = ?, primaryColor = ?,
        phone = ?, email = ?, website = ?, address = ?, city = ?, country = ?,
        googleMapsUrl = ?, googlePlaceId = ?, googleReviewUrl = ?, rating = ?, reviewCount = ?,
        whatsappNumber = ?, totalScans = ?, totalClicks = ?, isActive = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.name, updated.slug, updated.description || null, updated.category,
      updated.logoUrl || null, updated.coverImageUrl || null, updated.primaryColor,
      updated.phone || null, updated.email || null, updated.website || null,
      updated.address || null, updated.city || null, updated.country || null,
      updated.googleMapsUrl || null, updated.googlePlaceId || null, updated.googleReviewUrl || null,
      updated.rating, updated.reviewCount, updated.whatsappNumber || null,
      updated.totalScans, updated.totalClicks, updated.isActive ? 1 : 0, updated.updatedAt,
      id
    );

    return updated;
  },

  incrementBusinessTotals(id: string, type: "scan" | "click") {
    const db = getSqlite();
    if (type === "scan") {
      db.prepare("UPDATE businesses SET totalScans = totalScans + 1 WHERE id = ?").run(id);
    } else {
      db.prepare("UPDATE businesses SET totalClicks = totalClicks + 1 WHERE id = ?").run(id);
    }
  },

  // Social Links
  getLinksByBusiness(businessId: string): SocialLink[] {
    const db = getSqlite();
    const stmt = db.prepare("SELECT * FROM social_links WHERE businessId = ? ORDER BY displayOrder ASC, createdAt ASC");
    const rows = stmt.all(businessId) as any[];
    return rows.map((r) => ({ ...r, isActive: Boolean(r.isActive) }));
  },

  createLink(link: Omit<SocialLink, "clicks" | "isActive" | "createdAt"> & Partial<SocialLink>): SocialLink {
    const db = getSqlite();
    const record: SocialLink = {
      ...link,
      displayOrder: link.displayOrder ?? 0,
      clicks: link.clicks ?? 0,
      isActive: link.isActive ?? true,
      createdAt: link.createdAt || new Date().toISOString(),
    };

    const stmt = db.prepare(`
      INSERT INTO social_links (id, businessId, platform, label, url, displayOrder, clicks, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id, record.businessId, record.platform, record.label || null, record.url,
      record.displayOrder, record.clicks, record.isActive ? 1 : 0, record.createdAt
    );

    return record;
  },

  updateLink(id: string, updates: Partial<SocialLink>): SocialLink | null {
    const db = getSqlite();
    const current = db.prepare("SELECT * FROM social_links WHERE id = ?").get(id) as any;
    if (!current) return null;
    const updated = { ...current, ...updates };

    db.prepare(`
      UPDATE social_links SET
        platform = ?, label = ?, url = ?, displayOrder = ?, clicks = ?, isActive = ?
      WHERE id = ?
    `).run(
      updated.platform, updated.label || null, updated.url, updated.displayOrder,
      updated.clicks, updated.isActive ? 1 : 0, id
    );

    return { ...updated, isActive: Boolean(updated.isActive) };
  },

  incrementLinkClicks(id: string) {
    const db = getSqlite();
    db.prepare("UPDATE social_links SET clicks = clicks + 1 WHERE id = ?").run(id);
  },

  deleteLink(id: string) {
    const db = getSqlite();
    db.prepare("DELETE FROM social_links WHERE id = ?").run(id);
  },

  // Offers & Menu
  getOffersByBusiness(businessId: string): Offer[] {
    const db = getSqlite();
    const stmt = db.prepare("SELECT * FROM offers WHERE businessId = ? ORDER BY createdAt ASC");
    const rows = stmt.all(businessId) as any[];
    return rows.map((r) => ({ ...r, isActive: Boolean(r.isActive) }));
  },

  createOffer(offer: Omit<Offer, "isActive" | "createdAt"> & Partial<Offer>): Offer {
    const db = getSqlite();
    const record: Offer = {
      ...offer,
      emoji: offer.emoji || "🎁",
      isActive: offer.isActive ?? true,
      createdAt: offer.createdAt || new Date().toISOString(),
    };

    const stmt = db.prepare(`
      INSERT INTO offers (id, businessId, title, description, price, emoji, tag, expiresAt, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id, record.businessId, record.title, record.description || null,
      record.price || null, record.emoji, record.tag || null, record.expiresAt || null,
      record.isActive ? 1 : 0, record.createdAt
    );

    return record;
  },

  deleteOffer(id: string) {
    const db = getSqlite();
    db.prepare("DELETE FROM offers WHERE id = ?").run(id);
  },

  // QR Codes
  getQRCodesByBusiness(businessId: string): QRCode[] {
    const db = getSqlite();
    const stmt = db.prepare("SELECT * FROM qr_codes WHERE businessId = ?");
    return stmt.all(businessId) as QRCode[];
  },

  createQRCode(qr: Omit<QRCode, "scans" | "createdAt"> & Partial<QRCode>): QRCode {
    const db = getSqlite();
    const record: QRCode = {
      ...qr,
      scans: qr.scans ?? 0,
      createdAt: qr.createdAt || new Date().toISOString(),
    };

    const stmt = db.prepare(`
      INSERT INTO qr_codes (id, businessId, label, destinationUrl, scans, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(record.id, record.businessId, record.label, record.destinationUrl, record.scans, record.createdAt);
    return record;
  },

  incrementQRScans(id: string) {
    const db = getSqlite();
    db.prepare("UPDATE qr_codes SET scans = scans + 1 WHERE id = ?").run(id);
  },

  // Analytics
  recordEvent(event: Omit<AnalyticsEvent, "createdAt"> & { createdAt?: string }) {
    const db = getSqlite();
    const now = event.createdAt || new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO analytics_events (id, businessId, eventType, targetId, targetLabel, ipHash, userAgent, referer, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      event.id, event.businessId, event.eventType, event.targetId || null,
      event.targetLabel || null, event.ipHash || null, event.userAgent || null,
      event.referer || null, now
    );

    // Increment business totals
    if (event.eventType === "qr_scan") {
      this.incrementBusinessTotals(event.businessId, "scan");
      if (event.targetId) {
        this.incrementQRScans(event.targetId);
      }
    } else {
      this.incrementBusinessTotals(event.businessId, "click");
    }

    if (event.targetId && event.eventType === "link_click") {
      this.incrementLinkClicks(event.targetId);
    }
  },

  getAnalytics(businessId: string, days = 7) {
    const db = getSqlite();
    const biz = this.getBusinessById(businessId);
    if (!biz) return null;

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    const sinceIso = sinceDate.toISOString();

    const stmt = db.prepare(`
      SELECT * FROM analytics_events
      WHERE businessId = ? AND createdAt >= ?
      ORDER BY createdAt ASC
    `);

    const events = stmt.all(businessId, sinceIso) as AnalyticsEvent[];

    // Aggregate by day
    const dailyMap: Record<string, { scans: number; clicks: number; reviews: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = { scans: 0, clicks: 0, reviews: 0 };
    }

    const platformClicks: Record<string, number> = {};
    let totalReviewClicks = 0;

    for (const ev of events) {
      const day = ev.createdAt.split("T")[0];
      if (!dailyMap[day]) {
        dailyMap[day] = { scans: 0, clicks: 0, reviews: 0 };
      }

      if (ev.eventType === "qr_scan") {
        dailyMap[day].scans++;
      } else if (ev.eventType === "google_review_click") {
        dailyMap[day].clicks++;
        dailyMap[day].reviews++;
        totalReviewClicks++;
        platformClicks["Google Review"] = (platformClicks["Google Review"] || 0) + 1;
      } else {
        dailyMap[day].clicks++;
        const label = ev.targetLabel || ev.eventType.replace("_click", "").replace("_", " ");
        const formatted = label.charAt(0).toUpperCase() + label.slice(1);
        platformClicks[formatted] = (platformClicks[formatted] || 0) + 1;
      }
    }

    const daily = Object.entries(dailyMap).map(([date, stats]) => ({
      date,
      scans: stats.scans,
      clicks: stats.clicks,
      reviews: stats.reviews,
    }));

    const totalClicksSum = Object.values(platformClicks).reduce((a, b) => a + b, 0);
    const topLinks = Object.entries(platformClicks)
      .map(([name, clicks]) => ({
        name,
        clicks,
        percentage: totalClicksSum > 0 ? Math.round((clicks / totalClicksSum) * 100) : 0,
      }))
      .sort((a, b) => b.clicks - a.clicks);

    return {
      totalScans: biz.totalScans,
      totalClicks: biz.totalClicks,
      totalReviewClicks,
      daily,
      topLinks,
    };
  }
};
