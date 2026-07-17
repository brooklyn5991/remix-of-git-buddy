import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import garden from "@/assets/garden.jpg";
import exterior from "@/assets/exterior.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Garen's Garden" },
      {
        name: "description",
        content:
          "Garen's Garden is a 21-room boutique bed & breakfast reborn in 2026. Our mission: to make every guest feel at home through warmth, care, and personalized service.",
      },
      { property: "og:title", content: "Our Story — Garen's Garden" },
      { property: "og:description", content: "Reborn 2026. A house well-kept." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="bg-deep font-sans text-gold-light min-h-screen antialiased">
      <SiteNav />
      <main className="pt-24 pb-24 md:pb-32 overflow-x-hidden">
        <section className="px-4 sm:px-6 py-14 md:py-20 max-w-7xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="animate-fade-in-up">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-6">Our Provenance</p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-gold-light leading-tight mb-8">
              Rooted in grace,<br /> reborn in luxury.
            </h1>
            <div className="space-y-6 text-zinc-300/90 leading-relaxed">
              <p>
                Garen&rsquo;s Garden is a charming 21-room bed &amp; breakfast reborn in 2026 with a
                fresh vision of hospitality. Our mission is simple yet profound: to create a haven
                where comfort, warmth, and personalized service make every guest feel at home.
              </p>
              <p>
                From thoughtfully designed rooms to a complimentary breakfast served each morning,
                every aspect of your stay is crafted to exceed expectations. The property&rsquo;s
                intimate scale allows us to offer individualized attention.
              </p>
            </div>
          </div>
          <div className="aspect-[16/10] md:aspect-[4/5] overflow-hidden ring-1 ring-gold/10 rounded-[4px] max-h-[620px] animate-scale-in delay-200 group">
            <img src={garden} alt="Garden courtyard" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
          </div>
        </section>

        <section className="px-4 sm:px-6 py-14 md:py-20 border-t border-gold/10">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
            {[
              { n: "21", l: "Rooms across two floors", d: "delay-100" },
              { n: "2026", l: "The year we were reborn", d: "delay-200" },
              { n: "24/7", l: "Solar autonomy & security", d: "delay-300" },
            ].map((s) => (
              <div key={s.l} className={`border-t border-gold/20 pt-6 animate-fade-in-up ${s.d}`}>
                <p className="font-serif text-5xl md:text-6xl text-gold mb-2">{s.n}</p>
                <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 sm:px-6 py-14 md:py-20 border-t border-gold/10 max-w-7xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="aspect-[16/10] md:aspect-[5/4] overflow-hidden ring-1 ring-gold/10 rounded-[4px] order-2 md:order-1 max-h-[560px] animate-scale-in delay-100 group">
            <img src={exterior} alt="Exterior at dusk" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
          </div>
          <div className="order-1 md:order-2 animate-fade-in-up delay-200">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-6">A Note from the Owner</p>
            <h2 className="font-serif text-4xl text-gold-light leading-tight mb-6">
              &ldquo;Every stay is part of our story.&rdquo;
            </h2>
            <p className="text-zinc-300/85 leading-relaxed mb-6">
              When you stay with us, you&rsquo;re not just booking a room — you&rsquo;re becoming
              part of a story we&rsquo;re still writing. If something isn&rsquo;t right, or if there
              is something we can do better, the owner&rsquo;s hotline reaches me directly.
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold">— Mrs Rosemary, Proprietor</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
