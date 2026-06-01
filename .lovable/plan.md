## خطة بناء منصة العقارات الكاملة على Lovable Cloud

العمل ضخم — سأنفّذه على مراحل متتابعة بعد موافقتك، وكل مرحلة قابلة للاختبار قبل الانتقال للتالية.

---

### المرحلة 1 — قاعدة البيانات والتخزين (Migration واحدة)
- توسيع جدول `properties` بحقول: `owner_id`, `description_full`, `city`, `district`, `purpose`, `bedrooms`, `bathrooms`, `address`, `contact_name`, `contact_phone`, `rejection_reason`, وتحويل `status` إلى enum: `pending | approved | rejected`.
- جداول جديدة:
  - `profiles` (id, full_name, email, phone, avatar_url, created_at) — مع trigger إنشاء تلقائي بعد التسجيل.
  - `property_images` (id, property_id, url, sort_order).
  - `purchase_requests` (buyer_name, buyer_email, buyer_phone, property_id, message, status).
  - `property_status_history` (property_id, old_status, new_status, changed_by, reason).
  - `notifications` (user_id, type, title, body, read, link).
- Buckets: `avatars` (public) — `property-images` موجود بالفعل.
- سياسات RLS كاملة + GRANTs:
  - Public يرى فقط `status = approved` و `published = true`.
  - المستخدم يدير عقاراته فقط.
  - الأدمن يدير الكل (عبر `has_role`).
  - `profiles` يقرأها صاحبها والأدمن.
  - `purchase_requests` يراها المالك + الأدمن، الزائر ينشئها.

---

### المرحلة 2 — المصادقة (Auth)
- إعداد `auto_confirm_email = false` (يتطلب تحقق إيميل) + Google sign-in عبر broker.
- صفحات: `/login`, `/signup`, `/forgot-password`, `/reset-password`.
- إعداد قوالب الإيميل الخاصة بـ Auth (verification + password reset) بهوية مدني.
- Layout محمي `_authenticated/` + Layout للأدمن `_authenticated/_admin/` يستخدم `has_role`.
- ربط `attachSupabaseAuth` في `src/start.ts`.
- استبدال زر "تسجيل دخول الأدمن" في Navbar بحالة المستخدم الفعلية.

---

### المرحلة 3 — لوحة تحكم المستخدم `/dashboard`
- **عقاراتي**: قائمة بحالة كل عقار (قيد المراجعة / موافق / مرفوض).
- **إضافة عقار**: نموذج كامل + رفع صور متعددة إلى `property-images/{user_id}/...`.
- **تعديل/حذف** للعقارات `pending` فقط.
- **طلبات الشراء** الواردة على عقاراته.
- **إعدادات الملف الشخصي** + رفع avatar.

---

### المرحلة 4 — لوحة تحكم الأدمن `/admin`
- نظرة عامة (إحصائيات: عدد العقارات، قيد المراجعة، المستخدمون، الطلبات).
- إدارة العقارات (CRUD كامل + Toggle published/featured).
- صف "قيد المراجعة" مع زرّي موافقة/رفض (رفض يطلب سبب).
- إدارة المستخدمين (عرض + ترقية لأدمن).
- إدارة طلبات الشراء.
- استخدام `requireSupabaseAuth` + فحص دور أدمن في كل serverFn حسّاس.

---

### المرحلة 5 — الواجهة العامة + طلبات الشراء
- تحديث `/properties` و `/properties/$id` لقراءة من Supabase (فقط `approved`).
- معرض صور (slider) باستخدام `property_images`.
- نموذج "طلب شراء/استفسار" في صفحة تفاصيل العقار → يُحفظ في `purchase_requests` ويُرسل واتساب للمالك/الأدمن.
- خرائط Google تبقى عبر iframe (lat/lng موجودة).

---

### المرحلة 6 — لمسات نهائية
- إشعارات Toast لكل العمليات.
- Loading states + Skeletons.
- SEO meta لكل route.
- اختبار شامل عبر invoke-server-function + console logs.

---

### ملاحظات تنفيذية
- كل serverFn حسّاس يستخدم `requireSupabaseAuth` + فحص `has_role('admin')` عند اللزوم.
- الصور تُرفع مباشرة من المتصفح إلى Supabase Storage بسياسة `auth.uid()::text = (storage.foldername(name))[1]`.
- أول مستخدم يسجّل = أدمن تلقائياً (Trigger موجود مسبقاً).

---

### ما أحتاج تأكيده منك قبل البدء
1. **تحقق الإيميل**: هل تريد إجبار المستخدمين على تأكيد إيميلهم قبل الدخول؟ (موصى به أمنياً، لكن قد تفضّل دخول فوري للتجربة).
2. **Google sign-in**: هل أُفعّله بجانب الإيميل/كلمة السر؟
3. **قوالب الإيميل**: هل أُعدّ قوالب Auth Email المخصصة بهوية مدني الآن، أم لاحقاً؟

بعد ردّك سأبدأ فوراً بالمرحلة 1 (Migration).
