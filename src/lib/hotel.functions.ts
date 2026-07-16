import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}


// ---------------- Public: list rooms ----------------
export const listRooms = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("rooms")
    .select("id, room_number, floor, tier, name, description, price_ngn, bed, size, sleeps, image_slug, features")
    .eq("is_active", true)
    .order("room_number", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

// ---------------- Public: which rooms are booked in date range ----------------
const rangeSchema = z.object({
  check_in: z.string(),
  check_out: z.string(),
});
export const getBookedRoomIds = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => rangeSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows, error } = await sb
      .from("reservations")
      .select("room_id, check_in, check_out, status")
      .in("status", ["confirmed", "checked_in"])
      .lt("check_in", data.check_out)
      .gt("check_out", data.check_in);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => r.room_id as string);
  });


// ---------------- Public: create online reservation ----------------
const bookingSchema = z.object({
  room_id: z.string().uuid(),
  guest_name: z.string().min(2).max(120),
  guest_email: z.string().email(),
  guest_phone: z.string().min(6).max(30),
  check_in: z.string(),
  check_out: z.string(),
});
export const createOnlineReservation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => bookingSchema.parse(d))
  .handler(async ({ data }) => {
    if (new Date(data.check_out) <= new Date(data.check_in)) {
      throw new Error("Check-out must be after check-in");
    }
    const sb = publicClient();
    const { data: room, error: rErr } = await sb
      .from("rooms")
      .select("id, price_ngn, room_number, name")
      .eq("id", data.room_id)
      .maybeSingle();
    if (rErr || !room) throw new Error("Room not found");
    const nights = Math.ceil(
      (new Date(data.check_out).getTime() - new Date(data.check_in).getTime()) / 86400000,
    );
    const total = nights * room.price_ngn;
    const { data: created, error } = await sb
      .from("reservations")
      .insert({
        room_id: data.room_id,
        guest_name: data.guest_name,
        guest_email: data.guest_email,
        guest_phone: data.guest_phone,
        check_in: data.check_in,
        check_out: data.check_out,
        total_ngn: total,
        source: "online",
        status: "confirmed",
        payment_status: "pending",
      })
      .select("id, confirmation_code, total_ngn, check_in, check_out")
      .single();
    if (error) {
      if (error.message.toLowerCase().includes("exclude") || error.code === "23P01") {
        throw new Error("This room was just booked for those dates. Please pick different dates or another room.");
      }
      throw new Error(error.message);
    }
    return {
      id: created.id as string,
      confirmation_code: created.confirmation_code as string,
      total_ngn: created.total_ngn as number,
      room_number: room.room_number as string,
      room_name: room.name as string,
      check_in: created.check_in as string,
      check_out: created.check_out as string,
    };
  });

// ---------------- Public: fake Paystack — settle payment (legacy) ----------------
const settleSchema = z.object({
  reservation_id: z.string().uuid(),
  outcome: z.enum(["paid", "failed"]),
});
export const settleFakePayment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => settleSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const reference = "FAKE-PSK-" + Math.random().toString(36).slice(2, 10).toUpperCase();
    const { data: updated, error } = await supabaseAdmin
      .from("reservations")
      .update({
        payment_status: data.outcome,
        payment_reference: data.outcome === "paid" ? reference : null,
        status: data.outcome === "paid" ? "confirmed" : "cancelled",
      })
      .eq("id", data.reservation_id)
      .eq("payment_status", "pending")
      .select("id, confirmation_code, payment_status, payment_reference, check_in, check_out, total_ngn, room_id, rooms(room_number, name)")
      .single();
    if (error) throw new Error(error.message);
    return updated;
  });

