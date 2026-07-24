import roomStandard from "@/assets/room-standard.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomExecutive from "@/assets/room-executive.jpg";

export function roomImage(slug: string): string {
  switch (slug) {
    case "deluxe":
    case "room-deluxe":
      return roomDeluxe;
    case "executive":
    case "room-executive":
    case "suite":
      return roomExecutive;
    default:
      return roomStandard;
  }
}
