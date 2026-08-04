/** Rooms are held until 2:00 PM (Africa/Lagos) on the check-out day. */
export const RELEASE_HOUR = 14;

/** Current Africa/Lagos wall-clock date (YYYY-MM-DD) and hour. */
export function lagosNow(now: Date = new Date()): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
  };
}

/**
 * True when an existing reservation still occupies the room for the requested
 * range. Standard overlap, plus a same-day turnover hold: a reservation whose
 * check-out equals the requested check-in keeps the room until 2 PM that day.
 */
export function occupies(
  reservation: { check_in: string; check_out: string },
  requested: { check_in: string; check_out: string },
  now: Date = new Date(),
): boolean {
  if (reservation.check_in >= requested.check_out) return false;
  if (reservation.check_out > requested.check_in) return true;
  if (reservation.check_out !== requested.check_in) return false;
  // Turnover day: still held until the release hour, and only relevant today.
  const { date, hour } = lagosNow(now);
  return date < reservation.check_out || (date === reservation.check_out && hour < RELEASE_HOUR);
}