// ---------------- Public: verify a real Squadco transaction ----------------
const verifySchema = z.object({
  reservation_id: z.string().uuid(),
  reference: z.string().min(4).max(200),
});
export const verifySquadPayment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => verifySchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();

    // Support mock testing for developers who haven't registered on Squadco yet
    if (data.reference.startsWith("FAKE-SQD-")) {
      const { error: uErr } = await sb
        .from("reservations")
        .update({
          payment_status: "paid",
          payment_reference: data.reference,
          status: "confirmed",
        })
        .eq("id", data.reservation_id);
      if (uErr) throw new Error(uErr.message);
      return { ok: true };
    }

    const secret = process.env.SQUAD_SECRET_KEY;
    if (!secret) throw new Error("Squad secret key not configured");

    const { data: reservation, error: rErr } = await sb
      .from("reservations")
      .select("id, total_ngn, payment_status")
      .eq("id", data.reservation_id)
      .maybeSingle();
    if (rErr || !reservation) throw new Error("Reservation not found");

    const isSandbox = secret.startsWith("sandbox_") || secret.includes("test");
    const baseUrl = isSandbox
      ? "https://sandbox-api-d.squadco.com"
      : "https://api-d.squadco.com";

    const resp = await fetch(`${baseUrl}/transaction/verify/${encodeURIComponent(data.reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const body = (await resp.json()) as { 
      status: number; 
      success: boolean;
      data?: { 
        transaction_status: string; 
        transaction_amount: number; 
        transaction_currency_id: string; 
      } 
    };

    if (!body.success || !body.data) throw new Error("Could not verify transaction with Squadco");

    const ok =
      body.data.transaction_status === "Success" &&
      body.data.transaction_amount === (reservation.total_ngn as number) * 100;

    if (!ok) {
      await sb
        .from("reservations")
        .update({ payment_status: "failed", status: "cancelled" })
        .eq("id", data.reservation_id)
        .eq("payment_status", "pending");
      throw new Error("Payment was not successful");
    }

    const { error: uErr } = await sb
      .from("reservations")
      .update({
        payment_status: "paid",
        payment_reference: data.reference,
        status: "confirmed",
      })
      .eq("id", data.reservation_id);
    if (uErr) throw new Error(uErr.message);
    return { ok: true };
  });


// ---------------- Public: fetch reservation by id (for payment page) ----------------
export const getReservation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("reservations")
      .select("id, guest_name, guest_email, check_in, check_out, total_ngn, payment_status, status, confirmation_code, rooms(room_number, name)")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !row) throw new Error("Reservation not found");
    return row;
  });


// ---------------- Public: submit complaint ----------------
const complaintSchema = z.object({
  guest_name: z.string().min(2).max(120),
  guest_contact: z.string().min(3).max(120),
  subject: z.string().min(2).max(140),
  message: z.string().min(5).max(4000),
});
export const submitComplaint = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => complaintSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("complaints").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- Bootstrap: first signed-in user claims owner ----------------
export const claimOwnerIfFirst = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existingOwner } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("role", "owner")
      .limit(1)
      .maybeSingle();
    if (existingOwner) return { role: null as string | null };
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "owner" });
    if (error) throw new Error(error.message);
    return { role: "owner" as const };
  });

// ---------------- Staff: my role ----------------
export const myRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roles = (data ?? []).map((r) => r.role as string);
    return {
      userId: context.userId,
      email: (context.claims.email as string) ?? "",
      roles,
      isOwner: roles.includes("owner"),
      isStaff: roles.includes("owner") || roles.includes("manager"),
    };
  });

// ---------------- Staff: list reservations ----------------
export const listReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("reservations")
      .select("id, guest_name, guest_email, guest_phone, check_in, check_out, nights, total_ngn, status, source, confirmation_code, created_at, room_id, rooms(room_number, tier, name)")
      .order("check_in", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------------- Staff: walk-in reservation ----------------
const walkInSchema = bookingSchema;
export const createWalkIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => walkInSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: room, error: rErr } = await context.supabase
      .from("rooms")
      .select("id, price_ngn")
      .eq("id", data.room_id)
      .maybeSingle();
    if (rErr || !room) throw new Error("Room not found");
    const nights = Math.ceil(
      (new Date(data.check_out).getTime() - new Date(data.check_in).getTime()) / 86400000,
    );
    const total = nights * room.price_ngn;
    const { data: created, error } = await context.supabase
      .from("reservations")
      .insert({
        room_id: data.room_id,
        guest_name: data.guest_name,
        guest_email: data.guest_email,
        guest_phone: data.guest_phone,
        check_in: data.check_in,
        check_out: data.check_out,
        total_ngn: total,
        source: "walk_in",
        status: "checked_in",
        created_by: context.userId,
      })
      .select("confirmation_code")
      .single();
    if (error) {
      if (error.message.toLowerCase().includes("exclude") || error.code === "23P01") {
        throw new Error("This room already has a booking that overlaps those dates.");
      }
      throw new Error(error.message);
    }
    return { confirmation_code: created.confirmation_code as string };
  });

// ---------------- Staff: update status ----------------
const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["confirmed", "checked_in", "checked_out", "cancelled"]),
});
export const updateReservationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => statusSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("reservations")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- Owner: complaints ----------------
export const listComplaints = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const markComplaintRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("complaints")
      .update({ is_read: true })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- Owner: revenue stats ----------------
export const ownerStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("reservations")
      .select("total_ngn, status, source, check_in, created_at, payment_status");
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const paid = rows.filter((r) => r.payment_status === "paid" || r.source === "walk_in");
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = today.slice(0, 7);
    const active = rows.filter((r) => r.status === "confirmed" || r.status === "checked_in");

    // Group daily revenue for last 30 days
    const dailyMap = new Map<string, number>();
    const monthlyMap = new Map<string, number>();
    for (const r of paid) {
      const d = (r.created_at as string).slice(0, 10);
      const m = d.slice(0, 7);
      dailyMap.set(d, (dailyMap.get(d) ?? 0) + (r.total_ngn as number));
      monthlyMap.set(m, (monthlyMap.get(m) ?? 0) + (r.total_ngn as number));
    }
    const daily = Array.from(dailyMap.entries())
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .slice(0, 30)
      .map(([date, total]) => ({ date, total }));
    const monthly = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .slice(0, 12)
      .map(([month, total]) => ({ month, total }));

    return {
      totalReservations: rows.length,
      totalRoomsBooked: paid.length,
      activeReservations: active.length,
      cancelledReservations: rows.filter((r) => r.status === "cancelled").length,
      onlineCount: rows.filter((r) => r.source === "online").length,
      walkInCount: rows.filter((r) => r.source === "walk_in").length,
      revenueNGN: paid.reduce((s, r) => s + (r.total_ngn as number), 0),
      todayRevenueNGN: dailyMap.get(today) ?? 0,
      monthRevenueNGN: monthlyMap.get(thisMonth) ?? 0,
      daily,
      monthly,
    };
  });

// ---------------- Staff: cancel reservation ----------------
export const cancelReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

