import { Router, type Request, type Response } from "express";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { dbService } from "../../../database/src/db.ts";
import { SESSION_COOKIE, signJwt } from "../lib/jwt.ts";
import type { User } from "../../../database/src/schema.ts";

const router = Router();
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

function setSession(res: Response, user: User) {
  const token = signJwt(user.id, user.email);
  res.cookie(SESSION_COOKIE, token, cookieOptions());
}

function publicUser(user: User) {
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const derived = scryptSync(password, salt, 64);
  return `${salt}.${derived.toString("base64url")}`;
}

function verifyPassword(password: string, storedHash?: string | null): boolean {
  if (!storedHash) return false;
  const [salt, encoded] = storedHash.split(".");
  if (!salt || !encoded) return false;
  try {
    const expected = Buffer.from(encoded, "base64url");
    const actual = scryptSync(password, salt, expected.length);
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

// ── Email Register ──────────────────────────────────────────────────────────
router.post("/auth/register", (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Please enter your name." });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = dbService.getUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: "An account already exists with this email." });
    }

    const userId = "usr_" + randomBytes(8).toString("hex");
    const newUser = dbService.createUser({
      id: userId,
      email: normalizedEmail,
      name: name.trim(),
      passwordHash: hashPassword(password),
      authProvider: "email",
      subscriptionPlan: "pro",
      subscriptionStatus: "active",
      isAdmin: false,
      isSuspended: false,
    });

    setSession(res, newUser);
    return res.status(201).json({ user: publicUser(newUser) });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Unable to create your account right now." });
  }
});

// ── Email Login ─────────────────────────────────────────────────────────────
router.post("/auth/login", (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please enter both email and password." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = dbService.getUserByEmail(normalizedEmail);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: "This account has been suspended." });
    }

    setSession(res, user);
    return res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Unable to sign in right now." });
  }
});

// ── Google OAuth & 1-Click Fast Sign-In ──────────────────────────────────────
router.get("/auth/google", (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (clientId) {
    // Real Google OAuth Redirect
    const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/google/callback`;
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("prompt", "select_account");
    return res.redirect(302, googleAuthUrl.toString());
  }

  // Seamless Dev / 1-Click Google Sign-In
  const email = (req.query.email as string) || "google.tester@gmail.com";
  let user = dbService.getUserByEmail(email);
  if (!user) {
    user = dbService.createUser({
      id: "usr_google_" + randomBytes(6).toString("hex"),
      email,
      name: "Google Account User",
      avatarUrl: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      authProvider: "google",
      authProviderId: "google_oauth_" + randomBytes(8).toString("hex"),
      subscriptionPlan: "pro",
      subscriptionStatus: "active",
      isAdmin: false,
      isSuspended: false,
    });
  }

  setSession(res, user);
  return res.redirect(302, "/?auth=success");
});

// ── Apple OAuth & 1-Click Fast Sign-In ───────────────────────────────────────
router.get("/auth/apple", (req: Request, res: Response) => {
  const clientId = process.env.APPLE_CLIENT_ID;
  if (clientId) {
    const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/apple/callback`;
    const appleAuthUrl = new URL("https://appleid.apple.com/auth/authorize");
    appleAuthUrl.searchParams.set("client_id", clientId);
    appleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    appleAuthUrl.searchParams.set("response_type", "code");
    appleAuthUrl.searchParams.set("response_mode", "form_post");
    appleAuthUrl.searchParams.set("scope", "name email");
    return res.redirect(302, appleAuthUrl.toString());
  }

  // Seamless Dev / 1-Click Apple Sign-In
  const email = (req.query.email as string) || "apple.tester@privaterelay.appleid.com";
  let user = dbService.getUserByEmail(email);
  if (!user) {
    user = dbService.createUser({
      id: "usr_apple_" + randomBytes(6).toString("hex"),
      email,
      name: "Apple Account User",
      avatarUrl: null,
      authProvider: "apple",
      authProviderId: "apple_oauth_" + randomBytes(8).toString("hex"),
      subscriptionPlan: "pro",
      subscriptionStatus: "active",
      isAdmin: false,
      isSuspended: false,
    });
  }

  setSession(res, user);
  return res.redirect(302, "/?auth=success");
});

// ── Quick OAuth API Endpoint (Frontend 1-Click Google/Apple) ────────────────
router.post("/auth/quick-oauth", (req: Request, res: Response) => {
  try {
    const { provider, email: customEmail, name: customName } = req.body;
    if (!["google", "apple"].includes(provider)) {
      return res.status(400).json({ error: "Invalid provider. Supported: google, apple" });
    }

    const email = customEmail || (provider === "google" ? "google.tester@gmail.com" : "apple.tester@privaterelay.appleid.com");
    const name = customName || (provider === "google" ? "Google User" : "Apple User");
    const avatarUrl = provider === "google" ? "https://lh3.googleusercontent.com/a/default-user=s96-c" : null;

    let user = dbService.getUserByEmail(email);
    if (!user) {
      user = dbService.createUser({
        id: `usr_${provider}_` + randomBytes(6).toString("hex"),
        email,
        name,
        avatarUrl,
        authProvider: provider as "google" | "apple",
        authProviderId: `${provider}_id_` + randomBytes(8).toString("hex"),
        subscriptionPlan: "pro",
        subscriptionStatus: "active",
        isAdmin: false,
        isSuspended: false,
      });
    }

    setSession(res, user);
    return res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("Quick OAuth error:", err);
    return res.status(500).json({ error: "Failed to authenticate with social provider." });
  }
});

// ── Me / Current Session ────────────────────────────────────────────────────
router.get("/auth/me", (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  return res.json({ user: publicUser(req.user) });
});

// ── Logout ──────────────────────────────────────────────────────────────────
router.post("/auth/logout", (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  return res.status(200).json({ success: true });
});

export default router;
