import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SESSION_COOKIE, verifyJwt } from "../lib/jwt";

// Extend Express Request with user
declare global {
  namespace Express {
    interface Request {
      user?: typeof usersTable.$inferSelect;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies?.[SESSION_COOKIE];
    if (!token) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const payload = verifyJwt(token);

    if (!payload || typeof payload.sub !== "string") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, payload.sub))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: "Your account has been suspended. Please contact support." });
    }

    // Update last seen
    await db
      .update(usersTable)
      .set({ lastSeenAt: new Date() })
      .where(eq(usersTable.id, user.id));

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Authentication failed" });
  }
}
