# 🌍 Arabic Language Support - Amrikyy Platform

Complete guide for Arabic language support with RTL (Right-to-Left) layout and proper font rendering.

---

## ✅ What's Implemented

### 1. **Arabic Fonts**
- **Cairo** - Modern, clean Arabic font (primary)
- **Tajawal** - Alternative Arabic font (fallback)
- Proper font-feature-settings for ligatures and kerning
- Antialiasing for smooth rendering

### 2. **RTL Support**
- Automatic direction switching (RTL for Arabic, LTR for English)
- Proper text alignment
- Unicode bidirectional text support
- Mixed content handling (Arabic + English)

### 3. **Language Context**
- React Context for global language state
- `useLanguage()` hook for components
- Translation dictionary with 40+ keys
- LocalStorage persistence

### 4. **UI Components**
- Language switcher button (top navigation)
- Automatic font switching
- Proper line-height for Arabic text
- Better letter-spacing

---

## 🚀 How to Use

### **Switch Language**

Click the language switcher button (🌍) in the navigation:
- Shows "العربية" when in English mode
- Shows "English" when in Arabic mode

### **In Your Components**

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t, language, isRTL } = useLanguage();
  
  return (
    <div className={isRTL ? 'text-right' : 'text-left'}>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
    </div>
  );
}
```

### **Available Translation Keys**

#### Navigation
- `nav.home` - الرئيسية / Home
- `nav.about` - من نحن / About
- `nav.services` - خدماتنا / Services
- `nav.contact` - تواصل معنا / Contact
- `nav.login` - تسجيل الدخول / Login
- `nav.signup` - إنشاء حساب جديد / Sign Up

#### Hero Section
- `hero.title` - رفيقك الذكي في عالم السفر
- `hero.subtitle` - اكتشف وجهات جديدة، خطط رحلتك المثالية...
- `hero.cta` - ابدأ رحلتك الآن
- `hero.learn_more` - اعرف المزيد عنا

#### Features
- `features.title` - لماذا تختار منصة أمريكي؟
- `features.ai_assistant` - مساعد السفر الذكي
- `features.ai_assistant_desc` - احصل على توصيات مخصصة...
- `features.smart_booking` - حجز ذكي ومرن
- `features.smart_booking_desc` - اعثر على أفضل العروض...
- `features.trip_planning` - تخطيط شامل للرحلات
- `features.trip_planning_desc` - خطط لرحلتك بالكامل...
- `features.24_support` - دعم فني متواصل
- `features.24_support_desc` - فريق الدعم متاح على مدار الساعة...

#### Search
- `search.placeholder` - إلى أين تريد السفر؟
- `search.from` - من
- `search.to` - إلى
- `search.date` - تاريخ السفر
- `search.travelers` - عدد المسافرين
- `search.search` - ابحث عن رحلات

#### Common
- `common.loading` - جارٍ التحميل...
- `common.error` - حدث خطأ
- `common.success` - تمت العملية بنجاح
- `common.cancel` - إلغاء
- `common.confirm` - تأكيد
- `common.save` - حفظ
- `common.edit` - تعديل
- `common.delete` - حذف

---

## 📝 Adding New Translations

Edit `/frontend/src/contexts/LanguageContext.tsx`:

```tsx
const translations: Record<Language, Record<string, string>> = {
  en: {
    'my.new.key': 'English Text',
  },
  ar: {
    'my.new.key': 'النص العربي',
  },
};
```

---

## 🎨 CSS Classes for Arabic

### **Automatic Classes**
When Arabic is selected, these are applied automatically:
- `[dir="rtl"]` on `<html>`
- `.arabic-text` on `<body>`

### **Manual Classes**
Use these for specific elements:

```css
/* Force Arabic font */
.arabic-text {
  font-family: var(--font-arabic);
  direction: rtl;
  text-align: right;
  line-height: 1.8;
}

/* Mixed content (Arabic + English) */
.mixed-content {
  font-family: var(--font-arabic);
  unicode-bidi: plaintext;
}
```

---

## 🔧 Technical Details

### **Font Loading**
Fonts are loaded from Google Fonts CDN:
```css
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
```

### **Font Features**
```css
font-feature-settings: "liga" 1, "calt" 1, "kern" 1;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

### **Direction Switching**
```javascript
document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = language;
```

---

## 🐛 Troubleshooting

### **Arabic text looks broken**
- **Issue**: Characters not connecting properly
- **Solution**: Ensure Cairo or Tajawal fonts are loaded
- **Check**: Browser DevTools → Network → Filter "fonts"

### **Text alignment wrong**
- **Issue**: Arabic text aligned left
- **Solution**: Check `dir="rtl"` on parent element
- **Fix**: Add `className={isRTL ? 'text-right' : 'text-left'}`

### **Mixed Arabic/English looks weird**
- **Issue**: Numbers or English words in wrong position
- **Solution**: Use `unicode-bidi: plaintext`
- **Fix**: Add `className="mixed-content"`

### **Language not persisting**
- **Issue**: Language resets on page reload
- **Solution**: Check localStorage
- **Debug**: Open DevTools → Application → Local Storage → Check "language" key

### **Font not loading**
- **Issue**: Fallback to system font
- **Solution**: Check internet connection (fonts from CDN)
- **Alternative**: Download fonts and host locally

---

## 📱 Mobile Support

Arabic support works on all mobile devices:
- iOS Safari ✅
- Android Chrome ✅
- Mobile Firefox ✅

**Note**: RTL layout automatically adjusts for mobile screens.

---

## 🌐 Browser Compatibility

| Browser | Arabic Font | RTL Layout | Font Features |
|---------|-------------|------------|---------------|
| Chrome  | ✅          | ✅         | ✅            |
| Firefox | ✅          | ✅         | ✅            |
| Safari  | ✅          | ✅         | ✅            |
| Edge    | ✅          | ✅         | ✅            |
| Opera   | ✅          | ✅         | ✅            |

---

## 🎯 Best Practices

### **1. Always Use Translation Keys**
```tsx
// ❌ Bad
<h1>Welcome</h1>

// ✅ Good
<h1>{t('hero.title')}</h1>
```

### **2. Handle RTL in Layouts**
```tsx
// ❌ Bad
<div className="flex">
  <div className="mr-4">Icon</div>
  <div>Text</div>
</div>

// ✅ Good
<div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
  <div className={isRTL ? 'ml-4' : 'mr-4'}>Icon</div>
  <div>Text</div>
</div>
```

### **3. Use Semantic HTML**
```tsx
// ✅ Good - Automatic RTL support
<p>{t('description')}</p>
<h1>{t('title')}</h1>
```

### **4. Test Both Languages**
Always test your UI in both English and Arabic:
- Check text overflow
- Verify icon positions
- Test form layouts
- Validate button alignment

---

## 📚 Resources

- [Cairo Font](https://fonts.google.com/specimen/Cairo)
- [Tajawal Font](https://fonts.google.com/specimen/Tajawal)
- [RTL Styling Guide](https://rtlstyling.com/)
- [Arabic Typography](https://www.arabictypography.com/)
- [Unicode Bidirectional Algorithm](https://unicode.org/reports/tr9/)

---

## 🔄 Future Improvements

- [ ] Add more translation keys
- [ ] Support for other Arabic dialects
- [ ] Voice AI in Arabic
- [ ] Arabic date/time formatting
- [ ] Arabic number formatting
- [ ] Keyboard shortcuts for language switching
- [ ] Auto-detect browser language

---

**Last Updated**: October 22, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
