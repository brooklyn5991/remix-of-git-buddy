import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { listRooms, createOnlineReservation, getBookedRoomIds, verifyPaystackPayment } from "@/lib/hotel.functions";
import { roomImage } from "@/lib/room-images";


const currency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const searchSchema = z.object({
  check_in: z.string().optional(),
  check_out: z.string().optional(),
});

export const Route = createFileRoute("/rooms/$slug")({
  validateSearch: (s) => searchSchema.parse(s),
  head: ({ params }) => ({
    meta: [
      { title: `Room ${params.slug} — Garen's Garden` },
      { name: "description", content: `Reserve Room ${params.slug} at Garen's Garden.` },
    ],
  }),
  component: RoomDetail,
});

function RoomDetail() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const fetchRooms = useServerFn(listRooms);
  const fetchBooked = useServerFn(getBookedRoomIds);
  const reserve = useServerFn(createOnlineReservation);

  const roomsQuery = useQuery({ queryKey: ["rooms"], queryFn: () => fetchRooms() });
  const room = (roomsQuery.data ?? []).find((r) => r.room_number === slug);

  const today = () => {
    return new Date().toISOString().slice(0, 10);
  };
  const tomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  const [checkIn, setCheckIn] = useState(search.check_in || today());
  const [checkOut, setCheckOut] = useState(search.check_out || tomorrow());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const bookedQuery = useQuery({
    queryKey: ["booked", checkIn, checkOut],
    queryFn: () => fetchBooked({ data: { check_in: checkIn, check_out: checkOut } }),
    enabled: !!checkIn && !!checkOut && checkOut > checkIn,
  });

  const verify = useServerFn(verifyPaystackPayment);
  const [payError, setPayError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: {
      room_id: string;
      guest_name: string;
      guest_email: string;
      guest_phone: string;
      check_in: string;
      check_out: string;
    }) => reserve({ data }),
    onSuccess: async (res) => {
      setPayError(null);
      const pk = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;
      if (!pk) {
        setPayError("Paystack public key is not configured.");
        return;
      }
      const { default: PaystackPop } = await import("@paystack/inline-js");
      const popup = new PaystackPop();
      popup.newTransaction({
        key: pk,
        email: email,
        amount: res.total_ngn * 100,
        currency: "NGN",
        metadata: {
          reservation_id: res.id,
          confirmation_code: res.confirmation_code,
          room_number: res.room_number,
          guest_name: name,
          guest_phone: phone,
        },
        onSuccess: async (tx) => {
          try {
            setVerifying(true);
            await verify({ data: { reservation_id: res.id, reference: tx.reference } });
            navigate({ to: "/reservation/$id", params: { id: res.id }, search: { paid: 1 } });
          } catch (err) {
            setPayError((err as Error).message);
          } finally {
            setVerifying(false);
          }
        },
        onCancel: () => {
          setPayError("Payment cancelled. Your reservation is still pending — try again to confirm.");
        },
      });
    },
  });


  if (roomsQuery.isLoading) {
    return (
      <div className="bg-deep min-h-screen text-gold-light">
        <SiteNav />
        <p className="pt-32 text-center text-zinc-400">Loading…</p>
      </div>
    );
  }
  if (!room) throw notFound();

  const nights = Math.max(
    1,
    Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000),
  );
  const total = nights * room.price_ngn;
  const isBooked = (bookedQuery.data ?? []).includes(room.id);

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
              <img src={roomImage(room.image_slug)} alt={room.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-3">
              {room.tier} · Floor {room.floor} · Room {room.room_number}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-gold-light leading-tight mb-4">
              {room.name}
            </h1>
            <p className="text-zinc-300/85 leading-relaxed mb-6">{room.description}</p>

            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y border-gold/10 mb-8">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-gold/60 mb-1">Bed</dt>
                <dd className="text-sm text-zinc-200">{room.bed}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-gold/60 mb-1">Size</dt>
                <dd className="text-sm text-zinc-200">{room.size}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-gold/60 mb-1">Sleeps</dt>
                <dd className="text-sm text-zinc-200">{room.sleeps}</dd>
              </div>
            </dl>

            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-3">In this room</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-zinc-300/85">
                {(room.features as string[]).map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-gold/60">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Booking form */}
            <div className="bg-warm/10 ring-1 ring-gold/20 p-4 sm:p-6">
              {false ? null : (

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!room) return;
                    mutation.mutate({
                      room_id: room.id,
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
                      <label className="block text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-2">
                        Check-in
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setCheckIn(e.target.value)}
                        required
                        className="w-full bg-deep border border-gold/30 text-gold-light px-3 py-2 focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-2">
                        Check-out
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        min={checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                        required
                        className="w-full bg-deep border border-gold/30 text-gold-light px-3 py-2 focus:border-gold outline-none"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-deep border border-gold/30 text-gold-light px-3 py-2 focus:border-gold outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-deep border border-gold/30 text-gold-light px-3 py-2 focus:border-gold outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-deep border border-gold/30 text-gold-light px-3 py-2 focus:border-gold outline-none"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 sm:items-end pt-4 border-t border-gold/10">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gold/60">
                        {nights} night{nights !== 1 ? "s" : ""}
                      </p>
                      <p className="font-serif text-3xl text-gold">{currency(total)}</p>
                    </div>
                    <button
                      type="submit"
                      disabled={mutation.isPending || isBooked || verifying}
                      className="bg-gold text-deep px-6 py-3 text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {isBooked
                        ? "Unavailable for these dates"
                        : verifying
                          ? "Verifying payment…"
                          : mutation.isPending
                            ? "Opening Paystack…"
                            : "Confirm & Pay →"}
                    </button>
                  </div>

                  {(mutation.error || payError) && (
                    <p className="text-sm text-red-300 pt-2">
                      {payError ?? (mutation.error as Error).message}
                    </p>
                  )}
                  <p className="text-xs text-zinc-400 pt-2">
                    A secure Paystack popup will open to complete payment. Your room is locked once payment succeeds.
                  </p>
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
