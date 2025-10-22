# ✈️ صفحات البحث والحجوزات - دليل شامل

## ✅ ما تم بناؤه

تم بناء **3 صفحات كاملة** مع دعم ثنائي اللغة (عربي/إنجليزي):

1. **صفحة البحث** (Flight Search)
2. **صفحة النتائج** (Search Results)
3. **صفحة حجوزاتي** (My Bookings)

---

## 🚀 الميزات

### **1. صفحة البحث** (`/search`)

**المميزات:**
- ✅ نموذج بحث احترافي
- ✅ خيار ذهاب وعودة / ذهاب فقط
- ✅ اختيار المدن والتواريخ
- ✅ عدد المسافرين
- ✅ اختيار الدرجة (اقتصادية/أعمال/أولى)
- ✅ قسم الوجهات الشائعة (6 مدن)
- ✅ تصميم جميل مع تدرجات
- ✅ حركات انيميشن
- ✅ RTL/LTR دعم كامل

**الوجهات الشائعة:**
- القاهرة / Cairo
- دبي / Dubai
- لندن / London
- نيويورك / New York
- باريس / Paris
- طوكيو / Tokyo

---

### **2. صفحة النتائج** (`/search/results`)

**المميزات:**
- ✅ عرض نتائج البحث
- ✅ كروت رحلات احترافية
- ✅ معلومات كاملة (الوقت، المدة، السعر)
- ✅ رموز المطارات
- ✅ عدد التوقفات
- ✅ زر الحجز
- ✅ ترتيب حسب (السعر/المدة)
- ✅ فلاتر (قريباً)
- ✅ تحميل المزيد
- ✅ ملخص البحث

**معلومات كل رحلة:**
- شركة الطيران
- وقت المغادرة والوصول
- المدة الكلية
- عدد التوقفات
- الدرجة
- السعر (بالجنيه المصري)

---

### **3. صفحة الحجوزات** (`/bookings`)

**المميزات:**
- ✅ عرض جميع الحجوزات
- ✅ تبويبات (الكل/القادمة/السابقة)
- ✅ حالات مختلفة (مؤكد/قيد الانتظار/ملغي)
- ✅ تفاصيل كاملة لكل حجز
- ✅ رقم المرجع
- ✅ تحميل التذكرة (PDF)
- ✅ إرسال بالبريد
- ✅ إلغاء الحجز
- ✅ إتمام الدفع (للحجوزات المعلقة)
- ✅ تصميم responsive

**حالات الحجز:**
- ✅ **مؤكد**: أخضر - يمكن تحميل/إرسال/إلغاء
- ⏳ **قيد الانتظار**: أصفر - يمكن إتمام الدفع أو إلغاء
- ❌ **ملغي**: أحمر - للعرض فقط

---

## 📱 الصفحات والروابط

| الصفحة | المسار | الوصف |
|--------|--------|-------|
| البحث | `/search` | نموذج البحث عن الرحلات |
| النتائج | `/search/results` | عرض نتائج البحث |
| الحجوزات | `/bookings` | إدارة الحجوزات |

---

## 🎨 التصميم

### **نظام الألوان:**
- **Primary**: أزرق وسماوي (Blue-Cyan gradient)
- **Success**: أخضر (للحجوزات المؤكدة)
- **Warning**: أصفر (للحجوزات المعلقة)
- **Danger**: أحمر (للحجوزات الملغاة)
- **Background**: تدرج فاتح (blue-50 to cyan-50)

### **المكونات المستخدمة:**
- shadcn/ui components
- Framer Motion للحركات
- Lucide React للأيقونات
- Tailwind CSS للتنسيق

---

## 🌍 الترجمات

تمت إضافة **60+ ترجمة جديدة**:

### **البحث:**
```typescript
'search.hero.title' - عنوان الصفحة
'search.from' - من
'search.to' - إلى
'search.depart' - تاريخ المغادرة
'search.return' - تاريخ العودة
'search.passengers' - المسافرون
'search.class' - الدرجة
'search.button' - زر البحث
// ... والمزيد
```

### **الحجوزات:**
```typescript
'bookings.title' - حجوزاتي
'bookings.status.confirmed' - مؤكد
'bookings.download' - تحميل التذكرة
'bookings.cancel' - إلغاء الحجز
// ... والمزيد
```

---

## 💻 الكود

