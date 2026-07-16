import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getReservation, settleFakePayment } from "@/lib/hotel.functions";

const currency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const Route = createFileRoute("/squadco/$id")({
  head: () => ({ meta: [{ title: "Secure Payment — Squad (Test)" }] }),
  component: FakeSquadcoPage,
});

function FakeSquadcoPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const fetchRes = useServerFn(getReservation);
  const settle = useServerFn(settleFakePayment);

  const res = useQuery({ queryKey: ["reservation", id], queryFn: () => fetchRes({ data: { id } }) });

  const mut = useMutation({
    mutationFn: (outcome: "paid" | "failed") => settle({ data: { reservation_id: id, outcome } }),
    onSuccess: (_r, outcome) => {
      navigate({ to: "/reservation/$id", params: { id }, search: { paid: outcome === "paid" ? 1 : 0 } });
    },
  });

  if (res.isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Loading payment…</div>;
  if (!res.data) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Reservation not found</div>;
  const r = res.data as { total_ngn: number; guest_email: string; guest_name: string; confirmation_code: string; payment_status: string; check_in: string; check_out: string };

  const alreadyPaid = r.payment_status === "paid";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col justify-between">
      <div>
        {/* Squadco Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#E35425] to-[#f07b54] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              S
            </div>
            <span className="font-bold text-slate-800 tracking-tight">squad</span>
            <span className="text-[10px] uppercase font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 ml-2">
              Sandbox
            </span>
          </div>
        </div>

        <main className="max-w-2xl mx-auto px-6 py-10">
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Paying Garen&rsquo;s Garden Hotel</p>
                <p className="text-3xl font-extrabold tracking-tight text-white">{currency(r.total_ngn)}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs text-slate-400">Customer</p>
                <p className="text-sm font-semibold text-orange-400">{r.guest_email}</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-slate-500 text-xs">Guest Name</p>
                  <p className="text-slate-800 font-medium">{r.guest_name}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Booking Code</p>
                  <p className="text-slate-800 font-mono font-semibold">{r.confirmation_code}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Check-in</p>
                  <p className="text-slate-800 font-medium">{r.check_in}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Check-out</p>
                  <p className="text-slate-800 font-medium">{r.check_out}</p>
                </div>
              </div>

              {alreadyPaid ? (
                <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800 text-center font-medium">
                  This reservation has already been paid.
                </div>
              ) : (
                <>
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Simulated Card Details</p>
                    <div className="relative">
                      <input
                        readOnly
                        value="5061 1234 5678 9010"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 bg-slate-50 focus:outline-none"
                      />
                      <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-mono font-bold">Verve</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        readOnly
                        value="12 / 30"
                        className="border border-slate-200 rounded-xl px-4 py-3 text-slate-700 bg-slate-50 focus:outline-none"
                      />
                      <input
                        readOnly
                        value="123"
                        className="border border-slate-200 rounded-xl px-4 py-3 text-slate-700 bg-slate-50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-3">
                    <button
                      onClick={() => mut.mutate("paid")}
                      disabled={mut.isPending}
                      className="w-full bg-[#E35425] hover:bg-[#c94519] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/10 active:scale-[0.98] disabled:opacity-50"
                    >
                      {mut.isPending ? "Processing..." : `Pay ${currency(r.total_ngn)}`}
                    </button>
                    <button
                      onClick={() => mut.mutate("failed")}
                      disabled={mut.isPending}
                      className="w-full text-slate-500 hover:text-slate-700 text-sm font-semibold py-2 transition-colors"
                    >
                      Cancel Payment
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
        This is a simulated Squadco checkout interface for testing. No real money will be charged.
      </footer>
    </div>
  );
}
