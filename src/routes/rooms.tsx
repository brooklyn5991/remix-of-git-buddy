import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms & Availability — Garen's Garden" },
      {
        name: "description",
        content:
          "Rooms at Garen's Garden — Standard, Deluxe, and our Executive Suite. Live availability, pick your room and reserve.",
      },
      { property: "og:title", content: "Rooms & Availability — Garen's Garden" },
      { property: "og:description", content: "Live availability. Reserve your room directly." },
    ],
  }),
  component: RoomsLayout,
});

function RoomsLayout() {
  return <Outlet />;
}
