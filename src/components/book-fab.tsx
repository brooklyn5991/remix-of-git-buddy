import { Link, useRouterState } from "@tanstack/react-router";

export function BookFab() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideOn = ["/rooms", "/auth", "/dashboard", "/vault", "/squadco", "/reservation"];
  if (hideOn.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  return (
    <Link
      to="/rooms"
      aria-label="Book a room"
      className="fixed z-[60] bg-gold text-deep px-5 py-3 sm:px-6 sm:py-4 shadow-lg shadow-black/40 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] hover:bg-gold-light transition-colors"
      style={{
        bottom: "calc(1rem + env(safe-area-inset-bottom))",
        right: "calc(1rem + env(safe-area-inset-right))",
      }}
    >
      <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Book
    </Link>
  );
}
