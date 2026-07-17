import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { listRooms, getBookedRoomIds } from "@/lib/hotel.functions";
import { roomImage } from "@/lib/room-images";

const currency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const today = () => {
  return new Date().toISOString().slice(0, 10);
};
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export const Route = createFileRoute("/rooms/")({
  component: RoomsPage,
});

function RoomsPage() {
  const fetchRooms = useServerFn(listRooms);
  const fetchBooked = useServerFn(getBookedRoomIds);

  const [checkIn, setCheckIn] = useState(today());
  const [checkOut, setCheckOut] = useState(tomorrow());
  const [tierFilter, setTierFilter] = useState<"All" | "Standard" | "Deluxe" | "Executive">("All");

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: () => fetchRooms(),
  });

  const bookedQuery = useQuery({
    queryKey: ["booked", checkIn, checkOut],
    queryFn: () => fetchBooked({ data: { check_in: checkIn, check_out: checkOut } }),
    enabled: !!checkIn && !!checkOut && checkOut > checkIn,
  });

  const bookedSet = useMemo(() => new Set(bookedQuery.data ?? []), [bookedQuery.data]);
  const rooms = roomsQuery.data ?? [];
  const filtered = tierFilter === "All" ? rooms : rooms.filter((r) => r.tier === tierFilter);

  return (
    <div className="bg-deep font-sans text-gold-light min-h-screen antialiased">
      <SiteNav />
      <main className="pt-24 pb-24 md:pb-32 overflow-x-hidden">
        <section className="px-4 sm:px-6 py-12 md:py-16 max-w-7xl mx-auto animate-fade-in-up">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-6">Rooms & Availability</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-gold-light leading-tight mb-6 max-w-3xl">
            Twenty-one rooms. Pick yours.
          </h1>
          <p className="text-zinc-300/85 max-w-2xl leading-relaxed">
            Choose your dates below and every available room lights up. Rooms shown in muted grey are
            already reserved for the nights you selected.
          </p>
        </section>

        <section className="px-4 sm:px-6 max-w-7xl mx-auto mb-10 animate-fade-in-up delay-100 hover-glow">
          <div className="bg-warm/10 ring-1 ring-gold/20 p-6 grid md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-2">Check-in</label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().slice(0, 10)}
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
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-2">Room Tier</label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as typeof tierFilter)}
                className="w-full bg-deep border border-gold/30 text-gold-light px-3 py-2 focus:border-gold outline-none transition-colors"
              >
                <option>All</option>
                <option>Standard</option>
                <option>Deluxe</option>
                <option>Executive</option>
              </select>
            </div>
            <div className="text-sm text-zinc-300/80">
              {bookedQuery.isLoading ? (
                <span>Checking availability…</span>
              ) : (
                <span>
                  <span className="text-gold text-lg font-serif">{filtered.filter((r) => !bookedSet.has(r.id)).length}</span>
                  <span className="text-zinc-400"> of {filtered.length} available</span>
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 max-w-7xl mx-auto">
          {roomsQuery.isLoading ? (
            <p className="text-zinc-400 text-center py-20">Loading rooms…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-scale-in delay-200">
              {filtered.map((room, idx) => {
                const booked = bookedSet.has(room.id);
                return (
                  <article
                    key={room.id}
                    className={`bg-warm/5 ring-1 ring-gold/10 p-1 flex flex-col group hover-lift animate-fade-in-up ${booked ? "opacity-40" : ""}`}
                    style={{ animationDelay: `${(idx % 6 + 1) * 75}ms` }}
                  >
                    <div className="aspect-[16/10] sm:aspect-[4/3] overflow-hidden rounded-[6px] relative max-h-[260px] sm:max-h-none">
                      <img
                        src={roomImage(room.image_slug)}
                        alt={room.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                      />
                      <div className="absolute top-3 left-3 bg-deep/85 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-gold-light">
                        Room {room.room_number}
                      </div>
                      {booked && (
                        <div className="absolute inset-0 bg-deep/60 flex items-center justify-center">
                          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-light bg-deep px-4 py-2 border border-gold/30">
                            Reserved
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-1">
                        {room.tier} · Floor {room.floor}
                      </p>
                      <h2 className="font-serif text-xl text-gold-light mb-3">{room.name}</h2>
                      <p className="text-zinc-300/80 text-sm mb-4 line-clamp-2">{room.description}</p>
                      <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 pt-4 border-t border-gold/10">
                        <div>
                          <span className="font-serif text-xl sm:text-2xl text-gold">{currency(room.price_ngn)}</span>
                          <span className="text-xs text-zinc-400 ml-1">/ night</span>
                        </div>
                        {booked ? (
                          <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">Unavailable</span>
                        ) : (
                          <Link
                            to="/rooms/$slug"
                            params={{ slug: room.room_number }}
                            search={{ check_in: checkIn, check_out: checkOut }}
                            className="text-[10px] uppercase tracking-[0.25em] text-gold-light border-b border-gold/40 hover:border-gold pb-1 transition-all"
                          >
                            Reserve →
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