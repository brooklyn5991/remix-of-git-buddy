import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2, Calendar, MapPin, CreditCard, User, Tag } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getReservation } from "@/lib/hotel.functions";

const currency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const Route = createFileRoute("/reservation/$id")({
  validateSearch: (s) => z.object({ paid: z.coerce.number().optional() }).parse(s),
  head: () => ({ meta: [{ title: "Reservation Ticket — Garen's Garden" }] }),
  component: ReservationPage,
});

function ReservationPage() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const fetchRes = useServerFn(getReservation);
  const res = useQuery({ queryKey: ["reservation", id], queryFn: () => fetchRes({ data: { id } }) });

  const r = res.data as
    | {
        confirmation_code: string;
        total_ngn: number;
        check_in: string;
        check_out: string;
        payment_status: string;
        status: string;
        guest_email: string;
        guest_name: string;
        rooms: { room_number: string; name: string } | null;
      }
    | undefined;

  const paid = search.paid === 1 || r?.payment_status === "paid";

  useEffect(() => {
    if (paid && r?.guest_email) {
      toast.success("Payment Successful!", {
        description: `Booking details and receipt have been sent to ${r.guest_email}.`,
        duration: 8000,
        position: "top-center",
      });
    }
  }, [paid, r?.guest_email]);

  return (
    <div className="bg-deep font-sans text-gold-light min-h-screen antialiased flex flex-col justify-between">
      <SiteNav />
      
      <main className="pt-28 pb-20 px-4 max-w-2xl mx-auto w-full flex-grow flex flex-col justify-center">
        {res.isLoading || !r ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold mb-4"></div>
            <p className="text-zinc-400">Retrieving ticket details…</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Payment Successful Banner */}
            {paid && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-300">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
                <div>
                  <p className="font-semibold text-sm">Payment Successful via Squadco</p>
                  <p className="text-xs text-emerald-300/80">
                    A confirmation email with your invoice was successfully sent to <span className="font-medium underline">{r.guest_email}</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Ticket Container */}
            <div className="relative bg-zinc-950 border border-gold/30 rounded-3xl overflow-hidden shadow-2xl shadow-black/80">
              
              {/* Top/Header Section of Ticket */}
              <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 sm:p-8 border-b border-gold/10 relative">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.3em] text-gold/70 block mb-1">Boutique Hotel</span>
                    <h2 className="font-serif text-2xl text-gold-light tracking-wide">Garen&rsquo;s Garden</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-gold/70 block mb-1">Status</span>
                    <span className={`inline-block text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full ${
                      paid ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    }`}>
                      {paid ? "Confirmed" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-between items-stretch gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Guest Details</p>
                    <div className="flex items-center gap-2 text-zinc-200">
                      <User className="h-4 w-4 text-gold/60" />
                      <span className="font-medium text-sm sm:text-base">{r.guest_name}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Confirmation Code</p>
                    <div className="flex items-center gap-2 text-gold-light">
                      <Tag className="h-4 w-4 text-gold/60" />
                      <span className="font-mono font-bold tracking-widest text-base sm:text-lg">{r.confirmation_code}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Notches & Perforation Line */}
              <div className="relative h-6 bg-zinc-950">
                {/* Left Notch */}
                <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-deep border-r border-gold/30"></div>
                {/* Right Notch */}
                <div className="absolute -right-3 top-0 w-6 h-6 rounded-full bg-deep border-l border-gold/30"></div>
                {/* Perforation Line */}
                <div className="absolute inset-x-4 top-3 border-t border-dashed border-gold/20"></div>
              </div>

              {/* Middle/Room Details Section */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-gold/80 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Accommodation</p>
                      <p className="text-sm font-semibold text-zinc-200">Room {r.rooms?.room_number}</p>
                      <p className="text-xs text-zinc-400">{r.rooms?.name}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Calendar className="h-5 w-5 text-gold/80 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Schedule</p>
                      <div className="text-sm font-semibold text-zinc-200">
                        {r.check_in}
                      </div>
                      <div className="text-xs text-zinc-400">
                        to {r.check_out}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gold/10 pt-6 grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Payment Method</p>
                    <div className="flex items-center gap-1 text-sm font-semibold text-zinc-200">
                      <CreditCard className="h-3.5 w-3.5 text-gold/60" />
                      <span>Squadco</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Total NGN</p>
                    <p className="text-sm font-bold text-gold-light">{currency(r.total_ngn)}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Payment Status</p>
                    <p className={`text-sm font-semibold ${paid ? "text-emerald-400" : "text-amber-400"}`}>
                      {r.payment_status.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Perforation */}
              <div className="relative h-6 bg-zinc-950">
                <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-deep border-r border-gold/30"></div>
                <div className="absolute -right-3 top-0 w-6 h-6 rounded-full bg-deep border-l border-gold/30"></div>
                <div className="absolute inset-x-4 top-3 border-t border-dashed border-gold/20"></div>
              </div>

              {/* Barcode/Ticket Footer Section */}
              <div className="bg-zinc-950 p-6 sm:p-8 flex flex-col items-center justify-center border-t border-gold/10">
                {/* SVG Barcode */}
                <div className="w-full max-w-[280px] h-14 bg-zinc-900/50 p-2 rounded-lg border border-gold/10 flex items-center justify-center">
                  <svg className="w-full h-full text-zinc-200 fill-current opacity-80" viewBox="0 0 100 30" preserveAspectRatio="none">
                    {/* Generates a stylized barcode pattern */}
                    <rect x="2" y="2" width="2" height="26" />
                    <rect x="6" y="2" width="1" height="26" />
                    <rect x="9" y="2" width="3" height="26" />
                    <rect x="14" y="2" width="1" height="26" />
                    <rect x="17" y="2" width="2" height="26" />
                    <rect x="21" y="2" width="4" height="26" />
                    <rect x="27" y="2" width="1" height="26" />
                    <rect x="30" y="2" width="2" height="26" />
                    <rect x="34" y="2" width="1" height="26" />
                    <rect x="37" y="2" width="3" height="26" />
                    <rect x="42" y="2" width="2" height="26" />
                    <rect x="46" y="2" width="1" height="26" />
                    <rect x="49" y="2" width="4" height="26" />
                    <rect x="55" y="2" width="2" height="26" />
                    <rect x="59" y="2" width="1" height="26" />
                    <rect x="62" y="2" width="3" height="26" />
                    <rect x="67" y="2" width="1" height="26" />
                    <rect x="70" y="2" width="2" height="26" />
                    <rect x="74" y="2" width="4" height="26" />
                    <rect x="80" y="2" width="1" height="26" />
                    <rect x="83" y="2" width="2" height="26" />
                    <rect x="87" y="2" width="1" height="26" />
                    <rect x="90" y="2" width="3" height="26" />
                    <rect x="95" y="2" width="2" height="26" />
                  </svg>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono tracking-widest mt-2">{r.confirmation_code}</span>

                <div className="mt-6 text-center">
                  {paid ? (
                    <p className="text-xs text-zinc-400">
                      Show this ticket at reception upon arrival. Check-in starts at 3:00 PM.
                    </p>
                  ) : (
                    <p className="text-xs text-amber-300">
                      This reservation is pending payment. Check-in cannot be completed until payment succeeds.
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* Back Button */}
            <div className="text-center">
              <Link
                to="/rooms"
                className="inline-block text-[10px] uppercase tracking-[0.3em] text-gold border-b border-gold/40 hover:border-gold pb-1 transition-colors"
              >
                ← Back to rooms
              </Link>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
