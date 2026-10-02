import type { Request, Response, NextFunction } from "express";
import { SESSION_COOKIE, verifyJwt } from "../lib/jwt.ts";
import { dbService } from "../../../database/src/db.ts";
import type { User } from "../../../database/src/schema.ts";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE] || req.headers.authorization?.replace(/^Bearer\s+/i, "");

  if (token) {
    const payload = verifyJwt(token);
    if (payload?.sub) {
      const user = dbService.getUserById(payload.sub);
      if (user && !user.isSuspended) {
        req.user = user;
      }
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required. Please sign in." });
  }
  next();
}