### **مثال: استخدام الترجمة**

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function FlightSearch() {
  const { t, language } = useLanguage();
  
  return (
    <h1>{t('search.hero.title')}</h1>
    // Arabic: "ابحث عن رحلتك المثالية"
    // English: "Find Your Perfect Flight"
  );
}
```

### **مثال: التنقل مع البيانات**

```tsx
// في صفحة البحث
navigate('/search/results', { 
  state: { ...formData, tripType } 
});

// في صفحة النتائج
const searchParams = location.state;
```

---

## 🔄 سير العمل

### **رحلة المستخدم:**

```
1. المستخدم يفتح /search
   ↓
2. يملأ نموذج البحث
   - من: القاهرة
   - إلى: دبي
   - تاريخ المغادرة
   - عدد المسافرين
   ↓
3. يضغط "ابحث عن رحلات"
   ↓
4. ينتقل إلى /search/results
   ↓
5. يختار رحلة
   ↓
6. يضغط "احجز الآن"
   ↓
7. ينتقل إلى صفحة الدفع (قريباً)
   ↓
8. بعد الدفع → الحجز يظهر في /bookings
```

---

## 📊 البيانات المستخدمة

### **نموذج الرحلة:**
```typescript
interface Flight {
  id: string;
  airline: string;        // اسم شركة الطيران
  from: string;           // المدينة/المطار المغادرة
  to: string;             // الوجهة
  departTime: string;     // وقت المغادرة
  arriveTime: string;     // وقت الوصول
  duration: string;       // المدة
  price: number;          // السعر
  stops: number;          // عدد التوقفات
  class: string;          // الدرجة
}
```

### **نموذج الحجز:**
```typescript
interface Booking {
  id: string;
  bookingRef: string;     // رقم المرجع
  status: 'confirmed' | 'cancelled' | 'pending';
  airline: string;
  from: string;
  to: string;
  departDate: string;
  departTime: string;
  passengers: number;
  class: string;
  price: number;
  bookedDate: string;     // تاريخ الحجز
}
```

---

## 🎯 الوظائف المتوفرة

### **في صفحة البحث:**
```tsx
// تبديل نوع الرحلة
setTripType('roundtrip' | 'oneway')

// تحديث بيانات النموذج
handleInputChange(field, value)

// البحث والانتقال للنتائج
handleSearch()

// اختيار وجهة شائعة
onClick={() => handleInputChange('to', destination)}
```

### **في صفحة النتائج:**
```tsx
// ترتيب النتائج
setSortBy('price' | 'duration')

// حجز رحلة
handleBookFlight(flight)
```

### **في صفحة الحجوزات:**
```tsx
// تبديل التبويبات
setActiveTab('all' | 'upcoming' | 'past')

// تحميل التذكرة
handleDownloadTicket(booking)

// إرسال بالبريد
handleSendEmail(booking)

// إلغاء الحجز
handleCancelBooking(booking)
```

---

## 🧪 كيفية الاختبار

### **1. صفحة البحث:**
```bash
# شغل التطبيق
cd frontend && npm run dev

# افتح المتصفح
http://localhost:5173/search

# جرب:
- ✅ تبديل ذهاب وعودة / ذهاب فقط
- ✅ اختيار التواريخ
- ✅ اختيار عدد المسافرين
- ✅ اضغط على وجهة شائعة
- ✅ ابحث
```

### **2. صفحة النتائج:**
```bash
# بعد البحث تلقائياً
http://localhost:5173/search/results

# جرب:
- ✅ ترتيب حسب السعر
- ✅ ترتيب حسب المدة
- ✅ اضغط "احجز الآن"
```

### **3. صفحة الحجوزات:**
```bash
# افتح الحجوزات
http://localhost:5173/bookings

# جرب:
- ✅ تبديل التبويبات (الكل/القادمة/السابقة)
- ✅ تحميل التذكرة
- ✅ إرسال بالبريد
- ✅ إلغاء حجز
```

---

## 🌟 تحسينات مستقبلية

### **قريباً:**
- 🔜 فلاتر متقدمة (السعر، الوقت، شركة الطيران)
- 🔜 خريطة للمطارات
- 🔜 مقارنة الرحلات
- 🔜 حفظ الرحلات المفضلة
- 🔜 تنبيهات الأسعار
- 🔜 صفحة الدفع
- 🔜 ربط مع Backend API حقيقي

### **تحسينات UI:**
- 🔜 رسوم بيانية للأسعار
- 🔜 جدول زمني مرئي
- 🔜 صور المدن
- 🔜 تقييمات المستخدمين
- 🔜 تفاصيل الطائرة

---

## 🔌 التكامل مع Backend

### **نقاط النهاية المطلوبة:**

```typescript
// البحث عن رحلات
POST /api/flights/search
Body: {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  class: string;
}
Response: Flight[]

