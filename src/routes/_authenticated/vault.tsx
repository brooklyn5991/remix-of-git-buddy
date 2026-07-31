import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ownerStats, listComplaints, markComplaintRead, deleteComplaint, myRole } from "@/lib/hotel.functions";

const currency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const Route = createFileRoute("/_authenticated/vault")({
  head: () => ({ meta: [{ title: "Owner's Vault — Garen's Garden" }] }),
  component: Vault,
});

function Vault() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const fetchStats = useServerFn(ownerStats);
  const fetchComplaints = useServerFn(listComplaints);
  const fetchRole = useServerFn(myRole);
  const mark = useServerFn(markComplaintRead);
  const remove = useServerFn(deleteComplaint);

  const role = useQuery({ queryKey: ["role"], queryFn: () => fetchRole() });
  const stats = useQuery({ queryKey: ["ownerStats"], queryFn: () => fetchStats(), enabled: !!role.data?.isOwner });
  const complaints = useQuery({
    queryKey: ["complaints"],
    queryFn: () => fetchComplaints(),
    enabled: !!role.data?.isOwner,
  });

  const markMut = useMutation({
    mutationFn: (id: string) => mark({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["complaints"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["complaints"] }),
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (role.isLoading) return <p className="pt-32 text-center text-zinc-400 bg-deep min-h-screen">Loading…</p>;

  if (role.data && !role.data.isOwner) {
    return (
      <div className="bg-deep min-h-screen text-gold-light pt-32 px-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">Restricted</p>
        <h1 className="font-serif text-3xl mb-4">Owner access only</h1>
        <p className="text-zinc-400 mb-6">This vault is visible only to the hotel owner.</p>
        <Link to="/dashboard" className="text-gold border-b border-gold/40">
          Back to front desk →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-deep min-h-screen text-gold-light font-sans">
      <header className="border-b border-gold/20 bg-deep/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Owner&rsquo;s Vault</p>
            <h1 className="font-serif text-2xl text-gold-light">Tamper-proof ledger</h1>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <Link to="/dashboard" className="text-zinc-400 hover:text-gold">
              Front Desk
            </Link>
            <button onClick={signOut} className="text-zinc-400 hover:text-gold">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Revenue */}
        <section>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">Revenue Snapshot</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Metric label="Revenue today" value={currency(stats.data?.todayRevenueNGN ?? 0)} />
            <Metric label="Revenue this month" value={currency(stats.data?.monthRevenueNGN ?? 0)} />
            <Metric label="Total revenue (all time)" value={currency(stats.data?.revenueNGN ?? 0)} />
            <Metric label="Total rooms booked" value={stats.data?.totalRoomsBooked ?? 0} />
          </div>
        </section>

        {/* Daily revenue breakdown */}
        <section>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">Daily Revenue (last 30 days)</p>
          <div className="ring-1 ring-gold/20 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-warm/10 text-[10px] uppercase tracking-[0.2em] text-gold/80">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-right p-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(stats.data?.daily ?? []).map((d) => (
                  <tr key={d.date} className="border-t border-gold/10">
                    <td className="p-3 text-zinc-300">{d.date}</td>
                    <td className="p-3 text-right text-gold-light">{currency(d.total)}</td>
                  </tr>
                ))}
                {(!stats.data?.daily || stats.data.daily.length === 0) && (
                  <tr><td colSpan={2} className="p-6 text-center text-zinc-400 text-sm">No revenue yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Monthly revenue breakdown */}
        <section>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">Monthly Revenue</p>
          <div className="ring-1 ring-gold/20 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-warm/10 text-[10px] uppercase tracking-[0.2em] text-gold/80">
                <tr>
                  <th className="text-left p-3">Month</th>
                  <th className="text-right p-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(stats.data?.monthly ?? []).map((m) => (
                  <tr key={m.month} className="border-t border-gold/10">
                    <td className="p-3 text-zinc-300">{m.month}</td>
                    <td className="p-3 text-right text-gold-light">{currency(m.total)}</td>
                  </tr>
                ))}
                {(!stats.data?.monthly || stats.data.monthly.length === 0) && (
                  <tr><td colSpan={2} className="p-6 text-center text-zinc-400 text-sm">No revenue yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>


        {/* Complaints */}
        <section>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">
            Guest Complaints ({(complaints.data ?? []).filter((c) => !c.is_read).length} unread)
          </p>
          <div className="space-y-3">
            {(complaints.data ?? []).map((c) => (
              <div
                key={c.id}
                className={`ring-1 p-5 ${c.is_read ? "ring-gold/10 bg-warm/5" : "ring-gold/40 bg-warm/15"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-serif text-lg text-gold-light">{c.subject}</p>
                    <p className="text-xs text-zinc-400">
                      {c.guest_name} · {c.guest_contact} · {new Date(c.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!c.is_read && (
                      <button
                        onClick={() => markMut.mutate(c.id)}
                        className="text-[10px] uppercase tracking-[0.2em] text-gold border border-gold/40 px-3 py-1 hover:bg-gold hover:text-deep"
                      >
                        Mark read
                      </button>
                    )}
                    {c.is_read &&
                      (confirmId === c.id ? (
                        <>
                          <button
                            onClick={() => {
                              setConfirmId(null);
                              deleteMut.mutate(c.id);
                            }}
                            disabled={deleteMut.isPending}
                            className="text-[10px] uppercase tracking-[0.2em] text-deep bg-red-400 px-3 py-1 disabled:opacity-50"
                          >
                            {deleteMut.isPending ? "Deleting…" : "Confirm"}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 border border-zinc-600 px-3 py-1"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmId(c.id)}
                          className="text-[10px] uppercase tracking-[0.2em] text-red-300 border border-red-400/40 px-3 py-1 hover:bg-red-400 hover:text-deep"
                        >
                          Delete
                        </button>
                      ))}

                  </div>
                </div>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{c.message}</p>
              </div>
            ))}
            {(!complaints.data || complaints.data.length === 0) && (
              <p className="text-zinc-400 text-sm text-center py-10">No complaints. All quiet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-warm/10 ring-1 ring-gold/20 p-5">
      <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-2">{label}</p>
      <p className="font-serif text-2xl text-gold-light">{value}</p>
    </div>
  );
}
