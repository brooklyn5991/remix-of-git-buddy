import {
  roomStandardImg as roomStandard,
  roomDeluxeImg as roomDeluxe,
  roomExecutiveImg as roomExecutive,
} from "@/lib/room-images";

export type Room = {
  slug: string;
  name: string;
  tagline: string;
  tier: "Standard" | "Deluxe" | "Executive";
  price: number; // NGN per night
  bed: string;
  size: string;
  sleeps: number;
  image: string;
  description: string;
  features: string[];
  inventory: number;
};

export const currency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const rooms: Room[] = [
  {
    slug: "standard",
    name: "The Standard Room",
    tagline: "Warm, quiet, and considered.",
    tier: "Standard",
    price: 45000,
    bed: "Queen orthopedic",
    size: "22 m²",
    sleeps: 2,
    image: roomStandard,
    inventory: 8,
    description:
      "Our entry room, thoughtfully outfitted with everything you need for a restful night — warm wood floors, soft gold light, and an en-suite bath with constant hot water.",
    features: [
      "Queen orthopedic mattress",
      "Split-unit air conditioning",
      "Smart TV with DSTV / satellite",
      "En-suite bath with hot water",
      "Complimentary tea, coffee & kettle",
      "High-speed fiber Wi-Fi",
    ],
  },
  {
    slug: "deluxe",
    name: "The Deluxe Room",
    tagline: "A step further into comfort.",
    tier: "Deluxe",
    price: 68000,
    bed: "King orthopedic",
    size: "30 m²",
    sleeps: 2,
    image: roomDeluxe,
    inventory: 10,
    description:
      "A larger footprint, a king bed, and a walk-in glass shower. The Deluxe is our most-requested room — the perfect balance of space, comfort, and quiet.",
    features: [
      "King orthopedic mattress",
      "Walk-in glass shower cubicle",
      "Executive desk & ergonomic chair",
      "Split-unit air conditioning",
      "Smart TV with DSTV / satellite",
      "Complimentary breakfast",
    ],
  },
  {
    slug: "executive",
    name: "The Executive Suite",
    tagline: "Our flagship residency.",
    tier: "Executive",
    price: 120000,
    bed: "King orthopedic",
    size: "42 m²",
    sleeps: 2,
    image: roomExecutive,
    inventory: 3,
    description:
      "The full expression of Garen's Garden — a spacious suite dressed in warm wood and soft gold light, with a walk-in glass shower, executive workspace, and a private seating corner.",
    features: [
      "King orthopedic mattress",
      "Walk-in glass shower with rainhead",
      "Private lounge seating",
      "Executive desk & ergonomic chair",
      "Smart TV with premium DSTV package",
      "Priority check-in & turndown service",
      "Complimentary breakfast & evening tea",
    ],
  },
];

export const findRoom = (slug: string) => rooms.find((r) => r.slug === slug);
