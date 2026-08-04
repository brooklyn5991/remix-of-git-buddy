// Server-only helper: verifies a Paystack transaction and creates/returns
// the corresponding confirmed reservation. Idempotent on payment reference.

import { occupies } from "@/lib/availability";

type Tier = "Standard" | "Deluxe" | "Executive" | "Suite";

export interface FulfillInput {
  tier: Tier;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  reference: string;
}

export interface FulfilledReservation {
  id: string;
  confirmation_code: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  total_ngn: number;
  room_number: string;
  room_tier: string;
  room_name: string;
}

async function verifyPaystack(reference: string, secret: string) {
  const resp = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` } },
  );
  const body = (await resp.json()) as {
    status: boolean;
    message: string;
    data?: {
      status: string;
      amount: number;
      currency: string;
      reference: string;
      customer?: { email?: string };
      metadata?: Record<string, unknown> | string | null;
    };
  };
  if (!resp.ok || !body.status || !body.data) {
    throw new Error(body.message || "Could not verify Paystack transaction");
  }
  return body.data;
}

export async function getPaystackSecret(): Promise<string> {
  const envSecret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (envSecret) return envSecret;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("get_backend_secret", { secret_name: "PAYSTACK_SECRET_KEY" });
  const vaultSecret = typeof data === "string" ? data.trim() : "";
  if (vaultSecret) return vaultSecret;

  if (error) {
    console.error("Paystack secret lookup failed", error.message);
  }
  throw new Error("Paystack secret key not configured on the server.");
}

function parseMetadata(md: Record<string, unknown> | string | null | undefined): Record<string, unknown> {
  if (!md) return {};
  if (typeof md === "string") {
    try { return JSON.parse(md) as Record<string, unknown>; } catch { return {}; }
  }
  return md;
}

/**
 * Verify Paystack payment (server-side) and create the reservation if not
 * already present. Returns the reservation row. Safe to call multiple times.
 */
export async function fulfillPaystackReservation(input: FulfillInput): Promise<FulfilledReservation> {
  const secret = await getPaystackSecret();
  if (new Date(input.check_out) <= new Date(input.check_in)) {
    throw new Error("Check-out must be after check-in");
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Idempotency: if we already recorded this payment, return it.
  const { data: existing } = await supabaseAdmin
    .from("reservations")
    .select("id, confirmation_code, guest_name, guest_email, guest_phone, check_in, check_out, total_ngn, rooms(room_number, tier, name)")
    .eq("payment_reference", input.reference)
    .maybeSingle();
  if (existing) {
    const r = existing.rooms as { room_number: string; tier: string; name: string } | null;
    return {
      id: existing.id as string,
      confirmation_code: existing.confirmation_code as string,
      guest_name: existing.guest_name as string,
      guest_email: existing.guest_email as string,
      guest_phone: existing.guest_phone as string,
      check_in: existing.check_in as string,
      check_out: existing.check_out as string,
      total_ngn: existing.total_ngn as number,
      room_number: r?.room_number ?? "",
      room_tier: r?.tier ?? input.tier,
      room_name: r?.name ?? "",
    };
  }

  const { data: tierRooms, error: roomsErr } = await supabaseAdmin
    .from("rooms")
    .select("id, price_ngn, room_number, tier, name")
    .eq("tier", input.tier)
    .eq("is_active", true)
    .order("room_number", { ascending: true });
  if (roomsErr) throw new Error(roomsErr.message);
  if (!tierRooms || tierRooms.length === 0) throw new Error(`No ${input.tier} rooms configured.`);

  const nights = Math.ceil(
    (new Date(input.check_out).getTime() - new Date(input.check_in).getTime()) / 86400000,
  );
  const price = Math.min(...tierRooms.map((r) => r.price_ngn as number));
  const total = nights * price;

  // Verify with Paystack.
  const tx = await verifyPaystack(input.reference, secret);
  const paidCorrectly =
    tx.status === "success" &&
    tx.amount === total * 100 &&
    tx.currency === "NGN" &&
    tx.reference === input.reference;
  if (!paidCorrectly) throw new Error("Payment was not successful");

  // Find an available room in tier.
  const roomIds = tierRooms.map((r) => r.id as string);
  const { data: overlaps, error: overlapsErr } = await supabaseAdmin
    .from("reservations")
    .select("room_id, check_in, check_out")
    .in("room_id", roomIds)
    .in("status", ["confirmed", "checked_in"])
    .lt("check_in", input.check_out)
    .gte("check_out", input.check_in);
  if (overlapsErr) throw new Error(overlapsErr.message);
  const bookedIds = new Set(
    (overlaps ?? [])
      .filter((row) =>
        occupies(
          { check_in: row.check_in as string, check_out: row.check_out as string },
          { check_in: input.check_in, check_out: input.check_out },
        ),
      )
      .map((row) => row.room_id as string),
  );

  const availableRooms = tierRooms.filter((r) => !bookedIds.has(r.id as string));
  if (availableRooms.length === 0) throw new Error(`All ${input.tier} rooms are sold out for those dates.`);

  for (const room of availableRooms) {
    const { data: created, error: createErr } = await supabaseAdmin
      .from("reservations")
      .insert({
        room_id: room.id,
        guest_name: input.guest_name,
        guest_email: input.guest_email,
        guest_phone: input.guest_phone,
        check_in: input.check_in,
        check_out: input.check_out,
        total_ngn: total,
        source: "online",
        status: "confirmed",
        payment_status: "paid",
        payment_reference: input.reference,
      })
      .select("id, confirmation_code, guest_name, guest_email, guest_phone, check_in, check_out, total_ngn, rooms(room_number, tier, name)")
      .single();

    if (!createErr && created) {
      const r = created.rooms as { room_number: string; tier: string; name: string } | null;
      const reservation: FulfilledReservation = {
        id: created.id as string,
        confirmation_code: created.confirmation_code as string,
        guest_name: created.guest_name as string,
        guest_email: created.guest_email as string,
        guest_phone: created.guest_phone as string,
        check_in: created.check_in as string,
        check_out: created.check_out as string,
        total_ngn: created.total_ngn as number,
        room_number: r?.room_number ?? (room.room_number as string),
        room_tier: r?.tier ?? input.tier,
        room_name: r?.name ?? (room.name as string),
      };
      // Fire-and-forget confirmation email (never fail the booking on email issues).
      void sendGuestConfirmationEmail(reservation).catch((e) => console.error("email send failed", e));
      return reservation;
    }

    if (createErr && (createErr.code === "23P01" || createErr.message.toLowerCase().includes("exclude"))) continue;

    if (createErr && createErr.code === "23505") {
      const { data: paid } = await supabaseAdmin
        .from("reservations")
        .select("id, confirmation_code, guest_name, guest_email, guest_phone, check_in, check_out, total_ngn, rooms(room_number, tier, name)")
        .eq("payment_reference", input.reference)
        .maybeSingle();
      if (paid) {
        const r = paid.rooms as { room_number: string; tier: string; name: string } | null;
        return {
          id: paid.id as string,
          confirmation_code: paid.confirmation_code as string,
          guest_name: paid.guest_name as string,
          guest_email: paid.guest_email as string,
          guest_phone: paid.guest_phone as string,
          check_in: paid.check_in as string,
          check_out: paid.check_out as string,
          total_ngn: paid.total_ngn as number,
          room_number: r?.room_number ?? "",
          room_tier: r?.tier ?? input.tier,
          room_name: r?.name ?? "",
        };
      }
    }

    if (createErr) throw new Error(createErr.message);
  }
  throw new Error(`All ${input.tier} rooms were just booked for those dates.`);
}

/**
 * Extract booking details from a Paystack transaction (for webhook path where
 * we don't have the original form data — Paystack echoes our `metadata`).
 */
export function extractFulfillFromMetadata(tx: {
  reference: string;
  customer?: { email?: string };
  metadata?: Record<string, unknown> | string | null;
}): FulfillInput | null {
  const md = parseMetadata(tx.metadata);
  const tier = String(md.room_category ?? "") as Tier;
  const guest_name = String(md.guest_name ?? "");
  const guest_email = String(md.guest_email ?? tx.customer?.email ?? "");
  const guest_phone = String(md.whatsapp_phone ?? md.guest_phone ?? "");
  const check_in = String(md.check_in ?? "");
  const check_out = String(md.check_out ?? "");
  if (!tier || !guest_name || !guest_email || !guest_phone || !check_in || !check_out) return null;
  if (!["Standard", "Deluxe", "Executive", "Suite"].includes(tier)) return null;
  return { tier, guest_name, guest_email, guest_phone, check_in, check_out, reference: tx.reference };
}

// ---------------- Guest confirmation email ----------------

async function sendGuestConfirmationEmail(r: FulfilledReservation) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    console.warn("LOVABLE_API_KEY missing — skipping guest confirmation email");
    return;
  }

  const { sendLovableEmail } = await import("@lovable.dev/email-js");
  const address = "52 New Sapele/Agbor Road, Obiaruku, Delta State";
  const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
  const total = currency.format(r.total_ngn);

  const subject = `Booking Confirmed — Room ${r.room_number} (${r.confirmation_code})`;
  const text = [
    `Dear ${r.guest_name},`,
    ``,
    `Your booking at Garen's Garden is confirmed.`,
    ``,
    `Confirmation code: ${r.confirmation_code}`,
    `Room: ${r.room_number} — ${r.room_tier}`,
    `Check-in: ${r.check_in}`,
    `Check-out: ${r.check_out}`,
    `Amount paid: ${total}`,
    ``,
    `Address: ${address}`,
    `Please show this confirmation code at reception on arrival.`,
    ``,
    `— Garen's Garden`,
  ].join("\n");

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0b0b0d;color:#f2e6c8;padding:32px;border:1px solid #b18a3b;">
    <h2 style="color:#d4b268;font-family:Georgia,serif;margin:0 0 16px">Garen's Garden</h2>
    <p style="color:#c9b985">Dear ${escapeHtml(r.guest_name)}, your booking is <b style="color:#8ee6a5">confirmed</b>.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;color:#e9dcb2">
      <tr><td style="padding:6px 0;color:#9d8a55">Confirmation Code</td><td style="text-align:right;font-family:monospace;letter-spacing:2px">${escapeHtml(r.confirmation_code)}</td></tr>
      <tr><td style="padding:6px 0;color:#9d8a55">Room</td><td style="text-align:right">${escapeHtml(r.room_number)} — ${escapeHtml(r.room_tier)}</td></tr>
      <tr><td style="padding:6px 0;color:#9d8a55">Check-in</td><td style="text-align:right">${escapeHtml(r.check_in)}</td></tr>
      <tr><td style="padding:6px 0;color:#9d8a55">Check-out</td><td style="text-align:right">${escapeHtml(r.check_out)}</td></tr>
      <tr><td style="padding:6px 0;color:#9d8a55">Amount Paid</td><td style="text-align:right;color:#d4b268;font-weight:bold">${total}</td></tr>
    </table>
    <p style="color:#c9b985">Address: <b>${address}</b></p>
    <p style="color:#9d8a55;font-size:12px">Present this confirmation code at reception on arrival. Check-in starts at 3:00 PM.</p>
  </div>`;

  try {
    await sendLovableEmail(
      {
        to: r.guest_email,
        from: "Garen's Garden <bookings@lovable.app>",
        subject,
        html,
        text,
        purpose: "transactional",
        label: "booking-confirmation",
        idempotency_key: `booking-${r.id}`,
      },
      { apiKey },
    );
  } catch (e) {
    console.error("sendLovableEmail failed", e);
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
