// Client-side booking notification helpers (WhatsApp deep links).
// Opens pre-filled WhatsApp chats for the guest and for on-ground staff after
// a verified payment. Real one-click send requires a WhatsApp Business API
// provider — deep links are the pragmatic, zero-cost baseline.

const STAFF_WA_NUMBER = "2348103129471"; // 08103129471 in international format
const HOTEL_ADDRESS = "52 New Sapele/Agbor Road, Obiaruku, Delta State";

const currency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

// Normalise a Nigerian phone (0803…, +234803…, 234803…) to E.164 digits only.
function toIntl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return "234" + digits.slice(1);
  return digits;
}

export interface BookingNotify {
  id: string;
  confirmation_code: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  total_ngn: number;
  room_number: string;
  room_tier: string;
}

export function openBookingNotifications(b: BookingNotify) {
  const guestMsg =
    `Hello ${b.guest_name}, your booking at Garen's Garden is confirmed. \n\n` +
    `• Confirmation code: ${b.confirmation_code}\n` +
    `• Room: ${b.room_tier} — Room ${b.room_number}\n` +
    `• Check-in: ${b.check_in}\n` +
    `• Check-out: ${b.check_out}\n` +
    `• Amount paid: ${currency(b.total_ngn)}\n\n` +
    `Address: ${HOTEL_ADDRESS}\n` +
    `We look forward to hosting you.`;

  const staffMsg =
    `New booking (${b.room_tier}) — Room ${b.room_number}\n` +
    `Guest: ${b.guest_name}\n` +
    `WhatsApp: ${b.guest_phone}\n` +
    `Email: ${b.guest_email}\n` +
    `Check-in: ${b.check_in} → Check-out: ${b.check_out}\n` +
    `Paid: ${currency(b.total_ngn)}\n` +
    `Code: ${b.confirmation_code}`;

  const guestUrl = `https://wa.me/${toIntl(b.guest_phone)}?text=${encodeURIComponent(guestMsg)}`;
  const staffUrl = `https://wa.me/${STAFF_WA_NUMBER}?text=${encodeURIComponent(staffMsg)}`;

  // Open staff alert first (background tab), guest chat in another.
  try {
    window.open(staffUrl, "_blank", "noopener,noreferrer");
    window.open(guestUrl, "_blank", "noopener,noreferrer");
  } catch {
    // ignore — popup blockers may prevent this; user can still see receipt page
  }
}
