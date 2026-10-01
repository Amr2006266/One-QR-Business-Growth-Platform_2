import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "oneqr_session";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const JWT_ISSUER = "oneqr";

export type JwtPayload = {
  sub: string;
  iat: number;
  exp: number;
  iss: string;
};

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 bytes");
  }
  return secret;
}

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signature(input: string) {
  return createHmac("sha256", jwtSecret()).update(input).digest();
}

export function signJwt(subject: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({
    sub: subject,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
    iss: JWT_ISSUER,
  });
  const input = `${header}.${payload}`;
  return `${input}.${signature(input).toString("base64url")}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")) as {
      alg?: string;
      typ?: string;
    };
    if (header.alg !== "HS256" || header.typ !== "JWT") return null;

    const expected = signature(`${parts[0]}.${parts[1]}`);
    const received = Buffer.from(parts[2], "base64url");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as Partial<JwtPayload>;
    const now = Math.floor(Date.now() / 1000);
    if (
      typeof payload.sub !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= now ||
      typeof payload.iat !== "number" ||
      payload.iat > now + 60 ||
      payload.iss !== JWT_ISSUER
    ) return null;

    return payload as JwtPayload;
  } catch {
    return null;
  }
}