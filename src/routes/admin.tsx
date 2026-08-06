import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { adminLogin, adminListReservedRooms, adminCreateManualBooking } from "@/lib/hotel.functions";
import { supabase } from "@/integrations/supabase/client";



const currency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const CREDS_KEY = "gg_admin_creds_v1";

type Creds = { username: string; password: string };

function loadCreds(): Creds | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CREDS_KEY);
    return raw ? (JSON.parse(raw) as Creds) : null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Garen's Garden" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [creds, setCreds] = useState<Creds | null>(null);

  useEffect(() => {
    setCreds(loadCreds());
  }, []);

  if (!creds) {
    return <AdminLogin onLoggedIn={setCreds} />;
  }
  return <AdminDashboard creds={creds} onSignOut={() => {
    sessionStorage.removeItem(CREDS_KEY);
    setCreds(null);
    navigate({ to: "/", replace: true });
  }} />;
}


function AdminLogin({ onLoggedIn }: { onLoggedIn: (c: Creds) => void }) {
  const login = useServerFn(adminLogin);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: (v: Creds) => login({ data: v }),
    onSuccess: (_data, vars) => {
      sessionStorage.setItem(CREDS_KEY, JSON.stringify(vars));
      onLoggedIn(vars);
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="bg-deep min-h-screen flex items-center justify-center px-4 text-gold-light font-sans">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          mut.mutate({ username: username.trim(), password });
        }}
        className="w-full max-w-sm bg-warm/10 ring-1 ring-gold/20 p-8 space-y-5"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Admin</p>
          <h1 className="font-serif text-2xl text-gold-light mt-1">Restricted Access</h1>
          <p className="text-xs text-zinc-400 mt-2">Enter administrator credentials to continue.</p>
        </div>

        <label className="block text-xs uppercase tracking-[0.2em] text-gold/80">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full bg-deep border border-gold/30 px-3 py-2 text-sm text-gold-light focus:outline-none focus:border-gold"
            autoComplete="username"
            required
          />
        </label>
        <label className="block text-xs uppercase tracking-[0.2em] text-gold/80">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full bg-deep border border-gold/30 px-3 py-2 text-sm text-gold-light focus:outline-none focus:border-gold"
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={mut.isPending}
          className="w-full bg-gold text-deep font-medium py-2 text-sm uppercase tracking-[0.2em] hover:bg-gold-light disabled:opacity-60"
        >
          {mut.isPending ? "Verifying…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function AdminDashboard({ creds, onSignOut }: { creds: Creds; onSignOut: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const list = useServerFn(adminListReservedRooms);
  const q = useQuery({
    queryKey: ["admin-reserved", creds.username],
    queryFn: () => list({ data: creds }),
    refetchInterval: 15_000,
  });

  // Live-refresh on any reservation change (paid via webhook, status change, etc).
  useEffect(() => {
    const channel = supabase
      .channel("admin-reservations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        () => { queryClient.invalidateQueries({ queryKey: ["admin-reserved", creds.username] }); },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient, creds.username]);


  useEffect(() => {
    if (q.error) {
      // Bad creds or server issue — force re-login.
      const msg = (q.error as Error).message || "";
      if (msg.toLowerCase().includes("invalid")) {
        sessionStorage.removeItem(CREDS_KEY);
        navigate({ to: "/admin", replace: true });
      }
    }
  }, [q.error, navigate]);

  const rows = q.data ?? [];

  return (
    <div className="bg-deep min-h-screen text-gold-light font-sans">
      <header className="border-b border-gold/20 bg-deep/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Administrator</p>
            <h1 className="font-serif text-2xl text-gold-light">Reserved Rooms</h1>
            <p className="text-[10px] tracking-[0.15em] text-zinc-500 mt-1">
              52 New Sapele/Agbor Road, Obiaruku, Delta State
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <span className="text-zinc-400">{creds.username}</span>
            <button onClick={onSignOut} className="text-zinc-400 hover:text-gold">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <AdminManualBooking creds={creds} onBooked={() => q.refetch()} />

        <div className="flex items-baseline justify-between">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">All Reserved Rooms</p>
          <p className="text-xs text-zinc-400">{rows.length} paid booking{rows.length === 1 ? "" : "s"}</p>
        </div>

        <div className="ring-1 ring-gold/20 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-warm/10 text-[10px] uppercase tracking-[0.2em] text-gold/80">
              <tr>
                <th className="text-left p-3">Room #</th>
                <th className="text-left p-3">Confirmation</th>
                <th className="text-left p-3">Guest</th>
                <th className="text-left p-3">WhatsApp</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Amount Paid</th>
                <th className="text-left p-3">Payment Method</th>
                <th className="text-left p-3">Dates</th>
                <th className="text-left p-3">Booked At</th>
              </tr>
            </thead>
            <tbody>
              {q.isLoading && (
                <tr><td colSpan={9} className="p-8 text-center text-zinc-400 text-sm">Loading…</td></tr>
              )}
              {!q.isLoading && rows.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-zinc-400 text-sm">No reserved rooms yet.</td></tr>
              )}

              {rows.map((r) => {
                const room = r.rooms as { room_number?: string; tier?: string; name?: string } | null;
                return (
                  <tr key={r.id as string} className="border-t border-gold/10 hover:bg-warm/5">
                    <td className="p-3 font-mono text-gold">{room?.room_number ?? "—"}</td>
                    <td className="p-3 font-mono text-xs text-gold-light">{r.confirmation_code as string}</td>
                    <td className="p-3">
                      <div>{r.guest_name as string}</div>
                      <div className="text-xs text-zinc-400">{r.guest_email as string}</div>
                    </td>
                    <td className="p-3 text-xs text-zinc-200">{r.guest_phone as string}</td>
                    <td className="p-3 text-xs">{room?.tier ?? "—"}</td>
                    <td className="p-3">{currency(r.total_ngn as number)}</td>
                    <td className="p-3 text-xs">
                      <span className="inline-block px-2 py-0.5 ring-1 ring-gold/30 uppercase tracking-[0.15em] text-[10px] text-gold-light">
                        {methodLabel(r.payment_method as string | null)}
                      </span>
                    </td>

                    <td className="p-3 text-xs text-zinc-300">
                      {r.check_in as string} → {r.check_out as string}
                    </td>
                    <td className="p-3 text-xs text-zinc-400">
                      {new Date(r.created_at as string).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {q.error && (
          <p className="text-xs text-red-400">{(q.error as Error).message}</p>
        )}
      </main>
    </div>
  );
}

function methodLabel(m: string | null) {
  if (m === "cash") return "Cash";
  if (m === "pos") return "POS";
  return "Paystack";
}

const TIERS = ["Standard", "Deluxe", "Executive", "Suite"] as const;

function AdminManualBooking({ creds, onBooked }: { creds: Creds; onBooked: () => void }) {
  const book = useServerFn(adminCreateManualBooking);
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState<(typeof TIERS)[number]>("Standard");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [method, setMethod] = useState<"cash" | "pos" | "">("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ confirmation_code: string; room_number: string; guest_name: string } | null>(null);

  const mut = useMutation({
    mutationFn: () =>
      book({
        data: {
          ...creds,
          tier,
          guest_name: guestName.trim(),
          guest_email: guestEmail.trim(),
          guest_phone: guestPhone.trim(),
          check_in: checkIn,
          check_out: checkOut,
          payment_method: method as "cash" | "pos",
        },
      }),
    onSuccess: (r) => {
      setResult({ confirmation_code: r.confirmation_code, room_number: r.room_number, guest_name: guestName.trim() });
      setGuestName(""); setGuestEmail(""); setGuestPhone(""); setCheckIn(""); setCheckOut(""); setMethod("");
      onBooked();
    },
    onError: (e: Error) => setError(e.message),
  });

  const field = "mt-1 w-full bg-deep border border-gold/30 px-3 py-2 text-sm text-gold-light focus:outline-none focus:border-gold";
  const label = "block text-[10px] uppercase tracking-[0.2em] text-gold/80";

  return (
    <section className="ring-1 ring-gold/20 bg-warm/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span>
          <span className="block text-[10px] uppercase tracking-[0.3em] text-gold">Manual Booking</span>
          <span className="block font-serif text-lg text-gold-light">Walk-in / Offline (Cash or POS)</span>
        </span>
        <span className="text-gold text-sm">{open ? "Close" : "New booking"}</span>
      </button>

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            setResult(null);
            if (!method) { setError("Select a payment method (Cash or POS)."); return; }
            mut.mutate();
          }}
          className="px-6 pb-6 grid gap-4 sm:grid-cols-2"
        >
          <label className={label}>
            Room category
            <select value={tier} onChange={(e) => setTier(e.target.value as (typeof TIERS)[number])} className={field}>
              {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>

          <label className={label}>
            Payment method (required)
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as "cash" | "pos" | "")}
              className={field}
              required
            >
              <option value="">Select…</option>
              <option value="cash">Cash</option>
              <option value="pos">POS</option>
            </select>
          </label>

          <label className={label}>
            Guest name
            <input value={guestName} onChange={(e) => setGuestName(e.target.value)} className={field} required minLength={2} />
          </label>
          <label className={label}>
            Guest email
            <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className={field} required />
          </label>
          <label className={label}>
            WhatsApp number
            <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className={field} required minLength={6} />
          </label>
          <div />
          <label className={label}>
            Check-in
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={field} required />
          </label>
          <label className={label}>
            Check-out
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={field} required />
          </label>

          <div className="sm:col-span-2 flex items-center gap-4">
            <button
              type="submit"
              disabled={mut.isPending}
              className="bg-gold text-deep font-medium px-6 py-2 text-xs uppercase tracking-[0.2em] hover:bg-gold-light disabled:opacity-60"
            >
              {mut.isPending ? "Booking…" : "Confirm booking"}
            </button>
            <span className="text-[10px] text-zinc-500">No online payment is charged — payment is collected at the desk.</span>
          </div>

          {error && <p className="sm:col-span-2 text-xs text-red-400">{error}</p>}
        </form>
      )}

      {result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          role="alertdialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-deep ring-2 ring-gold p-8 text-center space-y-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Booking Confirmed Successfully!</p>
            <h2 className="font-serif text-2xl font-bold text-gold-light leading-snug">
              Success! Booking Confirmed for {result.guest_name} in Room {result.room_number}.
            </h2>
            <p className="text-sm text-zinc-300">
              Confirmation code:{" "}
              <span className="font-mono text-gold">{result.confirmation_code}</span>
            </p>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="w-full bg-gold text-deep font-medium py-2 text-xs uppercase tracking-[0.2em] hover:bg-gold-light"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
