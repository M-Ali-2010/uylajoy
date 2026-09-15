/**
 * Listing vocabulary and the adapter between the API's property shape and
 * the `Listing` the UI renders.
 *
 * URLs and filters keep the Uzbek slugs (`?deal=sotuv&type=kvartira`) — they
 * are readable and already indexed. The API speaks English enums. The two
 * meet here and nowhere else.
 */

export type Deal = "sotuv" | "ijara";
export type PropType = "kvartira" | "hovli" | "ofis" | "yer" | "tijorat";

export type ApiDealType = "sale" | "rent";
export type ApiPropertyType = "apartment" | "house" | "office" | "land" | "commercial";
export type ListingStatus =
  "draft" | "pending" | "active" | "sold" | "rented" | "paused" | "rejected" | "archived";

export const cities = [
  "Toshkent",
  "Samarqand",
  "Buxoro",
  "Andijon",
  "Farg'ona",
  "Namangan",
  "Nukus",
] as const;

export const typeLabels: Record<PropType, string> = {
  kvartira: "Kvartira",
  hovli: "Hovli",
  ofis: "Ofis",
  yer: "Yer uchastkasi",
  tijorat: "Tijorat binosi",
};

export const TYPE_TO_API: Record<PropType, ApiPropertyType> = {
  kvartira: "apartment",
  hovli: "house",
  ofis: "office",
  yer: "land",
  tijorat: "commercial",
};

export const API_TO_TYPE: Record<ApiPropertyType, PropType> = {
  apartment: "kvartira",
  house: "hovli",
  office: "ofis",
  land: "yer",
  commercial: "tijorat",
};

export const DEAL_TO_API: Record<Deal, ApiDealType> = { sotuv: "sale", ijara: "rent" };
export const API_TO_DEAL: Record<ApiDealType, Deal> = { sale: "sotuv", rent: "ijara" };

export const isDeal = (v: unknown): v is Deal => v === "sotuv" || v === "ijara";
export const isPropType = (v: unknown): v is PropType => typeof v === "string" && v in TYPE_TO_API;

export const PLACEHOLDER_IMAGE = "/images/placeholder-property.svg";

/** What `GET /api/properties` and `GET /api/properties/:id` return per item. */
export interface ApiImage {
  id: string;
  url: string;
  order: number;
  isCover: boolean;
}

export interface ApiProperty {
  id: string;
  title: string;
  description: string;
  type: ApiPropertyType;
  dealType: ApiDealType;
  price: number;
  currency: "USD" | "UZS" | "EUR";
  city: string;
  district: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  rooms: number;
  totalArea: number;
  livingArea: number | null;
  floor: number | null;
  totalFloors: number | null;
  yearBuilt: number | null;
  condition: "new" | "renovated" | "good" | "needs_repair" | null;
  amenities: string[];
  status: ListingStatus;
  rejectionReason: string | null;
  verificationStatus?: "unverified" | "pending" | "verified" | "rejected";
  ownerId: string;
  agentId: string | null;
  viewCount: number;
  favoriteCount: number;
  isFeatured: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  images?: ApiImage[];
  owner?: { id: string; name: string; avatar: string | null; phone?: string | null } | null;
  agent?: { id: string; name?: string; avatar?: string | null; phone?: string | null } | null;
}

/** The shape every card, list and detail view renders. */
export interface Listing {
  id: string;
  title: string;
  city: string;
  district: string;
  address: string;
  price: number;
  currency: "USD" | "UZS" | "EUR";
  deal: Deal;
  type: PropType;
  rooms: number;
  area: number;
  floor: number;
  floors: number;
  year: number;
  image: string;
  images: string[];
  featured: boolean;
  verified: boolean;
  description: string;
  features: string[];
  status: ListingStatus;
  rejectionReason: string | null;
  viewCount: number;
  createdAt: string;
  ownerId: string;
  owner: { id: string; name: string; avatar: string | null } | null;
  /** Present only for pre-verified sources; the UI hides ratings otherwise. */
  rating?: number;
}

export function toListing(p: ApiProperty): Listing {
  const images = [...(p.images ?? [])].sort(
    (a, b) => Number(b.isCover) - Number(a.isCover) || a.order - b.order,
  );
  return {
    id: p.id,
    title: p.title,
    city: p.city,
    district: p.district,
    address: p.address,
    price: p.price,
    currency: p.currency,
    deal: API_TO_DEAL[p.dealType],
    type: API_TO_TYPE[p.type],
    rooms: p.rooms,
    area: p.totalArea,
    floor: p.floor ?? 0,
    floors: p.totalFloors ?? 0,
    year: p.yearBuilt ?? 0,
    image: images[0]?.url ?? PLACEHOLDER_IMAGE,
    images: images.map((i) => i.url),
    featured: p.isFeatured || p.isPremium,
    verified: p.verificationStatus === "verified",
    description: p.description,
    features: p.amenities ?? [],
    status: p.status,
    rejectionReason: p.rejectionReason,
    viewCount: p.viewCount,
    createdAt: p.createdAt,
    ownerId: p.ownerId,
    owner: p.owner ? { id: p.owner.id, name: p.owner.name, avatar: p.owner.avatar } : null,
  };
}

/** Filters as they appear in the /elonlar URL. */
export interface ListingSearch {
  deal?: Deal | undefined;
  city?: string | undefined;
  type?: PropType | undefined;
  q?: string | undefined;
  rooms?: number | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  sort?: "new" | "cheap" | "expensive" | "popular" | undefined;
  page?: number | undefined;
}

/** Translate URL filters into the API's query parameters. */
export function toApiFilters(s: ListingSearch) {
  return {
    dealType: s.deal ? DEAL_TO_API[s.deal] : undefined,
    type: s.type ? TYPE_TO_API[s.type] : undefined,
    city: s.city,
    search: s.q,
    minRooms: s.rooms,
    minPrice: s.minPrice,
    maxPrice: s.maxPrice,
    sortBy: (
      { new: "newest", cheap: "price_asc", expensive: "price_desc", popular: "popular" } as const
    )[s.sort ?? "new"],
    page: s.page ?? 1,
    limit: 12,
  };
}
