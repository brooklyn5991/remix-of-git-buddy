import { Link, useRouterState } from "@tanstack/react-router";

export function BookFab() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideOn = ["/rooms", "/book", "/auth", "/dashboard", "/vault", "/squadco", "/reservation"];
  if (hideOn.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  const scrollToFeedback = () => {
    const el = document.getElementById("inquiry");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Fallback: navigate home then scroll after load
      window.location.href = "/#inquiry";
    }
  };

  return (
    <div
      className="fixed z-[60] flex items-stretch gap-2 sm:gap-3"
      style={{
        bottom: "calc(1rem + env(safe-area-inset-bottom))",
        right: "calc(1rem + env(safe-area-inset-right))",
      }}
    >
      {/* Leave Feedback — secondary / ghost */}
      <button
        type="button"
        onClick={scrollToFeedback}
        aria-label="Leave feedback"
        className="bg-transparent text-gold-light px-3 py-3 sm:px-5 sm:py-4 ring-1 ring-gold/50 flex items-center gap-2 text-xs sm:text-sm font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-gold/10 hover:ring-gold transition-colors"
      >
        <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.4A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="hidden xs:inline sm:inline">Leave Feedback</span>
        <span className="xs:hidden sm:hidden">Feedback</span>
      </button>

      {/* Book — primary CTA */}
      <Link
        to="/rooms"
        aria-label="Book a room"
        className="bg-gold text-deep px-5 py-3 sm:px-6 sm:py-4 shadow-lg shadow-black/40 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] hover:bg-gold-light transition-colors"
      >
        <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Book
      </Link>
    </div>
  );
}