// إنشاء حجز
POST /api/bookings
Body: {
  flightId: string;
  passengers: PassengerInfo[];
  paymentInfo: PaymentInfo;
}
Response: Booking

// الحصول على الحجوزات
GET /api/bookings
Response: Booking[]

// إلغاء حجز
DELETE /api/bookings/:id
Response: { success: boolean }
```

---

## 📱 Responsive Design

### **نقاط الانكسار:**
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### **تحسينات للموبايل:**
- ✅ نموذج البحث عمودي
- ✅ كروت الرحلات قابلة للتمرير
- ✅ أزرار كبيرة للمس
- ✅ نص مقروء
- ✅ تنقل سهل

---

## 🎨 مكونات مخصصة

### **تم إنشاء:**
1. **FlightCard** - كرت عرض الرحلة
2. **BookingCard** - كرت عرض الحجز
3. **SearchForm** - نموذج البحث
4. **StatusBadge** - شارة الحالة
5. **PriceDisplay** - عرض السعر

---

## ✅ Checklist للإنتاج

### **قبل النشر:**
- [ ] ربط مع Backend API
- [ ] إضافة معالجة الأخطاء
- [ ] إضافة Loading states
- [ ] إضافة Pagination
- [ ] إضافة الفلاتر
- [ ] اختبار على أجهزة مختلفة
- [ ] اختبار اللغتين (عربي/إنجليزي)
- [ ] اختبار RTL/LTR
- [ ] تحسين SEO
- [ ] إضافة Analytics

---

## 🚀 كيفية الاستخدام

### **1. تشغيل التطبيق:**
```bash
cd frontend
npm run dev
```

### **2. التنقل:**
```bash
# الصفحة الرئيسية → اضغط "ابحث عن رحلات"
http://localhost:5173

# أو مباشرة للبحث
http://localhost:5173/search

# الحجوزات
http://localhost:5173/bookings
```

### **3. التبديل بين اللغات:**
```bash
# اضغط زر اللغة في أعلى اليمين
# عربي ↔ English
```

---

## 📊 ملخص الإحصائيات

**الملفات المضافة:**
- ✅ FlightSearch.tsx (410 سطر)
- ✅ SearchResults.tsx (280 سطر)
- ✅ MyBookings.tsx (360 سطر)

**الترجمات:**
- ✅ 60+ مفتاح ترجمة جديد
- ✅ كل النصوص باللغتين

**المكونات:**
- ✅ 3 صفحات كاملة
- ✅ 8+ مكونات UI
- ✅ دعم RTL/LTR كامل

---

## 🎉 الميزات الرئيسية

### **✅ ما يعمل الآن:**
1. **صفحة بحث احترافية** مع نموذج كامل
2. **نتائج بحث** مع معلومات تفصيلية
3. **إدارة الحجوزات** مع حالات مختلفة
4. **ثنائي اللغة** كامل (عربي/إنجليزي)
5. **RTL/LTR** تلقائي
6. **تصميم responsive** للموبايل
7. **حركات جميلة** (Framer Motion)
8. **UI احترافي** (shadcn/ui)

---

## 📞 الدعم

### **المشاكل الشائعة:**

**1. الصفحات لا تظهر**
```bash
# تأكد من:
- import الصفحات في App.tsx
- Routes محدثة
- npm run dev شغال
```

**2. الترجمات لا تعمل**
```bash
# تأكد من:
- LanguageProvider محيط App
- استخدام useLanguage() في الصفحة
- المفاتيح موجودة في LanguageContext
```

**3. RTL لا يعمل**
```bash
# تأكد من:
- document.documentElement.dir = 'rtl'
- LanguageContext يحدث dir
- Tailwind يدعم RTL
```

---

## 🎯 الخطوات التالية

### **التطوير:**
1. بناء صفحة الدفع
2. ربط مع Backend API
3. إضافة الفلاتر المتقدمة
4. بناء لوحة تحكل المستخدم

### **التحسينات:**
1. إضافة صور للمدن
2. تحسين الـ SEO
3. إضافة مخطط سعر
4. تحسين السرعة

---

**✈️ صفحات البحث والحجوزات جاهزة! جربها الآن! 🚀**

---

## 🌟 روابط سريعة

- **البحث**: http://localhost:5173/search
- **الحجوزات**: http://localhost:5173/bookings
- **الرئيسية**: http://localhost:5173

---

**تم البناء بـ ❤️ مع React, TypeScript, Tailwind CSS**
