import { Router, type Request, type Response } from "express";
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  randomBytes,
  sign as signSignature,
  scrypt as scryptCallback,
  timingSafeEqual,
  verify as verifySignature,
} from "node:crypto";
import { promisify } from "node:util";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db, usersTable } from "@workspace/db";
import { generateId } from "../lib/utils";
import { SESSION_COOKIE, signJwt, verifyJwt } from "../lib/jwt";

const router = Router();
const scrypt = promisify(scryptCallback);
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const OAUTH_COOKIE_AGE = 10 * 60 * 1000;
const OAUTH_PROVIDERS = ["google", "apple"] as const;
type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(254).transform((email) => email.trim().toLowerCase()),
  password: z.string().min(12).max(128),
});

const loginSchema = z.object({
  email: z.email().max(254).transform((email) => email.trim().toLowerCase()),
  password: z.string().min(1).max(128),
});

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api",
    maxAge,
  };
}

function setSession(res: Response, userId: string) {
  res.cookie(SESSION_COOKIE, signJwt(userId), cookieOptions(SESSION_MAX_AGE));
}

function publicUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _passwordHash, authProviderId: _providerId, ...safeUser } = user;
  return safeUser;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}.${derivedKey.toString("base64url")}`;
}

async function verifyPassword(password: string, storedHash: string | null) {
  const [salt, encodedHash] = storedHash?.split(".") ?? [];
  if (!salt || !encodedHash) {
    await scrypt(password, "oneqr-invalid-account-salt", 64);
    return false;
  }

  const expected = Buffer.from(encodedHash, "base64url");
  if (expected.length !== 64 || salt.length > 64) return false;
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function requireSameOrigin(req: Request, res: Response, next: (error?: unknown) => void) {
  const origin = req.get("origin");
  if (!origin) return next();
  const allowedOrigin = process.env.APP_URL ? new URL(process.env.APP_URL).origin : null;
  if (origin !== allowedOrigin) return res.status(403).json({ error: "Request origin is not allowed." });
  return next();
}

function appUrl(path: string) {
  const configured = process.env.APP_URL;
  if (!configured) throw new Error("APP_URL is not configured");
  const url = new URL(path, configured);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("APP_URL must use HTTP or HTTPS");
  }
  return url;
}

function apiCallbackUrl(provider: OAuthProvider) {
  const configured = process.env.API_BASE_URL;
  if (!configured) throw new Error("API_BASE_URL is not configured");
  const baseUrl = new URL(configured);
  if (!process.env.APP_URL || baseUrl.origin !== new URL(process.env.APP_URL).origin) {
    throw new Error("API_BASE_URL and APP_URL must use the same origin");
  }
  if (baseUrl.protocol !== "https:" && baseUrl.hostname !== "localhost") {
    throw new Error("API_BASE_URL must use HTTPS outside localhost");
  }
  return new URL(`/api/auth/${provider}/callback`, baseUrl).toString();
}

function oauthClientId(provider: OAuthProvider) {
  const clientId = provider === "google" ? process.env.GOOGLE_CLIENT_ID : process.env.APPLE_CLIENT_ID;
  if (!clientId) throw new Error(`${provider.toUpperCase()}_CLIENT_ID is not configured`);
  return clientId;
}

function cookieName(provider: OAuthProvider, value: "state" | "nonce") {
  return `oneqr_${provider}_${value}`;
}

function clearOAuthCookies(res: Response, provider: OAuthProvider) {
  const options = { ...cookieOptions(0), path: "/api/auth" };
  res.clearCookie(cookieName(provider, "state"), options);
  res.clearCookie(cookieName(provider, "nonce"), options);
}

function equalSecret(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

type OidcClaims = {
  sub?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  nonce?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
};

type Jwk = { kid?: string; kty: string; n?: string; e?: string };

function decodeJwtPart<T>(part: string): T {
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as T;
}

async function verifyIdentityToken(
  provider: OAuthProvider,
  identityToken: string,
  nonce: string,
) {
  const parts = identityToken.split(".");
  if (parts.length !== 3) throw new Error("Invalid identity token");

  const header = decodeJwtPart<{ alg?: string; kid?: string }>(parts[0]);
  if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported identity token");

  const issuer = provider === "google" ? "https://accounts.google.com" : "https://appleid.apple.com";
  const jwksUrl = provider === "google"
    ? "https://www.googleapis.com/oauth2/v3/certs"
    : "https://appleid.apple.com/auth/keys";
  const keysResponse = await fetch(jwksUrl, { signal: AbortSignal.timeout(10000) });
  if (!keysResponse.ok) throw new Error("Identity provider keys are unavailable");
  const keys = (await keysResponse.json()) as { keys?: Jwk[] };
  const jwk = keys.keys?.find((key) => key.kid === header.kid && key.kty === "RSA");
  if (!jwk?.n || !jwk.e) throw new Error("Identity provider signing key was not found");

  const publicKey = createPublicKey({
    key: { kty: jwk.kty, n: jwk.n, e: jwk.e },
    format: "jwk",
  });
  const signedContent = `${parts[0]}.${parts[1]}`;
  const validSignature = verifySignature(
    "RSA-SHA256",
    Buffer.from(signedContent),
    publicKey,
    Buffer.from(parts[2], "base64url"),
  );
  if (!validSignature) throw new Error("Identity token signature is invalid");

  const claims = decodeJwtPart<OidcClaims>(parts[1]);
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  const now = Math.floor(Date.now() / 1000);
  if (
    claims.iss !== issuer ||
    !audience.includes(oauthClientId(provider)) ||
    typeof claims.exp !== "number" || claims.exp <= now ||
    typeof claims.iat !== "number" || claims.iat > now + 60 ||
    typeof claims.sub !== "string" || !equalSecret(claims.nonce ?? "", nonce) ||
    !(claims.email_verified === true || claims.email_verified === "true") ||
    typeof claims.email !== "string"
  ) {
    throw new Error("Identity token claims are invalid");
  }
  return claims;
}

function appleClientSecret() {
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const clientId = oauthClientId("apple");
  const privateKeyPem = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!teamId || !keyId || !privateKeyPem) throw new Error("Apple signing credentials are not configured");

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid: keyId })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: teamId,
    iat: now,
    exp: now + 60 * 60,
    aud: "https://appleid.apple.com",
    sub: clientId,
  })).toString("base64url");
  const content = `${header}.${payload}`;
  const signature = signSignature("sha256", Buffer.from(content), {
    key: createPrivateKey(privateKeyPem),
    dsaEncoding: "ieee-p1363",
  });
  return `${content}.${signature.toString("base64url")}`;
}

function startOAuth(provider: OAuthProvider) {
  return (req: Request, res: Response) => {
    try {
      const clientId = oauthClientId(provider);
      const redirectUri = apiCallbackUrl(provider);
      const state = randomBytes(32).toString("base64url");
      const nonce = randomBytes(32).toString("base64url");
      const options = { ...cookieOptions(OAUTH_COOKIE_AGE), path: "/api/auth" };
      res.cookie(cookieName(provider, "state"), state, options);
      res.cookie(cookieName(provider, "nonce"), nonce, options);

      const authorizationUrl = new URL(
        provider === "google"
          ? "https://accounts.google.com/o/oauth2/v2/auth"
          : "https://appleid.apple.com/auth/authorize",
      );
      authorizationUrl.search = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        response_mode: "query",
        scope: provider === "google" ? "openid email profile" : "openid email",
        state,
        nonce,
      }).toString();
      if (provider === "google") authorizationUrl.searchParams.set("prompt", "select_account");
      res.redirect(302, authorizationUrl.toString());
    } catch {
      if (process.env.APP_URL) {
        try {
          const url = appUrl("/");
          url.searchParams.set("auth_error", "provider_not_configured");
          return res.redirect(302, url.toString());
        } catch {
          return res.status(503).json({ error: "This sign-in provider is not configured" });
        }
      }
      res.status(503).json({ error: "This sign-in provider is not configured" });
    }
  };
}

async function exchangeCode(provider: OAuthProvider, code: string) {
  const clientId = oauthClientId(provider);
  const clientSecret = provider === "google" ? process.env.GOOGLE_CLIENT_SECRET : appleClientSecret();
  if (!clientSecret) throw new Error("OAuth client secret is not configured");
  const tokenUrl = provider === "google"
    ? "https://oauth2.googleapis.com/token"
    : "https://appleid.apple.com/auth/token";
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: apiCallbackUrl(provider),
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("OAuth code exchange failed");
  return (await response.json()) as { id_token?: string };
}

async function findOrCreateOAuthUser(provider: OAuthProvider, claims: OidcClaims) {
  const email = claims.email!.trim().toLowerCase();
  const [providerUser] = await db.select().from(usersTable).where(and(
    eq(usersTable.authProvider, provider),
    eq(usersTable.authProviderId, claims.sub!),
  )).limit(1);
  if (providerUser) return providerUser;

  const [emailUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (emailUser) throw new Error("An account already exists for this email. Sign in with its original method.");

  const [user] = await db.insert(usersTable).values({
    id: generateId(),
    email,
    name: claims.name?.trim() || email.split("@")[0],
    avatarUrl: claims.picture ?? null,
    authProvider: provider,
    authProviderId: claims.sub!,
  }).returning();
  return user;
}

router.post("/auth/register", requireSameOrigin, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Enter a valid name, email, and password of at least 12 characters." });

  try {
    const existing = await db.select({ id: usersTable.id }).from(usersTable)
      .where(eq(usersTable.email, parsed.data.email)).limit(1);
    if (existing.length) return res.status(409).json({ error: "An account already exists for this email." });

    const [user] = await db.insert(usersTable).values({
      id: generateId(),
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      authProvider: "email",
    }).returning();
    setSession(res, user.id);
    return res.status(201).json({ user: publicUser(user) });
  } catch {
    return res.status(500).json({ error: "Unable to create your account right now." });
  }
});

router.post("/auth/login", requireSameOrigin, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Enter a valid email and password." });

  try {
    const [user] = await db.select().from(usersTable)
      .where(eq(usersTable.email, parsed.data.email)).limit(1);
    const validPassword = await verifyPassword(parsed.data.password, user?.passwordHash ?? null);
    if (!user || !validPassword || user.isSuspended) {
      return res.status(401).json({ error: "Email or password is incorrect." });
    }
    setSession(res, user.id);
    return res.json({ user: publicUser(user) });
  } catch {
    return res.status(500).json({ error: "Unable to sign in right now." });
  }
});

router.get("/auth/me", async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return res.status(401).json({ error: "Not signed in" });
  const payload = verifyJwt(token);
  if (!payload) return res.status(401).json({ error: "Session expired" });

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.sub)).limit(1);
    if (!user || user.isSuspended) return res.status(401).json({ error: "Session is no longer valid" });
    return res.json({ user: publicUser(user) });
  } catch {
    return res.status(500).json({ error: "Unable to load your account." });
  }
});

router.post("/auth/logout", requireSameOrigin, (_req, res) => {
  res.clearCookie(SESSION_COOKIE, cookieOptions(0));
  return res.status(204).send();
});

for (const provider of OAUTH_PROVIDERS) {
  router.get(`/auth/${provider}`, startOAuth(provider));
  router.get(`/auth/${provider}/callback`, async (req, res) => {
    const returnTo = (error: string) => {
      const url = appUrl("/");
      url.searchParams.set("auth_error", error);
      return res.redirect(302, url.toString());
    };
    const stateCookie = req.cookies?.[cookieName(provider, "state")];
    const nonce = req.cookies?.[cookieName(provider, "nonce")];
    clearOAuthCookies(res, provider);

    if (typeof req.query.error === "string") return returnTo("provider_cancelled");
    if (
      typeof req.query.state !== "string" || !stateCookie || !nonce ||
      !equalSecret(req.query.state, stateCookie) || typeof req.query.code !== "string"
    ) return returnTo("invalid_oauth_state");

    try {
      const tokens = await exchangeCode(provider, req.query.code);
      if (!tokens.id_token) throw new Error("Provider did not return an identity token");
      const claims = await verifyIdentityToken(provider, tokens.id_token, nonce);
      const user = await findOrCreateOAuthUser(provider, claims);
      if (user.isSuspended) return returnTo("account_suspended");
      setSession(res, user.id);
      return res.redirect(302, appUrl("/?auth=success").toString());
    } catch {
      return returnTo("oauth_failed");
    }
  });
}

export default router;