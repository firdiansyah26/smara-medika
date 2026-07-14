import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/** Event yang bisa dilanggan endpoint webhook. */
export const WEBHOOK_EVENTS = [
  "encounter.created",
  "invoice.created",
  "lab_result.ready",
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

/** Batas percobaan sebelum masuk DEAD_LETTER. */
export const MAX_ATTEMPTS = 5;

/** Tanda tangan payload: HMAC-SHA256 hex dari body mentah memakai secret endpoint. */
export function signPayload(secret: string, body: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

/** Buat secret endpoint baru. */
export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString("hex")}`;
}

/**
 * Apakah daftar event langganan cocok dengan event yang terjadi.
 * Mendukung wildcard "*" (semua) dan prefix "resource.*".
 */
export function eventMatches(subscribed: string[], event: string): boolean {
  return subscribed.some((s) => {
    if (s === "*" || s === event) return true;
    if (s.endsWith(".*")) return event.startsWith(s.slice(0, -1));
    return false;
  });
}

/** Backoff eksponensial (ms) dengan batas atas — attempts mulai dari 1. */
export function backoffDelayMs(attempts: number): number {
  const base = 1000; // 1 detik
  const capped = Math.min(attempts, 6);
  return base * 2 ** (capped - 1); // 1s,2s,4s,8s,16s,32s
}

/** Header standar pengiriman webhook. */
export function deliveryHeaders(signature: string, event: string, deliveryId: string) {
  return {
    "content-type": "application/json",
    "user-agent": "SmaraMedika-Webhook/1",
    "x-smara-event": event,
    "x-smara-delivery": deliveryId,
    "x-smara-signature": `sha256=${signature}`,
  };
}

type DispatchResult = { endpointId: string; deliveryId: string; ok: boolean; status: number | null };

/**
 * Kirim satu event ke semua endpoint tenant yang aktif & berlangganan.
 * Non-blocking di pemanggil (bungkus dengan void/catch). Setiap pengiriman
 * dicatat sebagai WebhookDelivery.
 */
export async function dispatchWebhook(
  tenantId: string,
  event: WebhookEvent,
  data: Record<string, unknown>,
): Promise<DispatchResult[]> {
  const endpoints = await db.webhookEndpoint.findMany({
    where: { tenantId, isActive: true },
  });
  const targets = endpoints.filter((e) => eventMatches(e.events, event));
  if (targets.length === 0) return [];

  const results: DispatchResult[] = [];
  for (const ep of targets) {
    const payload = { event, createdAt: new Date().toISOString(), data };
    const delivery = await db.webhookDelivery.create({
      data: {
        endpointId: ep.id,
        event,
        payload: payload as Prisma.InputJsonValue,
        status: "PENDING",
        attempts: 0,
      },
    });
    const res = await sendDelivery(ep.url, ep.secret, event, delivery.id, payload);
    await recordAttempt(delivery.id, 1, res);
    results.push({ endpointId: ep.id, deliveryId: delivery.id, ok: res.ok, status: res.status });
  }
  return results;
}

type SendResult = { ok: boolean; status: number | null };

async function sendDelivery(
  url: string,
  secret: string,
  event: string,
  deliveryId: string,
  payload: unknown,
): Promise<SendResult> {
  const body = JSON.stringify(payload);
  const signature = signPayload(secret, body);
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: deliveryHeaders(signature, event, deliveryId),
      body,
      signal: AbortSignal.timeout(10_000),
    });
    return { ok: resp.ok, status: resp.status };
  } catch {
    return { ok: false, status: null };
  }
}

/** Perbarui status delivery setelah satu percobaan. */
async function recordAttempt(deliveryId: string, attempts: number, res: SendResult) {
  const status = res.ok
    ? "SUCCESS"
    : attempts >= MAX_ATTEMPTS
      ? "DEAD_LETTER"
      : "FAILED";
  const nextRetryAt =
    status === "FAILED" ? new Date(Date.now() + backoffDelayMs(attempts)) : null;
  await db.webhookDelivery.update({
    where: { id: deliveryId },
    data: { status, attempts, responseCode: res.status, nextRetryAt },
  });
}

/** Kirim ulang satu delivery (manual). Mengembalikan status akhir. */
export async function retryDelivery(deliveryId: string): Promise<SendResult | null> {
  const delivery = await db.webhookDelivery.findUnique({
    where: { id: deliveryId },
    include: { endpoint: true },
  });
  if (!delivery || !delivery.endpoint.isActive) return null;
  const res = await sendDelivery(
    delivery.endpoint.url,
    delivery.endpoint.secret,
    delivery.event,
    delivery.id,
    delivery.payload,
  );
  await recordAttempt(delivery.id, delivery.attempts + 1, res);
  return res;
}
