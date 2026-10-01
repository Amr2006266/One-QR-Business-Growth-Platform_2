import { Router } from "express";
import { db, usersTable, businessesTable } from "@workspace/db";
import { eq, lte, and, lt } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/admin";

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth, requireAdmin);

// ─── List all users ────────────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    let query = db.select().from(usersTable).$dynamic();

    // Filter by plan
    if (req.query.plan) {
      const plan = req.query.plan as "free" | "pro" | "business";
      query = query.where(eq(usersTable.subscriptionPlan, plan));
    }

    // Filter by subscription status
    if (req.query.status) {
      const status = req.query.status as "active" | "expired" | "cancelled" | "trial";
      query = query.where(eq(usersTable.subscriptionStatus, status));
    }

    // Filter by expiring within N days
    if (req.query.expiresBeforeDays) {
      const days = parseInt(req.query.expiresBeforeDays as string);
      if (!isNaN(days)) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + days);
        query = query.where(lte(usersTable.subscriptionExpiresAt, cutoff));
      }
    }

    const users = await query;
    res.json(users);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Get single user ──────────────────────────────────────────────────────────
router.get("/users/:id", async (req, res) => {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.params.id))
      .limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Suspend user ─────────────────────────────────────────────────────────────
router.post("/users/:id/suspend", async (req, res) => {
  try {
    if (req.params.id === req.user!.id) {
      return res.status(400).json({ error: "Cannot suspend yourself" });
    }

    const [updated] = await db
      .update(usersTable)
      .set({ isSuspended: true, updatedAt: new Date() })
      .where(eq(usersTable.id, req.params.id))
      .returning({ id: usersTable.id });

    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User suspended", userId: req.params.id });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Unsuspend user ───────────────────────────────────────────────────────────
router.post("/users/:id/unsuspend", async (req, res) => {
  try {
    const [updated] = await db
      .update(usersTable)
      .set({ isSuspended: false, updatedAt: new Date() })
      .where(eq(usersTable.id, req.params.id))
      .returning({ id: usersTable.id });

    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User unsuspended", userId: req.params.id });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Expire overdue subscriptions ─────────────────────────────────────────────
// This endpoint can be called by a cron job every day
router.post("/subscriptions/expire", async (req, res) => {
  try {
    const now = new Date();

    const expired = await db
      .update(usersTable)
      .set({
        subscriptionStatus: "expired",
        subscriptionPlan: "free",
        updatedAt: now,
      })
      .where(
        and(
          eq(usersTable.subscriptionStatus, "active"),
          lt(usersTable.subscriptionExpiresAt, now),
        ),
      )
      .returning({ id: usersTable.id });

    res.json({
      expired: expired.length,
      message: `${expired.length} subscription(s) expired and downgraded to free plan.`,
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Get platform stats ───────────────────────────────────────────────────────
router.get("/stats", async (_req, res) => {
  try {
    const [totalUsers] = await db.select({ count: db.$count(usersTable) }).from(usersTable);
    const [totalBiz] = await db.select({ count: db.$count(businessesTable) }).from(businessesTable);
    const [proUsers] = await db.select({ count: db.$count(usersTable) }).from(usersTable).where(eq(usersTable.subscriptionPlan, "pro"));
    const [bizUsers] = await db.select({ count: db.$count(usersTable) }).from(usersTable).where(eq(usersTable.subscriptionPlan, "business"));
    const [suspendedUsers] = await db.select({ count: db.$count(usersTable) }).from(usersTable).where(eq(usersTable.isSuspended, true));

    res.json({
      totalUsers: totalUsers.count,
      totalBusinesses: totalBiz.count,
      proUsers: proUsers.count,
      businessUsers: bizUsers.count,
      suspendedUsers: suspendedUsers.count,
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
