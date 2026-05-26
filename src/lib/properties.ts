import villa from "@/assets/property-villa.jpg";
import apartment from "@/assets/property-apartment.jpg";
import office from "@/assets/property-office.jpg";
import coast from "@/assets/property-coast.jpg";
import compound from "@/assets/property-compound.jpg";
import retail from "@/assets/property-retail.jpg";

export type Property = {
  id: string;
  title: string;
  type: string;
  status: "للبيع" | "للإيجار";
  badge?: "جديد" | "مميز" | "فرصة استثمارية";
  price: string;
  area: string;
  rooms: number;
  location: string;
  image: string;
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
    image: villa,
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
    image: apartment,
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
    image: office,
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
    image: coast,
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
    image: compound,
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
    image: retail,
  },
];

export const PHONE = "01111337628";
export const WHATSAPP = `https://wa.me/2${PHONE}`;