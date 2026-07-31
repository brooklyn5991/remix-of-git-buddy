import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { listRooms, getBookedRoomIds } from "@/lib/hotel.functions";
import { roomImage } from "@/lib/room-images";

const currency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const today = () => new Date().toISOString().slice(0, 10);
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const TIER_ORDER = ["Standard", "Deluxe", "Executive", "Suite"] as const;
type Tier = (typeof TIER_ORDER)[number];

export const Route = createFileRoute("/rooms/")({
  component: RoomsPage,
});

function RoomsPage() {
  const queryClient = useQueryClient();
  const fetchRooms = useServerFn(listRooms);
  const fetchBooked = useServerFn(getBookedRoomIds);

  const [checkIn, setCheckIn] = useState(today());
  const [checkOut, setCheckOut] = useState(tomorrow());

  const roomsQuery = useQuery({ queryKey: ["rooms"], queryFn: () => fetchRooms() });
  const bookedQuery = useQuery({
    queryKey: ["booked", checkIn, checkOut],
    queryFn: () => fetchBooked({ data: { check_in: checkIn, check_out: checkOut } }),
    enabled: !!checkIn && !!checkOut && checkOut > checkIn,
  });

  const bookedSet = useMemo(() => new Set(bookedQuery.data ?? []), [bookedQuery.data]);
  const rooms = roomsQuery.data ?? [];

  // Reservation rows are private (no anon read access), so availability is
  // refreshed by polling instead of realtime.
  useEffect(() => {
    const t = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["booked"] });
    }, 20000);
    return () => clearInterval(t);
  }, [queryClient]);

  const tiers = useMemo(() => {
    return TIER_ORDER.map((tier) => {
      const inTier = rooms.filter((r) => r.tier === tier);
      if (inTier.length === 0) return null;
      const available = inTier.filter((r) => !bookedSet.has(r.id));
      const sample = inTier[0];
      const price = Math.min(...inTier.map((r) => r.price_ngn));
      return {
        tier: tier as Tier,
        sample,
        price,
        availableCount: available.length,
      };
    }).filter((x): x is NonNullable<typeof x> => !!x);
  }, [rooms, bookedSet]);

  return (
    <div className="bg-deep font-sans text-gold-light min-h-screen antialiased">
      <SiteNav />
      <main className="pt-24 pb-24 md:pb-32 overflow-x-hidden">
        <section className="px-4 sm:px-6 py-12 md:py-16 max-w-7xl mx-auto animate-fade-in-up">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-6">Rooms & Availability</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-gold-light leading-tight mb-6 max-w-3xl">
            Three rooms. Pick your style.
          </h1>
          <p className="text-zinc-300/85 max-w-2xl leading-relaxed">
            Choose your dates, pick a room category, and we&rsquo;ll assign the next available room
            for you. No hunting for a specific number — just comfort, ready when you arrive.
          </p>
        </section>

        <section className="px-4 sm:px-6 max-w-7xl mx-auto mb-10 animate-fade-in-up delay-100 hover-glow">
          <div className="bg-warm/10 ring-1 ring-gold/20 p-6 grid md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-2">Check-in</label>
              <input
                type="date"
                value={checkIn}
                min={today()}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-deep border border-gold/30 text-gold-light px-3 py-2 focus:border-gold outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-2">Check-out</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-deep border border-gold/30 text-gold-light px-3 py-2 focus:border-gold outline-none transition-colors"
              />
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 max-w-7xl mx-auto">
          {roomsQuery.isLoading ? (
            <p className="text-zinc-400 text-center py-20">Loading rooms…</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-scale-in delay-200">
              {tiers.map(({ tier, sample, price, availableCount }, idx) => {
                const soldOut = availableCount === 0 && !bookedQuery.isLoading;
                const features = (sample.features as string[] | null) ?? [];
                return (
                  <article
                    key={tier}
                    className={`bg-warm/5 ring-1 ring-gold/10 p-1 flex flex-col group hover-tilt animate-bounce-in ${soldOut ? "opacity-60" : ""}`}
                    style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                  >
                    <div className="aspect-[16/10] overflow-hidden rounded-[6px] relative">
                      <img
                        src={roomImage(sample.image_slug)}
                        alt={`${tier} room`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                      />
                      <div className="absolute top-3 left-3 bg-deep/85 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-gold-light">
                        {tier}
                      </div>
                      {soldOut && (
                        <div className="absolute inset-0 bg-deep/70 flex items-center justify-center">
                          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-light bg-deep px-4 py-2 border border-gold/30">
                            Fully Booked
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 sm:p-6 flex flex-col flex-1 min-w-0">
                      <h2 className="font-serif text-2xl text-gold-light mb-2">The {tier} Room</h2>
                      <p className="text-zinc-300/80 text-sm mb-4 line-clamp-3">{sample.description}</p>

                      <ul className="space-y-2 mb-6 text-sm text-zinc-300/85">
                        {features.slice(0, 5).map((f) => (
                          <li key={f} className="flex gap-2">
                            <span className="text-gold/60">·</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto pt-4 border-t border-gold/10">
                        <div className="flex items-end justify-between mb-4">
                          <div>
                            <span className="font-serif text-2xl text-gold">{currency(price)}</span>
                            <span className="text-xs text-zinc-400 ml-1">/ night</span>
                          </div>
                          <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">
                            {bookedQuery.isLoading ? "Checking…" : soldOut ? "0 available" : `${availableCount} available`}
                          </span>
                        </div>
                        {soldOut ? (
                          <button
                            disabled
                            className="w-full text-center text-[11px] uppercase tracking-[0.3em] text-zinc-500 border border-zinc-700 py-3 cursor-not-allowed"
                          >
                            Sold Out
                          </button>
                        ) : (
                          <Link
                            to="/book/$tier"
                            params={{ tier: tier.toLowerCase() }}
                            search={{ check_in: checkIn, check_out: checkOut }}
                            className="block w-full text-center text-[11px] uppercase tracking-[0.3em] text-deep bg-gold hover:bg-gold-light py-3 transition-colors"
                          >
                            Book Room
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
