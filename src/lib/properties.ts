import apartmentImg from "@/assets/type-apartment.jpg";
import villaImg from "@/assets/type-villa.jpg";
import townhouseImg from "@/assets/type-townhouse.jpg";
import chaletImg from "@/assets/type-chalet.jpg";
import officeImg from "@/assets/type-office.jpg";
import retailImg from "@/assets/type-retail.jpg";
import landImg from "@/assets/type-land.jpg";

export type PropertyType =
  | "شقة"
  | "فيلا"
  | "تاون هاوس"
  | "شاليه"
  | "مكتب"
  | "محل"
  | "أرض"
  | "بيت";

export const TYPE_IMAGE: Record<PropertyType, string> = {
  "شقة": apartmentImg,
  "فيلا": villaImg,
  "تاون هاوس": townhouseImg,
  "شاليه": chaletImg,
  "مكتب": officeImg,
  "محل": retailImg,
  "أرض": landImg,
  "بيت": townhouseImg,
};

/**
 * Property shape — matches the `public.properties` row in the database.
 * `images` holds public URLs returned from the `property-images` storage bucket.
 */
export type Property = {
  id: string;
  code: string;
  title: string;
  type: PropertyType | string;
  status: "للبيع" | "للإيجار" | string;
  badge?: string | null;
  price: string;
  area?: string | null;
  rooms: number;
  location?: string | null;
  lat?: number | null;
  lng?: number | null;
  description?: string | null;
  images?: string[] | null;
  featured?: boolean;
  published?: boolean;
  sort_order?: number;
};

/** Group properties by their type for sectioned listings. */
export function groupByType(items: Property[]) {
  const groups: Record<string, Property[]> = {};
  for (const p of items) (groups[p.type] ||= []).push(p);
  return groups;
}

/** Returns the first uploaded image URL, or a type-based placeholder. */
export function getPropertyImage(p: Property): string {
  if (p.images && p.images.length > 0) return p.images[0];
  return TYPE_IMAGE[(p.type as PropertyType)] ?? apartmentImg;
}

export const PHONE = "01111337628";
export const WHATSAPP = `https://wa.me/2${PHONE}`;

/** Returns the visible property code (e.g. "M-001") used in WhatsApp messages and cards. */
export function getPropertyCode(p: Property | { code?: string; id: string } | string): string {
  if (typeof p === "string") return p;
  return p.code ?? p.id;
}