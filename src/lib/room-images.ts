export const roomStandardImg = "/Standard%20Room.png";
export const roomDeluxeImg = "/Delux%20Room.png";
export const roomExecutiveImg = "/Executive%20Room.png";
export const roomSuiteImg = "/Suite%201.png";

export function roomImage(slug: string): string {
  switch (slug) {
    case "deluxe":
    case "room-deluxe":
      return roomDeluxeImg;
    case "executive":
    case "room-executive":
      return roomExecutiveImg;
    case "suite":
    case "room-suite":
      return roomSuiteImg;
    default:
      return roomStandardImg;
  }
}
