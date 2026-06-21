import crypto from "crypto";
import type { ApiKey, ApiKeyMode } from "@prisma/client";
import { db } from "@/lib/db";

/** Scope granular yang tersedia untuk Shared API. */
export const API_SCOPES = [
  "patients:read",
  "patients:write",
  "encounters:read",
  "drug-orders:read",
  "stock:read",
] as const;
export type ApiScope = (typeof API_SCOPES)[number];

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** Buat API key baru. Token penuh (`prefix.secret`) hanya ditampilkan sekali. */
export function generateApiKey(mode: ApiKeyMode): {
  prefix: string;
  hashedSecret: string;
  token: string;
} {
  const tag = mode === "TEST" ? "test" : "live";
  const prefix = `smk_${tag}_${crypto.randomBytes(6).toString("hex")}`;
  const secret = crypto.randomBytes(32).toString("hex");
  return { prefix, hashedSecret: sha256(secret), token: `${prefix}.${secret}` };
}

/** Ambil token dari header `Authorization: Bearer` atau `X-API-Key`. */
export function extractToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  const xkey = req.headers.get("x-api-key");
  return xkey ? xkey.trim() : null;
}

type AuthResult =
  | { ok: true; key: ApiKey }
  | { ok: false; status: number; error: string };

async function authenticateApiKey(token: string | null): Promise<AuthResult> {
  if (!token || !token.includes(".")) {
    return { ok: false, status: 401, error: "missing_or_malformed_api_key" };
  }
  const [prefix, secret] = token.split(".");
  const key = await db.apiKey.findUnique({ where: { prefix } });
  if (!key || sha256(secret) !== key.hashedSecret) {
    return { ok: false, status: 401, error: "invalid_api_key" };
  }
  if (key.status !== "ACTIVE") {
    return { ok: false, status: 401, error: "revoked_api_key" };
  }
  if (key.expiresAt && key.expiresAt < new Date()) {
    return { ok: false, status: 401, error: "expired_api_key" };
  }
  return { ok: true, key };
}

// Rate limit sederhana berbasis memori (fixed window). Untuk produksi pakai Redis.
const LIMIT = 60;
const WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; reset: number }>();

function checkRateLimit(keyId: string) {
  const now = Date.now();
  let b = buckets.get(keyId);
  if (!b || b.reset <= now) {
    b = { count: 0, reset: now + WINDOW_MS };
    buckets.set(keyId, b);
  }
  b.count++;
  return {
    allowed: b.count <= LIMIT,
    limit: LIMIT,
    remaining: Math.max(0, LIMIT - b.count),
    reset: Math.ceil(b.reset / 1000),
  };
}

/**
 * Bungkus handler endpoint publik `/api/v1`: autentikasi key, rate limit,
 * cek scope, catat ke ApiRequestLog, dan format respons/error konsisten.
 */
export async function serveApi(
  req: Request,
  opts: { scope: ApiScope | null },
  handler: (key: ApiKey) => Promise<unknown>,
): Promise<Response> {
  const start = Date.now();
  const path = new URL(req.url).pathname;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  const respond = (
    status: number,
    body: unknown,
    key?: ApiKey,
    headers?: Record<string, string>,
  ) => {
    if (key) {
      void db.apiRequestLog
        .create({
          data: {
            tenantId: key.tenantId,
            apiKeyId: key.id,
            method: req.method,
            path,
            statusCode: status,
            latencyMs: Date.now() - start,
            ipAddress: ip,
          },
        })
        .catch(() => {});
    }
    return Response.json(body, { status, headers });
  };

  const auth = await authenticateApiKey(extractToken(req));
  if (!auth.ok) return respond(auth.status, { error: auth.error });
  const key = auth.key;

  const rl = checkRateLimit(key.id);
  const rlHeaders = {
    "X-RateLimit-Limit": String(rl.limit),
    "X-RateLimit-Remaining": String(rl.remaining),
    "X-RateLimit-Reset": String(rl.reset),
  };
  if (!rl.allowed) {
    return respond(429, { error: "rate_limit_exceeded" }, key, rlHeaders);
  }

  if (opts.scope && !key.scopes.includes(opts.scope)) {
    return respond(
      403,
      { error: "insufficient_scope", required: opts.scope },
      key,
      rlHeaders,
    );
  }

  try {
    const data = await handler(key);
    void db.apiKey
      .update({ where: { id: key.id }, data: { lastUsedAt: new Date() } })
      .catch(() => {});
    return respond(200, data, key, rlHeaders);
  } catch {
    return respond(500, { error: "internal_error" }, key, rlHeaders);
  }
}
