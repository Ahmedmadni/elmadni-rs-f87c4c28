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
  | "أرض";

export const TYPE_IMAGE: Record<PropertyType, string> = {
  "شقة": apartmentImg,
  "فيلا": villaImg,
  "تاون هاوس": townhouseImg,
  "شاليه": chaletImg,
  "مكتب": officeImg,
  "محل": retailImg,
  "أرض": landImg,
};

export type Property = {
  id: string;
  title: string;
  type: PropertyType;
  status: "للبيع" | "للإيجار";
  badge?: "جديد" | "مميز" | "فرصة استثمارية";
  price: string;
  area: string;
  rooms: number;
  location: string;
  image?: string;
};

export const properties: Property[] = [
  {
    id: "1",
    title: "فيلا فاخرة بحمام سباحة خاص",
    type: "فيلا",
    status: "للبيع",
    badge: "مميز",
    price: "25,500,000 ج.م",
    area: "650 م²",
    rooms: 6,
    location: "التجمع الخامس، القاهرة الجديدة",
  },
  {
    id: "2",
    title: "شقة بانورامية بإطلالة على النيل",
    type: "شقة",
    status: "للبيع",
    badge: "جديد",
    price: "8,900,000 ج.م",
    area: "210 م²",
    rooms: 3,
    location: "الزمالك، القاهرة",
  },
  {
    id: "3",
    title: "مكتب إداري بالعاصمة الإدارية",
    type: "مكتب",
    status: "للبيع",
    badge: "فرصة استثمارية",
    price: "4,200,000 ج.م",
    area: "120 م²",
    rooms: 2,
    location: "العاصمة الإدارية الجديدة",
  },
  {
    id: "4",
    title: "شاليه فاخر بالساحل الشمالي",
    type: "شاليه",
    status: "للبيع",
    badge: "مميز",
    price: "6,800,000 ج.م",
    area: "180 م²",
    rooms: 3,
    location: "هاسيندا باي، الساحل الشمالي",
  },
  {
    id: "5",
    title: "تاون هاوس في كمبوند مغلق",
    type: "تاون هاوس",
    status: "للبيع",
    badge: "جديد",
    price: "12,300,000 ج.م",
    area: "320 م²",
    rooms: 4,
    location: "مدينتي، القاهرة",
  },
  {
    id: "6",
    title: "محل تجاري بموقع مميز",
    type: "محل",
    status: "للإيجار",
    badge: "فرصة استثمارية",
    price: "85,000 ج.م / شهرياً",
    area: "95 م²",
    rooms: 1,
    location: "مول العرب، 6 أكتوبر",
  },
];

export function getPropertyImage(p: Property): string {
  return p.image ?? TYPE_IMAGE[p.type];
}

export const PHONE = "01111337628";
export const WHATSAPP = `https://wa.me/2${PHONE}`;