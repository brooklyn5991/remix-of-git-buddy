import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import PaystackPop from "@paystack/inline-js";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { createReservationByTier, listRooms, getBookedRoomIds, verifyPaystackPayment, cancelPendingReservation } from "@/lib/hotel.functions";
import { roomImage } from "@/lib/room-images";
import { openBookingNotifications } from "@/lib/booking-notify";

const currency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const today = () => new Date().toISOString().slice(0, 10);
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const TIERS = { standard: "Standard", deluxe: "Deluxe", executive: "Executive", suite: "Suite" } as const;

const searchSchema = z.object({
  check_in: z.string().optional(),
  check_out: z.string().optional(),
});

export const Route = createFileRoute("/book/$tier")({
  validateSearch: (s) => searchSchema.parse(s),
  head: ({ params }) => {
    const title = TIERS[params.tier as keyof typeof TIERS] ?? "Room";
    return {
      meta: [
        { title: `Book ${title} — Garen's Garden` },
        { name: "description", content: `Reserve a ${title} room at Garen's Garden.` },
        { property: "og:title", content: `Book ${title} — Garen's Garden` },
        { property: "og:description", content: `Reserve a ${title} room at Garen's Garden.` },
      ],
    };
  },
  component: BookTier,
});

function BookTier() {
  const { tier: tierParam } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const tierName = TIERS[tierParam as keyof typeof TIERS];
  if (!tierName) throw notFound();

  const fetchRooms = useServerFn(listRooms);
  const fetchBooked = useServerFn(getBookedRoomIds);
  const reserve = useServerFn(createReservationByTier);
  const verifyPaystack = useServerFn(verifyPaystackPayment);
  const cancelPending = useServerFn(cancelPendingReservation);

  const [checkIn, setCheckIn] = useState(search.check_in || today());
  const [checkOut, setCheckOut] = useState(search.check_out || tomorrow());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [payError, setPayError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const roomsQuery = useQuery({ queryKey: ["rooms"], queryFn: () => fetchRooms() });
  const bookedQuery = useQuery({
    queryKey: ["booked", checkIn, checkOut],
    queryFn: () => fetchBooked({ data: { check_in: checkIn, check_out: checkOut } }),
    enabled: !!checkIn && !!checkOut && checkOut > checkIn,
  });

  const tierRooms = (roomsQuery.data ?? []).filter((r) => r.tier === tierName);
  const sample = tierRooms[0];
  const price = tierRooms.length ? Math.min(...tierRooms.map((r) => r.price_ngn)) : 0;
  const bookedSet = new Set(bookedQuery.data ?? []);
  const availableCount = tierRooms.filter((r) => !bookedSet.has(r.id)).length;
  const soldOut = tierRooms.length > 0 && !bookedQuery.isLoading && availableCount === 0;

  const nights = Math.max(
    1,
    Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000),
  );
  const total = nights * price;

  const mutation = useMutation({
    mutationFn: (payload: {
      tier: "Standard" | "Deluxe" | "Executive" | "Suite";
      guest_name: string;
      guest_email: string;
      guest_phone: string;
      check_in: string;
      check_out: string;
    }) => reserve({ data: payload }),
    onSuccess: async (res) => {
      setPayError(null);
      const pk = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;
      if (!pk) {
        setPayError("Payment is not configured. Please contact the hotel.");
        return;
      }
      try {
        const paystack = new PaystackPop();
        setProcessing(true);
        paystack.newTransaction({
          key: pk,
          email,
          amount: res.total_ngn * 100, // kobo
          currency: "NGN",
          metadata: {
            guest_name: name,
            whatsapp_phone: phone,
            room_category: tierName,
            reservation_id: res.id,
            confirmation_code: res.confirmation_code,
          },
          onSuccess: async (tx) => {
            try {
              const verified = await verifyPaystack({ data: { reservation_id: res.id, reference: tx.reference } });
              openBookingNotifications(verified.reservation);
              navigate({ to: "/reservation/$id", params: { id: res.id }, search: { paid: 1 } });
            } catch (err) {
              setPayError((err as Error).message);
            } finally {
              setProcessing(false);
            }
          },
          onCancel: () => {
            setProcessing(false);
            setPayError("Payment cancelled. Try again to confirm.");
          },
          onError: (err) => {
            setProcessing(false);
            setPayError((err as Error)?.message || "Payment failed.");
          },
        });
      } catch (err) {
        setProcessing(false);
        setPayError((err as Error).message);
      }
    },
    onError: (err: Error) => setPayError(err.message),
  });

  if (roomsQuery.isLoading) {
    return (
      <div className="bg-deep min-h-screen text-gold-light">
        <SiteNav />
        <p className="pt-32 text-center text-zinc-400">Loading…</p>
      </div>
    );
  }
  if (!sample) throw notFound();

  return (
    <div className="bg-deep font-sans text-gold-light min-h-screen antialiased">
      <SiteNav />
      <main className="pt-24 pb-24 md:pb-32 overflow-x-hidden">
        <section className="px-4 sm:px-6 max-w-7xl mx-auto pt-8">
          <Link to="/rooms" className="text-[10px] uppercase tracking-[0.3em] text-gold/70 hover:text-gold">
            ← All rooms
          </Link>
        </section>

        <section className="px-4 sm:px-6 max-w-7xl mx-auto pt-6 grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="aspect-[16/10] lg:aspect-[4/3] overflow-hidden max-h-[420px] lg:max-h-none">
              <img src={roomImage(sample.image_slug)} alt={`${tierName} room`} className="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-3">{tierName} Collection</p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-gold-light leading-tight mb-4">
              The {tierName} Room
            </h1>
            <p className="text-zinc-300/85 leading-relaxed mb-6">{sample.description}</p>

            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y border-gold/10 mb-8">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-gold/60 mb-1">Bed</dt>
                <dd className="text-sm text-zinc-200">{sample.bed}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-gold/60 mb-1">Size</dt>
                <dd className="text-sm text-zinc-200">{sample.size}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-gold/60 mb-1">Sleeps</dt>
                <dd className="text-sm text-zinc-200">{sample.sleeps}</dd>
              </div>
            </dl>

            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-3">In this room</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-zinc-300/85">
                {((sample.features as string[] | null) ?? []).map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-gold/60">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-warm/10 ring-1 ring-gold/20 p-4 sm:p-6">
              {soldOut ? (
                <div className="text-center py-6">
                  <p className="font-serif text-xl text-gold mb-2">Fully booked for these dates</p>
                  <p className="text-sm text-zinc-400">Try different dates or another category.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    mutation.mutate({
                      tier: tierName,
                      guest_name: name,
                      guest_email: email,
                      guest_phone: phone,
                      check_in: checkIn,
                      check_out: checkOut,
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-2">Check-in</label>
                      <input type="date" value={checkIn} min={today()} onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full bg-deep border border-gold/30 text-gold-light px-3 py-2 focus:border-gold outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-2">Check-out</label>
                      <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full bg-deep border border-gold/30 text-gold-light px-3 py-2 focus:border-gold outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-2">Full name</label>
                    <input required value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-deep border border-gold/30 text-gold-light px-3 py-2 focus:border-gold outline-none" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-2">Email</label>
                      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-deep border border-gold/30 text-gold-light px-3 py-2 focus:border-gold outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-2">WhatsApp Contact Number</label>
                      <input
                        required
                        type="tel"
                        placeholder="e.g. 08103129471"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-deep border border-gold/30 text-gold-light px-3 py-2 focus:border-gold outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gold/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-gold/60">Total · {nights} night{nights > 1 ? "s" : ""}</p>
                      <p className="font-serif text-2xl text-gold">{currency(total)}</p>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mt-1">
                        {bookedQuery.isLoading ? "Checking availability…" : `${availableCount} ${tierName} room${availableCount === 1 ? "" : "s"} available`}
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={mutation.isPending || processing}
                      className="text-[11px] uppercase tracking-[0.3em] text-deep bg-gold hover:bg-gold-light disabled:opacity-50 px-6 py-3 transition-colors"
                    >
                      {processing ? "Processing…" : mutation.isPending ? "Reserving…" : "Reserve & Pay"}
                    </button>
                  </div>

                  {payError && <p className="text-red-400 text-sm">{payError}</p>}
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
