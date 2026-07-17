import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  listReservations,
  listRooms,
  updateReservationStatus,
  cancelReservation,
  myRole,
} from "@/lib/hotel.functions";


const currency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Front Desk — Garen's Garden" }] }),
  component: Dashboard,
});

function Dashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const fetchRes = useServerFn(listReservations);
  const fetchRooms = useServerFn(listRooms);
  const fetchRole = useServerFn(myRole);
  const setStatus = useServerFn(updateReservationStatus);
  const cancel = useServerFn(cancelReservation);


  const role = useQuery({ queryKey: ["role"], queryFn: () => fetchRole() });
  const rooms = useQuery({ queryKey: ["rooms"], queryFn: () => fetchRooms() });
  const reservations = useQuery({ queryKey: ["reservations"], queryFn: () => fetchRes() });

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "confirmed" | "checked_in" | "checked_out" | "cancelled" }) =>
      setStatus({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
  const cancelMut = useMutation({
    mutationFn: (id: string) => cancel({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
    },
  });


  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  // Metrics computed from reservations list.
  const allRes = reservations.data ?? [];
  const totalRooms = rooms.data?.length ?? 0;
  
  // A room is occupied today if it has an active reservation (pending, confirmed, or checked_in) overlapping today.
  const todayStr = new Date().toISOString().slice(0, 10);
  const occupiedToday = allRes.filter((r) => 
    (r.status === "confirmed" || r.status === "checked_in" || r.status === "pending") &&
    r.check_in <= todayStr &&
    r.check_out >= todayStr
  );
  
  const active = allRes.filter((r) => r.status === "confirmed" || r.status === "checked_in" || r.status === "pending");
  const inHouse = allRes.filter((r) => r.status === "checked_in");
  const availableNow = totalRooms - occupiedToday.length;



  return (
    <div className="bg-deep min-h-screen text-gold-light font-sans">
      <header className="border-b border-gold/20 bg-deep/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Front Desk</p>
            <h1 className="font-serif text-2xl text-gold-light">Garen&rsquo;s Garden</h1>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <span className="text-zinc-400">{role.data?.email}</span>
            {role.data?.isOwner && (
              <Link to="/vault" className="text-gold border-b border-gold/40 pb-0.5 hover:border-gold">
                Owner&rsquo;s Vault →
              </Link>
            )}
            <button onClick={signOut} className="text-zinc-400 hover:text-gold">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard label="Rooms available now" value={availableNow} sub={`of ${totalRooms}`} />
          <MetricCard label="Active reservations" value={active.length} />
        </section>

        {/* Reservations table */}
        <section>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">All Reservations</p>
          <div className="ring-1 ring-gold/20 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-warm/10 text-[10px] uppercase tracking-[0.2em] text-gold/80">
                <tr>
                  <th className="text-left p-3">Code</th>
                  <th className="text-left p-3">Guest</th>
                  <th className="text-left p-3">Room</th>
                  <th className="text-left p-3">Dates</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">Source</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {(reservations.data ?? []).map((r) => (
                  <tr key={r.id} className="border-t border-gold/10 hover:bg-warm/5">
                    <td className="p-3 font-mono text-gold text-xs">{r.confirmation_code}</td>
                    <td className="p-3">
                      <div>{r.guest_name}</div>
                      <div className="text-xs text-zinc-400">{r.guest_email}</div>

                    </td>
                    <td className="p-3 text-xs">
                      {(r as unknown as { rooms?: { room_number?: string; tier?: string } }).rooms?.room_number} ·{" "}
                      {(r as unknown as { rooms?: { room_number?: string; tier?: string } }).rooms?.tier}
                    </td>
                    <td className="p-3 text-xs text-zinc-300">
                      {r.check_in} → {r.check_out}
                    </td>
                    <td className="p-3">{currency(r.total_ngn as number)}</td>
                    <td className="p-3 text-xs">
                      <span className={r.source === "online" ? "text-gold" : "text-zinc-300"}>
                        {r.source === "online" ? "Online" : "Walk-in"}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={r.status as string}
                        onChange={(e) =>
                          statusMut.mutate({ id: r.id as string, status: e.target.value as never })
                        }
                        className="bg-deep border border-gold/30 text-gold-light px-2 py-1 text-xs"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="checked_in">Checked in</option>
                        <option value="checked_out">Checked out</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3">
                      {r.status !== "cancelled" && (
                        <button
                          onClick={() => {
                            if (confirm(`Cancel reservation ${r.confirmation_code}?`)) {
                              cancelMut.mutate(r.id as string);
                            }
                          }}
                          className="text-[10px] uppercase tracking-[0.2em] text-red-300 border border-red-300/40 px-2 py-1 hover:bg-red-500/20"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {(!reservations.data || reservations.data.length === 0) && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-zinc-400 text-sm">

                      No reservations yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-warm/10 ring-1 ring-gold/20 p-5">
      <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-2">{label}</p>
      <p className="font-serif text-3xl text-gold-light">
        {value}
        {sub && <span className="text-sm text-zinc-400 ml-2">{sub}</span>}
      </p>
    </div>
  );
}
