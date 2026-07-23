import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-deep py-20 px-6 border-t border-gold/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <span className="font-serif text-2xl text-gold uppercase tracking-[0.2em] block mb-4">
            Garen&rsquo;s Garden
          </span>
          <p className="text-zinc-400/80 text-sm leading-relaxed max-w-xs">
            Obiaruku&rsquo;s finest bed &amp; breakfast. Reborn 2026. Where every stay is part of our
            story.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h5 className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">Explore</h5>
          <Link to="/rooms" className="text-sm text-zinc-400 hover:text-gold transition-colors">The Rooms</Link>
          <Link to="/gallery" className="text-sm text-zinc-400 hover:text-gold transition-colors">Gallery</Link>
          <Link to="/about" className="text-sm text-zinc-400 hover:text-gold transition-colors">Our Story</Link>
          <Link to="/contact" className="text-sm text-zinc-400 hover:text-gold transition-colors">Reserve</Link>
        </div>
        <div className="flex flex-col gap-3">
          <h5 className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">Guest Care</h5>
          <span className="text-sm text-zinc-400">Check-in · 3:00 PM</span>
          <span className="text-sm text-zinc-400">Check-out · 11:00 AM</span>
          <span className="text-sm text-zinc-400">Direct owner hotline via web</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gold/10 text-[10px] uppercase tracking-[0.25em] text-zinc-500 flex flex-col md:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} Garen&rsquo;s Garden</span>
        <span>Reborn 2026</span>
      </div>
    </footer>
  );
}
