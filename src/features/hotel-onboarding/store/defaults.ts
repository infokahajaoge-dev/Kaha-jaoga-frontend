import type {
  HotelDraft,
  AddressDraft,
  OwnerDraft,
  DocumentsMetaDraft,
  RoomDraft,
  PhotosDraft,
  DocsDraft,
  OnboardingDraft,
  ObjectKeysState,
} from "../types/draft";

export const defaultHotel = (): HotelDraft => ({
  name: "",
  hotel_type: "Hotel",
  category: "Luxury",
  star_rating: "3",
  total_rooms: "",
  description: "",
  price: "",
  check_in_time: "12:00",
  check_out_time: "11:00",
  website: "",
  amenities: "",
});

export const defaultAddress = (): AddressDraft => ({
  address_street: "",
  address_city: "",
  address_state: "",
  address_pincode: "",
});

export const defaultOwner = (): OwnerDraft => ({
  owner_name: "",
  owner_email: "",
  owner_phone: "",
  password: "",
});

export const defaultDocumentsMeta = (): DocumentsMetaDraft => ({
  gst_number: "",
  owner_aadhaar_number: "",
});

export const defaultRoom = (): RoomDraft => ({
  room_name: "",
  bed_type: "King Size Bed",
  area_sqm: "",
  max_guests: "2",
  price_per_night: "",
  has_ac: true,
  total_rooms: "1",
  features: "",
  photo1: null,
  photo2: null,
  photo3: null,
  preview1: "",
  preview2: "",
  preview3: "",
});

export const defaultPhotos = (): PhotosDraft => ({
  exterior: null,
  room: null,
  bathroom: null,
  pool: null,
  reception: null,
});

export const defaultDocs = (): DocsDraft => ({
  gst: null,
  aadhaar: null,
});

export const defaultObjectKeys = (): ObjectKeysState => ({
  hotel: [],
  rooms: [],
  documents: [],
});

export const createInitialDraft = (): OnboardingDraft => ({
  currentStep: 1,
  loading: false,
  submitPhase: "idle",
  hotel: defaultHotel(),
  address: defaultAddress(),
  owner: defaultOwner(),
  documentsMeta: defaultDocumentsMeta(),
  rooms: [defaultRoom()],
  photos: defaultPhotos(),
  previews: {},
  docs: defaultDocs(),
  docNames: {},
  uploadSessionId: null,
  objectKeys: defaultObjectKeys(),
});
