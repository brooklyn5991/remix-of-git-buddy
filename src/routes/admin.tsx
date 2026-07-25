import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { adminLogin, adminListReservedRooms } from "@/lib/hotel.functions";
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

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
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
                <th className="text-left p-3">Dates</th>
                <th className="text-left p-3">Booked At</th>
              </tr>
            </thead>
            <tbody>
              {q.isLoading && (
                <tr><td colSpan={8} className="p-8 text-center text-zinc-400 text-sm">Loading…</td></tr>
              )}
              {!q.isLoading && rows.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-zinc-400 text-sm">No reserved rooms yet.</td></tr>
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
