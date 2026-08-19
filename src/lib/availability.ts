/** Rooms are held until 12:30 PM (Africa/Lagos) on the check-out day. */
export const RELEASE_HOUR = 12;
export const RELEASE_MINUTE = 30;

/** Current Africa/Lagos wall-clock date (YYYY-MM-DD), hour, and minute. */
export function lagosNow(now: Date = new Date()): { date: string; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

/**
 * True when an existing reservation still occupies the room for the requested
 * range. Standard overlap, plus a same-day turnover hold: a reservation whose
 * check-out equals the requested check-in keeps the room until 12:30 PM that day.
 */
export function occupies(
  reservation: { check_in: string; check_out: string },
  requested: { check_in: string; check_out: string },
  now: Date = new Date(),
): boolean {
  if (reservation.check_in >= requested.check_out) return false;
  if (reservation.check_out > requested.check_in) return true;
  if (reservation.check_out !== requested.check_in) return false;
  // Turnover day: still held until the release time (12:30 PM), and only relevant today.
  const { date, hour, minute } = lagosNow(now);
  if (date < reservation.check_out) return true;
  if (date > reservation.check_out) return false;
  // Same calendar day as check-out: held until 12:30 PM.
  return hour < RELEASE_HOUR || (hour === RELEASE_HOUR && minute < RELEASE_MINUTE);
}
