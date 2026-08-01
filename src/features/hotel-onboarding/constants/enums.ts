/**
 * Frontend enums / option lists — aligned with partner wizard & backend SoT.
 */
export const HOTEL_TYPES = [
  "Hotel",
  "Resort",
  "Villa",
  "Homestay",
  "Boutique Hotel",
  "Heritage Property",
  "Service Apartment",
] as const;

export const HOTEL_CATEGORIES = [
  "Luxury",
  "Beach",
  "Mountain",
  "Heritage",
  "Budget",
  "Business",
] as const;

export const STAR_RATINGS = ["1", "2", "3", "4", "5"] as const;

export const BED_TYPES = [
  "King Size Bed",
  "Queen Size Bed",
  "Double Bed",
  "Twin Beds",
  "Single Bed",
  "Bunk Bed",
  "Sofa Bed",
] as const;

export const MAX_GUESTS_OPTIONS = ["1", "2", "3", "4", "5", "6"] as const;

export const PHOTO_SLOTS = [
  { key: "exterior", label: "Main / Exterior", icon: "🏨", required: true },
  { key: "room", label: "Common Area / Lobby", icon: "🛋️", required: false },
  { key: "bathroom", label: "Bathroom", icon: "🚿", required: false },
  { key: "pool", label: "Pool / Garden", icon: "🏊", required: false },
  { key: "reception", label: "Reception", icon: "🛎️", required: false },
] as const;

export type PhotoSlotKey = (typeof PHOTO_SLOTS)[number]["key"];

export const AMENITY_CHIPS = [
  "Free WiFi",
  "Pool",
  "Breakfast",
  "Spa",
  "Gym",
  "Parking",
  "Restaurant",
  "Bar",
  "Beach Access",
  "AC",
  "Room Service",
  "Laundry",
] as const;

export const ROOM_FEATURE_CHIPS = [
  "Balcony",
  "City View",
  "Pool View",
  "Mini Bar",
  "Jacuzzi",
  "Safe",
  "Smart TV",
  "Coffee Maker",
  "Bathtub",
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
] as const;

export const DOCUMENT_SLOTS = ["gst", "aadhaar"] as const;
export type DocumentSlotKey = (typeof DOCUMENT_SLOTS)[number];

export const ROOM_PHOTO_KEYS = ["photo1", "photo2", "photo3"] as const;
export type RoomPhotoKey = (typeof ROOM_PHOTO_KEYS)[number];
