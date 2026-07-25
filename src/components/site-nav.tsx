import { Link } from "@tanstack/react-router";
import { useState } from "react";

const links = [
  { to: "/rooms", label: "Rooms" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 w-full z-50 bg-deep/90 backdrop-blur-md border-b border-gold/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="font-serif text-sm sm:text-base lg:text-xl tracking-[0.12em] lg:tracking-[0.2em] text-gold uppercase truncate min-w-0"
        >
          Garen&rsquo;s Garden
        </Link>

        <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
          <div className="site-nav-links items-center gap-6 xl:gap-8">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-light/70 hover:text-gold transition-colors"
                activeProps={{ className: "text-gold" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/auth"
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-light/50 hover:text-gold transition-colors"
            >
              Lead
            </Link>
          </div>


          <Link
            to="/rooms"
            onClick={() => setOpen(false)}
            className="bg-gold py-2 px-3 md:px-4 flex items-center gap-2 text-deep text-sm font-medium hover:bg-gold-light transition-colors shrink-0"
          >
            <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden lg:inline">Reserve</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="site-menu-button p-2 text-gold-light/90 border border-gold/25 bg-warm/20 hover:text-gold transition-colors shrink-0"
          >
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`site-mobile-menu overflow-hidden border-t border-gold/10 bg-deep/95 backdrop-blur-md transition-[max-height] duration-300 ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-4 py-4 flex flex-col">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="py-3 text-xs font-medium uppercase tracking-[0.25em] text-gold-light/80 hover:text-gold transition-colors border-b border-gold/5"
              activeProps={{ className: "text-gold" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/auth"
            onClick={() => setOpen(false)}
            className="py-3 text-xs font-medium uppercase tracking-[0.25em] text-gold-light/50 hover:text-gold transition-colors"
          >
            Lead Portal
          </Link>
        </div>
      </div>
    </nav>
  );
}
