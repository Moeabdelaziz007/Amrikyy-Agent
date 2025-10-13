# 🌍 Internationalization (i18n)

Multi-language documentation for Amrikyy AI Automation Platform.

## 📚 Available Languages

| Language | Status | Files | Maintainer |
|----------|--------|-------|------------|
| **English** | ✅ Complete | All docs | Core Team |
| **العربية (Arabic)** | 🚧 In Progress | README | Community |

---

## 🎯 Translation Priority

### Phase 1: Essential Docs (Current)
- [x] README.md → README.ar.md ✅
- [ ] QUICKSTART.md → QUICKSTART.ar.md
- [ ] API_REFERENCE.md → API_REFERENCE.ar.md (Summary)
- [ ] ENV_SETUP.md → ENV_SETUP.ar.md (Key sections)

### Phase 2: User Guides
- [ ] DEPLOYMENT.md → DEPLOYMENT.ar.md
- [ ] CONTRIBUTING.md → CONTRIBUTING.ar.md
- [ ] SECURITY.md → SECURITY.ar.md

### Phase 3: Technical Docs
- [ ] TESTING.md
- [ ] Backend README
- [ ] Frontend README

---

## 🤝 How to Contribute Translations

### For Arabic Speakers

نحن نرحب بمساهماتكم في ترجمة الوثائق!

**كيفية المساهمة**:

1. **اختر ملفًا للترجمة**
   - راجع قائمة الأولويات أعلاه
   - اختر ملفًا لم تتم ترجمته بعد

2. **أنشئ الترجمة**
   ```bash
   # مثال: ترجمة QUICKSTART.md
   cp QUICKSTART.md QUICKSTART.ar.md
   # قم بترجمة المحتوى إلى العربية
   ```

3. **اتبع إرشادات الترجمة**
   - حافظ على التنسيق الأصلي
   - ترجم المحتوى وليس أسماء الملفات/الأوامر
   - استخدم مصطلحات تقنية متسقة
   - اختبر جميع الروابط

4. **أرسل Pull Request**
   ```bash
   git add QUICKSTART.ar.md
   git commit -m "docs: Add Arabic translation of QUICKSTART"
   git push origin feature/arabic-quickstart
   ```

---

## 📖 Translation Guidelines

### What to Translate

✅ **DO Translate**:
- Headings and titles
- Descriptions and explanations
- Instructions and steps
- Comments in code examples
- Error messages
- User-facing text

❌ **DON'T Translate**:
- Code snippets (keep as-is)
- Command names (`npm`, `git`, etc.)
- File paths and URLs
- API endpoint names
- Environment variable names
- Technical terms (API, JSON, etc.)

### Example

**English**:
```markdown
## Quick Start

Install dependencies:
```bash
npm install
```

Then start the server:
```bash
npm run dev
```
```

**Arabic**:
```markdown
## البدء السريع

قم بتثبيت التبعيات:
```bash
npm install
```

ثم ابدأ الخادم:
```bash
npm run dev
```
```

---

## 🎨 Formatting Guidelines

### RTL (Right-to-Left) Support

Arabic text should flow right-to-left, but code blocks remain left-to-right:

```markdown
# العنوان الرئيسي

هذا نص عربي يتدفق من اليمين إلى اليسار.

```bash
# Code remains left-to-right
npm install
```

المزيد من النص العربي هنا.
```

### File Naming

- English: `FILENAME.md`
- Arabic: `FILENAME.ar.md`
- Other languages: `FILENAME.{lang}.md`

Examples:
- `README.md` → `README.ar.md`
- `QUICKSTART.md` → `QUICKSTART.ar.md`
- `API_REFERENCE.md` → `API_REFERENCE.ar.md`

---

## 🔗 Language Switcher

Add language switcher at the top of each document:

**English**:
```markdown
**English | [العربية](FILENAME.ar.md)**
```

**Arabic**:
```markdown
**[English](FILENAME.md) | العربية**
```

---

## 📊 Translation Status

### README.md
- ✅ Arabic (README.ar.md) - Complete
- 🎯 Target: French, Spanish, German

### QUICKSTART.md
- ⏳ Arabic (QUICKSTART.ar.md) - In Progress
- 🎯 Target: French, Spanish

### API_REFERENCE.md
- 📝 Arabic - Planned
- 🎯 Target: Summary only (full translation too large)

---

## 🌟 Translation Quality

### Requirements

- ✅ **Accuracy**: Correct translation of meaning
- ✅ **Consistency**: Use same terms throughout
- ✅ **Clarity**: Easy to understand
- ✅ **Completeness**: No missing sections
- ✅ **Formatting**: Proper markdown formatting

### Review Process

1. **Self-Review**: Translator reviews their work
2. **Peer Review**: Another native speaker reviews
3. **Technical Review**: Developer verifies technical accuracy
4. **Approval**: Maintainer approves and merges

---

## 🎯 Priority Languages

Based on user demographics:

1. **Arabic (العربية)** - Primary target (MENA region)
2. **French (Français)** - Secondary (North Africa, Europe)
3. **Spanish (Español)** - Tertiary (Global reach)
4. **German (Deutsch)** - Future (Europe)
5. **Chinese (中文)** - Future (Asia)

---

## 📞 Contact

### Translation Coordinators

- **Arabic**: community@amrikyy.ai
- **Other Languages**: i18n@amrikyy.ai

### Join Translation Team

Interested in helping translate? Email us at:
- **Email**: translate@amrikyy.ai
- **Subject**: "Translation Volunteer - [Language]"

---

## 🙏 Contributors

### Arabic Translation Team

- Mohamed H Abdelaziz (@Moeabdelaziz007) - Lead
- Community Contributors - Welcome!

### How to Get Listed

Contribute 3+ document translations to be listed as a contributor!

---

## 📚 Resources

### Translation Tools

- **DeepL**: https://www.deepl.com (High-quality translation)
- **Google Translate**: https://translate.google.com (Quick reference)
- **Grammarly**: https://www.grammarly.com (Grammar checking)

### Style Guides

- **Microsoft Terminology**: https://www.microsoft.com/en-us/language
- **Google Developer Style Guide**: https://developers.google.com/style
- **Arabic Technical Terms**: https://arabterm.org

---

## 📈 Progress Tracking

### Overall Progress

- **English**: 100% (10/10 docs)
- **Arabic**: 10% (1/10 docs)
- **Other Languages**: 0%

### Next Milestones

- [ ] Complete Arabic README ✅
- [ ] Complete Arabic QUICKSTART (Target: Jan 20)
- [ ] Complete Arabic API Summary (Target: Jan 25)
- [ ] Launch French translation (Target: Feb 1)

---

**Last Updated**: January 15, 2025  
**Maintained by**: Amrikyy Community Team
