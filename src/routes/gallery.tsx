import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import hero from "@/assets/hero-courtyard.jpg";
import garden from "@/assets/garden.jpg";
import exterior from "@/assets/exterior.jpg";
import {
  roomExecutiveImg as roomExecutive,
  roomDeluxeImg as roomDeluxe,
  roomStandardImg as roomStandard,
  roomSuiteImg as roomSuite,
} from "@/lib/room-images";

const bathroom = "/bathroom.png";
const showerGel = "/gel.png";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Garen's Garden" },
      {
        name: "description",
        content:
          "A visual walk through Garen's Garden — the courtyard, the rooms, and the quiet details of a house well-kept.",
      },
      { property: "og:title", content: "Gallery — Garen's Garden" },
      { property: "og:description", content: "A visual walk through Garen's Garden." },
    ],
  }),
  component: GalleryPage,
});

const items = [
  { src: hero, alt: "Courtyard at sunset", caption: "The Courtyard" },
  { src: roomExecutive, alt: "Executive Suite", caption: "Executive Suite" },
  { src: exterior, alt: "Exterior at dusk", caption: "Exterior · Dusk" },
  { src: roomSuite, alt: "The Suite", caption: "The Suite" },
  { src: garden, alt: "Garden", caption: "Garden Path" },
  { src: roomDeluxe, alt: "Deluxe Room", caption: "Deluxe Room" },
  { src: bathroom, alt: "Walk-in shower bath", caption: "The Bath" },
  { src: roomStandard, alt: "Standard Room", caption: "Standard Room" },
  { src: showerGel, alt: "In-room shower gel amenity", caption: "Shower Gel" },
];


function GalleryPage() {
  return (
    <div className="bg-deep font-sans text-gold-light min-h-screen antialiased">
      <SiteNav />
      <main className="pt-24 pb-24 md:pb-32 overflow-x-hidden">
        <section className="px-4 sm:px-6 py-12 md:py-16 max-w-6xl mx-auto animate-fade-in-up">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-6">Gallery</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-gold-light leading-tight max-w-3xl">
            Every corner of the house, quietly documented.
          </h1>
        </section>

        <section className="px-4 sm:px-6 max-w-6xl mx-auto animate-scale-in delay-200">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
            {items.map((i, idx) => (
              <figure
                key={i.caption}
                className="relative mb-5 break-inside-avoid overflow-hidden rounded-xl bg-warm/5 ring-1 ring-gold/10 group hover-lift animate-fade-in-up"
                style={{ animationDelay: `${(idx + 1) * 70}ms` }}
              >
                <img
                  src={i.src}
                  alt={i.alt}
                  loading="lazy"
                  className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <figcaption className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gold-light">{i.caption}</span>
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

