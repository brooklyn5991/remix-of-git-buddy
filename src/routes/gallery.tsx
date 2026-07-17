import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import hero from "@/assets/hero-courtyard.jpg";
import garden from "@/assets/garden.jpg";
import dining from "@/assets/dining.jpeg";
import exterior from "@/assets/exterior.jpg";
import bar from "@/assets/bar.jpg";
import bathroom from "@/assets/bathroom.jpg";
import roomExecutive from "@/assets/room-executive.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomStandard from "@/assets/room-standard.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Garen's Garden" },
      {
        name: "description",
        content:
          "A visual walk through Garen's Garden — the courtyard, the rooms, the restaurant, the bar, and the quiet details of a house well-kept.",
      },
      { property: "og:title", content: "Gallery — Garen's Garden" },
      { property: "og:description", content: "A visual walk through Garen's Garden." },
    ],
  }),
  component: GalleryPage,
});

const items = [
  { src: hero, alt: "Courtyard at sunset", caption: "The Courtyard", span: "md:col-span-2 md:row-span-2" },
  { src: exterior, alt: "Exterior at dusk", caption: "Exterior · Dusk", span: "" },
  { src: garden, alt: "Garden", caption: "Garden Path", span: "" },
  { src: roomExecutive, alt: "Executive Suite", caption: "Executive Suite", span: "md:col-span-2" },
  { src: dining, alt: "Restaurant", caption: "The Restaurant", span: "" },
  { src: bar, alt: "Cocktail bar", caption: "The Bar", span: "" },
  { src: roomDeluxe, alt: "Deluxe Room", caption: "Deluxe Room", span: "" },
  { src: bathroom, alt: "Walk-in shower bath", caption: "The Bath", span: "" },
  { src: roomStandard, alt: "Standard Room", caption: "Standard Room", span: "md:col-span-2" },
];

function GalleryPage() {
  return (
    <div className="bg-deep font-sans text-gold-light min-h-screen antialiased">
      <SiteNav />
      <main className="pt-24 pb-24 md:pb-32 overflow-x-hidden">
        <section className="px-4 sm:px-6 py-12 md:py-16 max-w-7xl mx-auto animate-fade-in-up">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-6">Gallery</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-gold-light leading-tight max-w-3xl">
            Every corner of the house, quietly documented.
          </h1>
        </section>

        <section className="px-4 sm:px-6 max-w-7xl mx-auto animate-scale-in delay-200">
          <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[190px] sm:auto-rows-[230px] md:auto-rows-[260px] gap-3">
            {items.map((i, idx) => (
              <figure
                key={i.caption}
                className={`relative overflow-hidden ring-1 ring-gold/10 group ${i.span} hover-glow animate-fade-in-up`}
                style={{ animationDelay: `${(idx + 1) * 75}ms` }}
              >
                <img
                  src={i.src}
                  alt={i.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <figcaption className="absolute bottom-0 left-0 p-4 text-[10px] uppercase tracking-[0.25em] text-gold-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {i.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
