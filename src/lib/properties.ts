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

const APT = "شقة" as const;
const LAND = "أرض" as const;
const HOUSE = "بيت" as const;
const OFFICE = "مكتب" as const;
const roomsFor = (m: number) => (m >= 170 ? 4 : m >= 120 ? 3 : m >= 90 ? 2 : 1);

/**
 * Static fallback list — mirrors the seeded `public.properties` rows.
 * Kept in code so the marketing pages render instantly before the DB query
 * resolves and so existing components keep their type safety. The admin
 * dashboard reads/writes the live DB rows.
 */
export const properties: Property[] = [
  { id: "p1",  code: "M-001", title: "شقة 125م ناصية بلكونة شارع 10×12 — أرض المحلج", type: APT, status: "للبيع", badge: "مميز", price: "1,100,000 ج.م", area: "125 م²", rooms: roomsFor(125), location: "أرض المحلج — مغاغة، المنيا" },
  { id: "p2",  code: "M-002", title: "شقة 175م ناصية على الإبراهيمية خلف رانين", type: APT, status: "للبيع", badge: "مميز", price: "السعر عند المعاينة", area: "175 م²", rooms: roomsFor(175), location: "شارع الإبراهيمية — خلف رانين" },
  { id: "p3",  code: "M-003", title: "شقة 138م واجهة نصف تشطيب — دور 11", type: APT, status: "للبيع", price: "السعر عند المعاينة", area: "138 م²", rooms: roomsFor(138), location: "خلف رانين — مغاغة، المنيا" },
  { id: "p4",  code: "M-004", title: "شقة 148م دور سابع برج خوازيق — شارع 12م", type: APT, status: "للبيع", price: "1,100,000 ج.م", area: "148 م²", rooms: roomsFor(148), location: "شارع 12م — مغاغة، المنيا" },
  { id: "p5",  code: "M-005", title: "شقة 130م نصف تشطيب دور 11 فوقها روف — الشبان المسلمين", type: APT, status: "للبيع", badge: "مميز", price: "1,200,000 ج.م", area: "130 م²", rooms: roomsFor(130), location: "الشبان المسلمين الرئيسي" },
  { id: "p6",  code: "M-006", title: "شقة 135م دور خامس أرض المحلج — شارع 25م", type: APT, status: "للبيع", price: "900,000 ج.م", area: "135 م²", rooms: roomsFor(135), location: "أرض المحلج — شارع 25م" },
  { id: "p7",  code: "M-007", title: "شقة 180م دور ثالث واجهة بين المحلجين", type: APT, status: "للبيع", price: "1,200,000 ج.م", area: "180 م²", rooms: roomsFor(180), location: "بين المحلجين — مغاغة، المنيا" },
  { id: "p8",  code: "M-008", title: "شقة 180م دور ثالث ناصية بين المحلجين", type: APT, status: "للبيع", badge: "مميز", price: "1,250,000 ج.م", area: "180 م²", rooms: roomsFor(180), location: "بين المحلجين — مغاغة، المنيا" },
  { id: "p9",  code: "M-009", title: "شقة 180م دور ثانٍ ناصية بين المحلجين", type: APT, status: "للبيع", price: "1,250,000 ج.م", area: "180 م²", rooms: roomsFor(180), location: "بين المحلجين — مغاغة، المنيا" },
  { id: "p10", code: "M-010", title: "شقة 140م داخلية أرض المحلج — دور خامس (مرافق + أسانسير)", type: APT, status: "للبيع", badge: "فرصة استثمارية", price: "700,000 ج.م", area: "140 م²", rooms: roomsFor(140), location: "أرض المحلج — مغاغة، المنيا" },
  { id: "p11", code: "M-011", title: "شقة 140م داخلية أرض المحلج — دور ثامن (مرافق + أسانسير)", type: APT, status: "للبيع", badge: "فرصة استثمارية", price: "650,000 ج.م", area: "140 م²", rooms: roomsFor(140), location: "أرض المحلج — مغاغة، المنيا" },
  { id: "p12", code: "M-012", title: "شقة 155م دور ثامن واجهة — نصف تشطيب وتأسيس", type: APT, status: "للبيع", price: "900,000 ج.م", area: "155 م²", rooms: roomsFor(155), location: "مغاغة، المنيا" },
  { id: "p13", code: "M-013", title: "شقة 152م دور خامس على الشبان المسلمين — 3 غرف و3 حمامات", type: APT, status: "للبيع", badge: "مميز", price: "9,000 ج.م / المتر", area: "152 م²", rooms: 3, location: "الشبان المسلمين الرئيسي" },
  { id: "p14", code: "M-014", title: "شقة 133م دور تاسع على الشبان الرئيسي", type: APT, status: "للبيع", price: "900,000 ج.م", area: "133 م²", rooms: roomsFor(133), location: "الشبان المسلمين الرئيسي" },
  { id: "p15", code: "M-015", title: "شقة 151م أرض المحلج — دور سادس برج خوازيق", type: APT, status: "للبيع", price: "950,000 ج.م", area: "151 م²", rooms: roomsFor(151), location: "أرض المحلج — مغاغة، المنيا" },
  { id: "p16", code: "M-016", title: "شقة 140م واجهة شارع 8م — دور سادس", type: APT, status: "للبيع", price: "850,000 ج.م", area: "140 م²", rooms: roomsFor(140), location: "مغاغة، المنيا" },
  { id: "p17", code: "M-017", title: "شقة 165م ناصية شارع 12×12 أرض المحلج — دور سادس", type: APT, status: "للبيع", badge: "مميز", price: "1,150,000 ج.م", area: "165 م²", rooms: roomsFor(165), location: "أرض المحلج — مغاغة، المنيا" },
  { id: "p18", code: "M-018", title: "شقة 162م ناصية شارع 12×8 — دور خامس", type: APT, status: "للبيع", price: "1,100,000 ج.م", area: "162 م²", rooms: roomsFor(162), location: "مغاغة، المنيا" },
  { id: "p19", code: "M-019", title: "شقة 162م ناصية شارع 12×8 — دور سادس", type: APT, status: "للبيع", price: "1,100,000 ج.م", area: "162 م²", rooms: roomsFor(162), location: "مغاغة، المنيا" },
  { id: "p20", code: "M-020", title: "شقة 117م دور عاشر خلف رانين — واجهة قبلية", type: APT, status: "للبيع", badge: "فرصة استثمارية", price: "630,000 ج.م", area: "117 م²", rooms: roomsFor(117), location: "خلف رانين — مغاغة، المنيا" },
  { id: "p21", code: "M-021", title: "شقة 128م ناصية دور ثالث على الشبان الرئيسي", type: APT, status: "للبيع", price: "9,500 ج.م / المتر", area: "128 م²", rooms: roomsFor(128), location: "الشبان المسلمين الرئيسي" },
  { id: "p22", code: "M-022", title: "شقة 130م ناصية أرض المحلج شارع 10×12 — دور سابع", type: APT, status: "للبيع", price: "1,000,000 ج.م", area: "130 م²", rooms: roomsFor(130), location: "أرض المحلج — مغاغة، المنيا" },
  { id: "p23", code: "M-023", title: "شقة 110م تشطيب كامل ببرج استوديو عادل القديم", type: APT, status: "للبيع", badge: "مميز", price: "1,300,000 ج.م", area: "110 م²", rooms: roomsFor(110), location: "برج استوديو عادل — مغاغة، المنيا" },
  { id: "p24", code: "M-024", title: "شقة 117م دور ثالث — 3 غرف وحمام ومطبخ", type: APT, status: "للبيع", price: "850,000 ج.م", area: "117 م²", rooms: 3, location: "مغاغة، المنيا" },
  { id: "p25", code: "M-025", title: "شقة 117م دور ثامن — 3 غرف", type: APT, status: "للبيع", price: "760,000 ج.م", area: "117 م²", rooms: 3, location: "مغاغة، المنيا" },
  { id: "p26", code: "M-026", title: "شقة 128م ناصية دور عاشر بجوار الكنيسة", type: APT, status: "للبيع", price: "800,000 ج.م", area: "128 م²", rooms: roomsFor(128), location: "بجوار الكنيسة — مغاغة، المنيا" },
  { id: "p27", code: "M-027", title: "شقة 90م ثاني بلكونة — منشية فوزية", type: APT, status: "للبيع", price: "700,000 ج.م", area: "90 م²", rooms: roomsFor(90), location: "منشية فوزية — مغاغة، المنيا" },
  { id: "p28", code: "M-028", title: "شقة 152م تشطيب لوكس دور 11 فوق روف — منشية فوزية", type: APT, status: "للبيع", badge: "مميز", price: "1,250,000 ج.م", area: "152 م²", rooms: roomsFor(152), location: "منشية فوزية — مغاغة، المنيا" },
  { id: "p29", code: "M-029", title: "شقة بيت أهالي — ثاني نمرة من عبدالعظيم", type: APT, status: "للبيع", price: "650,000 ج.م", area: "—", rooms: 3, location: "شارع عبدالعظيم — مغاغة، المنيا" },
  { id: "p30", code: "M-030", title: "شقة بيت أهالي خلف كنيسة المرازي — تشطيب لوكس", type: APT, status: "للبيع", badge: "مميز", price: "750,000 ج.م (قابل للتفاوض)", area: "—", rooms: 3, location: "خلف كنيسة المرازي — مغاغة، المنيا" },
  { id: "p31", code: "M-031", title: "شقة سوبر لوكس دور عاشر بين جامع الفتح وميدان المطافي", type: APT, status: "للبيع", badge: "مميز", price: "1,350,000 ج.م (قابل للتفاوض)", area: "—", rooms: 3, location: "جامع الفتح — ميدان المطافي" },
  { id: "o1",  code: "M-032", title: "دور إداري أول بلكونة 560م — شارع الثورة الرئيسي", type: OFFICE, status: "للبيع", badge: "مميز", price: "125,000 ج.م / المتر", area: "560 م²", rooms: 0, location: "شارع الثورة الرئيسي" },
  { id: "o2",  code: "M-033", title: "دور أول بلكونة 748م (5 شقق) — المحلج البحري", type: OFFICE, status: "للبيع", price: "السعر عند المعاينة", area: "748 م²", rooms: 0, location: "المحلج البحري" },
  { id: "o3",  code: "M-034", title: "دور أول بلكونة 573م (4 شقق) — المحلج البحري عند المطرانية", type: OFFICE, status: "للبيع", price: "السعر عند المعاينة", area: "573 م²", rooms: 0, location: "المحلج البحري — عند المطرانية" },
  { id: "o4",  code: "M-035", title: "دور إداري ثالث 560م (4 شقق) — الإبراهيمية بجوار رانين", type: OFFICE, status: "للبيع", price: "9,000 ج.م / المتر", area: "560 م²", rooms: 0, location: "شارع الإبراهيمية — بجوار رانين" },
  { id: "l1",  code: "M-036", title: "أرض 250م بين المحلجين — أرض المحلج", type: LAND, status: "للبيع", badge: "فرصة استثمارية", price: "23,000 ج.م / المتر", area: "250 م²", rooms: 0, location: "بين المحلجين — أرض المحلج" },
  { id: "l2",  code: "M-037", title: "أرض 500م أمام مستشفى قليني — الرئيسي", type: LAND, status: "للبيع", badge: "مميز", price: "35,000 ج.م / المتر", area: "500 م²", rooms: 0, location: "أمام مستشفى قليني" },
  { id: "l3",  code: "M-038", title: "أرض 140م قرب شارع المستشفى الرئيسي", type: LAND, status: "للبيع", price: "18,000 ج.م / المتر", area: "140 م²", rooms: 0, location: "شارع المستشفى الرئيسي" },
  { id: "l4",  code: "M-039", title: "أرض 80م قرب شارع المستشفى الرئيسي", type: LAND, status: "للبيع", price: "18,000 ج.م / المتر", area: "80 م²", rooms: 0, location: "شارع المستشفى الرئيسي" },
  { id: "l5",  code: "M-040", title: "أرض 105م متفرعة من شارع عباس", type: LAND, status: "للبيع", price: "260,000 ج.م", area: "105 م²", rooms: 0, location: "متفرع من شارع عباس" },
  { id: "l6",  code: "M-041", title: "أرض 150م متفرعة من شارع عباس", type: LAND, status: "للبيع", price: "5,500 ج.م / المتر", area: "150 م²", rooms: 0, location: "متفرع من شارع عباس" },
  { id: "l7",  code: "M-042", title: "أرض 140م خلف الملاهي أمام المستشفى", type: LAND, status: "للبيع", price: "7,500 ج.م / المتر", area: "140 م²", rooms: 0, location: "خلف الملاهي — أمام المستشفى" },
  { id: "l8",  code: "M-043", title: "أرض 350م شارع الشواني الرئيسي — بجوار كوبري اليف", type: LAND, status: "للبيع", badge: "مميز", price: "30,000 ج.م / المتر", area: "350 م²", rooms: 0, location: "شارع الشواني — كوبري اليف" },
  { id: "l9",  code: "M-044", title: "أرض 500م شارع الشواني الرئيسي", type: LAND, status: "للبيع", price: "20,000 ج.م / المتر", area: "500 م²", rooms: 0, location: "شارع الشواني الرئيسي" },
  { id: "l10", code: "M-045", title: "أرض 250م تشوينة شارع الشواني", type: LAND, status: "للبيع", price: "20,000 ج.م / المتر", area: "250 م²", rooms: 0, location: "شارع الشواني" },
  { id: "l11", code: "M-046", title: "أرض 1500م شارع المدارس الخاصة", type: LAND, status: "للبيع", badge: "فرصة استثمارية", price: "11,000 ج.م / المتر", area: "1,500 م²", rooms: 0, location: "شارع المدارس الخاصة" },
  { id: "l12", code: "M-047", title: "أرض 100م خلف المطرانية — شارع 8م", type: LAND, status: "للبيع", price: "25,000 ج.م / المتر", area: "100 م²", rooms: 0, location: "خلف المطرانية" },
  { id: "l13", code: "M-048", title: "قطعة أرض 200م ثاني نمرة من شارع الثورة", type: LAND, status: "للبيع", badge: "مميز", price: "90,000 ج.م / المتر", area: "200 م²", rooms: 0, location: "متفرع من شارع الثورة" },
  { id: "l14", code: "M-049", title: "قطعة أرض 83م خلف النادي جروب — الشواني", type: LAND, status: "للبيع", price: "350,000 ج.م", area: "83 م²", rooms: 0, location: "خلف النادي — الشواني" },
  { id: "l15", code: "M-050", title: "أرض 140م المحلج القبلي", type: LAND, status: "للبيع", price: "13,000 ج.م / المتر", area: "140 م²", rooms: 0, location: "المحلج القبلي" },
  { id: "h1",  code: "M-051", title: "بيت 80م دورين تشطيب لوكس — قرب المطرانية القديمة", type: HOUSE, status: "للبيع", badge: "مميز", price: "2,250,000 ج.م", area: "80 م²", rooms: 4, location: "قرب المطرانية القديمة" },
  { id: "h2",  code: "M-052", title: "بيت 105م 3 أدوار ناصية على الرئيسي — شارع الكنيسة", type: HOUSE, status: "للبيع", badge: "مميز", price: "3,500,000 ج.م", area: "105 م²", rooms: 5, location: "شارع الكنيسة — الرئيسي" },
  { id: "h3",  code: "M-053", title: "بيت 80م قديم بعمدان وعدادات كاملة — قرب الكنيسة القديمة", type: HOUSE, status: "للبيع", price: "1,200,000 ج.م", area: "80 م²", rooms: 3, location: "قرب الكنيسة القديمة" },
  { id: "h4",  code: "M-054", title: "بيت 100م خلف المطرانية الجديدة — دورين تشطيب كامل", type: HOUSE, status: "للبيع", price: "3,000,000 ج.م", area: "100 م²", rooms: 4, location: "خلف المطرانية الجديدة" },
  { id: "h5",  code: "M-055", title: "بيت 100م 4 أدوار تشطيب لوكس + 3 محلات — شارع السجل", type: HOUSE, status: "للبيع", badge: "مميز", price: "4,500,000 ج.م", area: "100 م²", rooms: 6, location: "شارع السجل" },
  { id: "h6",  code: "M-056", title: "بيت 110م 5 أدوار — ثاني نمرة من الرئيسي", type: HOUSE, status: "للبيع", badge: "مميز", price: "4,500,000 ج.م", area: "110 م²", rooms: 6, location: "متفرع من الرئيسي" },
  { id: "h7",  code: "M-057", title: "بيت 55م 5 أدوار — منشية الجزائر شارع المطحن", type: HOUSE, status: "للبيع", price: "2,700,000 ج.م", area: "55 م²", rooms: 5, location: "منشية الجزائر — شارع المطحن" },
  { id: "h8",  code: "M-058", title: "بيت 40م دورين مشطبين والثالث متحوط — خلف معرض أحمد حته", type: HOUSE, status: "للبيع", badge: "فرصة استثمارية", price: "500,000 ج.م", area: "40 م²", rooms: 3, location: "خلف معرض أحمد حته" },
  { id: "h9",  code: "M-059", title: "بيت 150م بأرض المحلج القبلي — دورين عمدان تتحمل 10 أدوار", type: HOUSE, status: "للبيع", badge: "فرصة استثمارية", price: "3,000,000 ج.م", area: "150 م²", rooms: 4, location: "أرض المحلج القبلي" },
];

/** Group properties by their type for sectioned listings. */
export function groupByType(items: Property[] = properties) {
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