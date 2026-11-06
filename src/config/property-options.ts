export const PROPERTY_TYPES = [
  "house",
  "villa",
  "apartment",
  "land",
  "commercial",
  "office",
] as const;
export const LISTING_TYPES = ["sale", "rent"] as const;
export const AVAILABILITY = [
  "available",
  "reserved",
  "sold",
  "rented",
] as const;
export const RENT_PERIODS = ["month", "year", "night"] as const;
export const SORT_OPTIONS = ["newest", "price_asc", "price_desc"] as const;

export type RentPeriod = (typeof RENT_PERIODS)[number];

export const INQUIRY_STATUSES = ["new", "read", "replied", "closed"] as const;

export const FEATURE_KEYS = [
  "garden",
  "parking",
  "security",
  "water_tank",
  "furnished",
  "balcony",
  "generator",
  "land_title",
  "road_access",
  "mountain_view",
  "garage",
  "street_front",
  "air_conditioning",
  "swimming_pool",
  "elevator",
] as const;

export type PropertyTypeKey = (typeof PROPERTY_TYPES)[number];
export type ListingTypeKey = (typeof LISTING_TYPES)[number];
export type AvailabilityKey = (typeof AVAILABILITY)[number];
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];
