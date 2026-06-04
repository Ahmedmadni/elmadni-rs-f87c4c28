## الخطة

### 1) إتاحة "اعرض عقارك" لجميع المستخدمين المسجلين
- إزالة شرط `canPublish` من `src/routes/sell.tsx` — أي مستخدم مسجّل يستطيع تقديم عقار.
- العقار يُحفظ بـ `review_status: "pending"` و `published: false` ولا يظهر علناً إلا بعد موافقة الأدمن من شاشة `admin.requests` (سلوك موجود مسبقاً).
- migration لتأكيد سياسة RLS على `properties`: السماح للمستخدم بـ INSERT بشرط `owner_id = auth.uid()` و `review_status = 'pending'` و `published = false` فقط.

### 2) كود العقار تسلسلي إجباري وغير قابل للتعديل
- إنشاء `SEQUENCE public.property_code_seq` تبدأ من 1000.
- إضافة دالة `gen_property_code()` تُرجع `'MAD-' || nextval('property_code_seq')`.
- جعل عمود `code` في `properties`:
  - `NOT NULL`
  - `DEFAULT gen_property_code()`
  - `UNIQUE`
- Trigger `BEFORE INSERT`: يتجاهل أي قيمة يرسلها العميل لـ `code` ويُسند القيمة من السيكوينس دائماً.
- Trigger `BEFORE UPDATE`: يمنع تغيير `code` (يُعيد القيمة القديمة دائماً، حتى للأدمن).
- تحديث `src/routes/sell.tsx` لإزالة توليد الكود من جهة العميل (`"MAD-" + Math.random()...`) — قاعدة البيانات تتكفّل بذلك.
- العقارات القديمة تحتفظ بأكوادها (الـ trigger يحافظ على القيم الموجودة عند UPDATE).

### 3) رفع تباين الخطوط في الوضعين النهاري والليلي
- `src/styles.css`: رفع تباين `--foreground` و `--muted-foreground` و `--card-foreground` و `--popover-foreground` و `--secondary-foreground` في الوضعين (نسبة ≥ 4.5:1 مع الخلفية).
- استبدال الألوان الثابتة (`text-[oklch(0.97_...)]`, `text-[oklch(0.12_...)]`) بـ tokens دلالية في:
  - `src/routes/index.tsx` (CTA heading + subtitle)
  - `src/components/site/PropertyCard.tsx` (badges + status pill)
  - `src/components/site/AIAssistant.tsx` (نص "AI · INSTANT")
- رفع شفافيات النصوص الفرعية (`/85` → `/95`, `placeholder /60` → `/80`).

### ملفات ستتغيّر
- `src/routes/sell.tsx` — إزالة `canPublish` gate، إزالة توليد كود من العميل، رفع تباين placeholders/labels.
- `src/styles.css` — توكنات ألوان أوضح في الوضعين.
- `src/routes/index.tsx`, `src/components/site/PropertyCard.tsx`, `src/components/site/AIAssistant.tsx` — استبدال الألوان الثابتة.
- Migration واحد: سيكوينس + دالة + DEFAULT + triggers تمنع التعديل + سياسة RLS لـ INSERT للمستخدم العادي.

### ضمانات الأمان
- المستخدم العادي لا يستطيع نشر عقاره ذاتياً (السياسة تُجبر `pending` + `published=false` في `WITH CHECK`).
- لا أحد (حتى المسوّق أو الأدمن من تطبيق العميل) يستطيع التحكم في كود العقار — الـ trigger يتجاوز أي قيمة مُرسلة.
- الموافقة على النشر تبقى حصراً للأدمن.
