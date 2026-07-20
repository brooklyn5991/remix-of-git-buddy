import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import heroCourtyard from "@/assets/hero-courtyard.jpg";
import roomExecutive from "@/assets/room-executive.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import diningImg from "@/assets/dining.jpeg";
import loungeImg from "@/assets/bar.jpg";
import gardenImg from "@/assets/garden.jpg";
import logoAsset from "@/assets/garens-garden-logo.jpeg.asset.json";


export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="bg-deep font-sans text-gold-light min-h-screen antialiased">
      <SiteNav />


      <main id="top" className="pt-16">
        {/* Hero */}
        <section className="px-4 sm:px-6 py-14 md:py-24 lg:py-28">
          <div className="max-w-5xl mx-auto text-center">
            <img
              src={logoAsset.url}
              alt="Garen's Garden Hotel & Suite"
              className="mx-auto mt-6 sm:mt-0 mb-8 sm:mb-10 w-full max-w-[280px] sm:max-w-md md:max-w-xl h-auto animate-fade-in animate-float"
            />
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-gold/70 mb-8 animate-fade-in-up delay-100">
              Reborn 2026 · 21 Rooms
            </p>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-gold-light leading-[1.05] text-balance mb-8 animate-fade-in-up delay-200">
              A sanctuary of stone,<br className="hidden md:block" /> light, and quiet earth.
            </h1>
            <p className="font-sans text-zinc-300/90 text-base md:text-lg max-w-[56ch] mx-auto text-pretty mb-14 leading-relaxed animate-fade-in-up delay-300">
              Welcome to Garen&rsquo;s Garden — a charming twenty-one room bed &amp; breakfast where
              comfort, warmth, and personalized service come together to make every guest feel at home.
            </p>
            <div className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] overflow-hidden ring-1 ring-gold/10 rounded-[min(1vw,12px)] max-h-[520px] animate-scale-in delay-400">
              <img
                src={heroCourtyard}
                alt="Sun-drenched marble corridor overlooking Garen's Garden courtyard"
                width={1920}
                height={1080}
                className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700"
              />
            </div>
          </div>
        </section>

        {/* Bento Grid */}
        <section id="rooms" className="px-4 sm:px-6 pb-20 md:pb-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Large Feature: Executive Suite */}
              <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden bg-warm/10 ring-1 ring-gold/10 p-1 animate-fade-in-up delay-100 hover-lift">
                <div className="relative h-[300px] md:h-[420px] lg:h-full lg:min-h-[420px]">
                  <img
                    src={roomExecutive}
                    alt="The Executive Suite at Garen's Garden"
                    loading="lazy"
                    width={1200}
                    height={1200}
                    className="w-full h-full object-cover rounded-[8px] transition-transform duration-1000 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 rounded-[8px] bg-gradient-to-t from-deep/90 via-deep/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full p-5 sm:p-8">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold/80 mb-2">
                      Premier Residency
                    </p>
                    <h3 className="font-serif text-2xl md:text-4xl text-gold-light mb-2">
                      The Executive Suite
                    </h3>
                    <p className="text-zinc-200/90 text-sm max-w-[42ch]">
                      Our flagship room. Orthopedic king bed, walk-in glass shower, executive desk,
                      and Smart TV with DSTV — dressed in warm wood and soft gold light.
                    </p>
                  </div>
                </div>
              </div>

              {/* Amenities list */}
              <div id="amenities" className="bg-warm/5 ring-1 ring-gold/10 p-5 sm:p-8 flex flex-col justify-between animate-fade-in-up delay-200 hover-lift">
                <div>
                  <h4 className="font-serif text-xl text-gold mb-6">Refined Living</h4>
                  <ul className="space-y-4">
                    {[
                      { label: "24/7 Solar Autonomy", d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" },
                      { label: "Estate Security & CCTV", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
                      { label: "High-Speed Fiber Wi-Fi", d: "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.91 9.91 0 0114.142 0M2.05 8.05a15.554 15.554 0 0121.9 0" },
                      { label: "Constant Hot Water", d: "M12 3c2.5 4 5 6.5 5 10a5 5 0 11-10 0c0-3.5 2.5-6 5-10z" },
                      { label: "Secure In-Compound Parking", d: "M5 13l4 4L19 7" },
                    ].map((item) => (
                      <li key={item.label} className="amenity-row flex items-center gap-3 text-zinc-300 text-sm cursor-default">
                        <svg className="amenity-icon size-4 text-gold/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d={item.d} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-gold mt-8 inline-block border-b border-gold/20 pb-1 w-fit">
                  Full Facility Sheet
                </span>
              </div>

              {/* Standard/Deluxe */}
              <div className="bg-warm/5 ring-1 ring-gold/10 p-1 flex flex-col animate-fade-in-up delay-300 hover-lift">
                <div className="w-full aspect-[4/3] md:aspect-square overflow-hidden rounded-[8px] mb-2 group">
                  <img
                    src={roomDeluxe}
                    alt="Deluxe room at Garen's Garden"
                    loading="lazy"
                    width={800}
                    height={800}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750"
                  />
                </div>
                <div className="p-5">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-gold/70">
                    Room Collection
                  </span>
                  <p className="text-gold-light mt-2 font-serif text-lg leading-tight">
                    Standard, Deluxe &amp; Executive
                  </p>
                </div>
              </div>

              {/* Gallery Preview: Dining */}
              <div className="md:col-span-1 bg-warm/10 ring-1 ring-gold/10 p-1 animate-fade-in-up delay-300 hover-lift">
                <div className="relative w-full h-[240px] md:h-[300px] lg:h-full lg:min-h-[260px] overflow-hidden rounded-[8px] group">
                  <img
                    src={loungeImg}
                    alt="Garen's Garden lounge"
                    loading="lazy"
                    width={800}
                    height={1000}
                    className="w-full h-full object-cover mobile-blur group-hover:scale-105 transition-transform duration-750"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gold/80">Dining</p>
                    <p className="font-serif text-gold-light text-xl">The Lounge</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-gold/70 mt-1">Coming soon</p>
                  </div>
                </div>
              </div>

              {/* Owner Hotline */}
              <div className="md:col-span-1 bg-gold text-deep p-5 sm:p-8 flex flex-col justify-between animate-fade-in-up delay-400 hover-lift">
                <p className="font-serif text-lg italic leading-relaxed text-pretty">
                  &ldquo;Every stay is more than a visit — it&rsquo;s part of our story.&rdquo;
                </p>
                <div className="mt-8">
                  <p className="text-[10px] uppercase tracking-[0.25em] mb-1 opacity-70 font-medium">
                    Direct to Owner
                  </p>
                  <p className="text-sm font-medium">Complaint Hotline via web →</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About / Story */}
        <section id="story" className="px-4 sm:px-6 py-20 md:py-32 border-t border-gold/10">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="w-full aspect-[4/3] md:aspect-[4/5] overflow-hidden rounded-[4px] ring-1 ring-gold/10 order-2 md:order-1 max-h-[620px] group">
              <img
                src={gardenImg}
                alt="The garden courtyard at Garen's Garden"
                loading="lazy"
                width={800}
                height={1000}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
            <div className="max-w-[52ch] order-1 md:order-2">
              <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-6">Our Provenance</p>
              <h2 className="font-serif text-3xl md:text-5xl text-gold-light mb-8 leading-tight">
                Rooted in grace,<br />reborn in luxury.
              </h2>
              <div className="space-y-6 text-zinc-300/90 leading-relaxed">
                <p>
                  Garen&rsquo;s Garden is a charming 21-room bed &amp; breakfast reborn in 2026 with a
                  fresh vision of hospitality. Our mission is simple yet profound: to create a haven
                  where comfort, warmth, and personalized service make every guest feel at home.
                </p>
                <p>
                  From thoughtfully designed rooms to a complimentary breakfast served each morning,
                  every aspect of your stay is crafted to exceed expectations. The property&rsquo;s
                  intimate scale allows us to offer individualized attention — while our upgrades
                  reflect a promise to continually elevate your stay.
                </p>
                <p>
                  Choose Garen&rsquo;s Garden for your next visit and discover why guests return not
                  just for the rooms, but for the feeling of belonging.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Facilities Grid */}
        <section className="px-4 sm:px-6 py-20 md:py-24 border-t border-gold/10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-14 max-w-3xl">
              <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">The House</p>
              <h2 className="font-serif text-4xl text-gold-light leading-tight">
                Every comfort, quietly attended to.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-10">
              {[
                {
                  title: "Power & Infrastructure",
                  items: [
                    "24/7 uninterrupted solar power",
                    "Standby soundproof generator",
                    "Dedicated clean water treatment",
                    "Centralized high-speed Wi-Fi",
                  ],
                },
                {
                  title: "Safety & Privacy",
                  items: [
                    "24/7 security personnel at gates",
                    "HD CCTV across corridors & lounges",
                    "Fire alarms, detectors & extinguishers",
                    "Fenced in-compound parking",
                  ],
                },
                {
                  title: "Hospitality & Dining",
                  items: [
                    "Complimentary daily breakfast",
                    "In-house restaurant · African & continental",
                    "Premium bar & executive cocktail lounge",
                    "Tranquil garden courtyard",
                  ],
                },
                {
                  title: "In Every Room",
                  items: [
                    "Fully functional air conditioning",
                    "Orthopedic king / queen mattresses",
                    "Smart TV with DSTV / satellite",
                    "Executive desk & ergonomic chair",
                  ],
                },
                {
                  title: "Bath & Refresh",
                  items: [
                    "En-suite bath, walk-in glass shower",
                    "Water heater system",
                    "Constant hot & cold running water",
                    "Complimentary tea, coffee & kettle",
                  ],
                },
                {
                  title: "The Estate",
                  items: [
                    "21 rooms across two floors",
                    "Ground floor · Rooms 101 – 108",
                    "First floor · Rooms 201 – 213",
                    "Standard · Deluxe · Executive",
                  ],
                },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="font-serif text-xl text-gold mb-4">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.items.map((i) => (
                      <li key={i} className="text-sm text-zinc-300/85 flex gap-3">
                        <span className="text-gold/60 select-none">·</span>
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section id="contact" className="px-4 sm:px-6 py-20 md:py-32 border-t border-gold/10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-6">Reservations</p>
            <h2 className="font-serif text-3xl md:text-6xl text-gold-light leading-tight mb-8 text-balance">
              A quiet welcome awaits.
            </h2>
            <p className="text-zinc-300/85 max-w-xl mx-auto mb-12 leading-relaxed">
              Reserve a room, request a private tour, or send a note directly to the owner. Check-in
              from 3:00 PM · Check-out by 11:00 AM.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/rooms"
                className="bg-gold text-deep px-8 py-4 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold-light transition-all active:scale-95 duration-300 shadow-md hover:shadow-gold/10 hover-lift"
              >
                View Rooms &amp; Rates
              </Link>
              <Link
                to="/contact"
                className="border border-gold/40 text-gold-light px-8 py-4 text-xs uppercase tracking-[0.25em] font-semibold hover:border-gold hover:text-gold transition-all active:scale-95 duration-300 hover-glow"
              >
                Message the Owner
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

    </div>
  );
}
