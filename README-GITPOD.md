# Gitpod Workspace - Amrikyy Agent

## 🚀 Quick Start

### فتح المشروع في Gitpod:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Moeabdelaziz007/Amrikyy-Agent)

أو افتح الرابط مباشرة:
```
https://gitpod.io/#https://github.com/Moeabdelaziz007/Amrikyy-Agent
```

---

## 📋 ماذا يحدث عند فتح Workspace؟

### 1. **التثبيت التلقائي (Initialization)**
- تثبيت Node.js 20 (LTS)
- تثبيت dependencies للـ Backend و Frontend
- تثبيت أدوات البحث والفهرسة (ripgrep, ctags, jq)
- تشغيل Redis server

### 2. **فهرسة الكود (Code Indexing)**
يتم تشغيل سكريبت الفهرسة تلقائياً:
```bash
.gitpod/scripts/index-codebase.sh
```

**النتائج:**
- `.gitpod/.index/index.json` - فهرس JSON كامل للملفات
- `.gitpod/.index/tags` - ملف ctags للتنقل السريع
- `.gitpod/.index/file-list.txt` - قائمة بجميع الملفات
- `.gitpod/.index/metadata.json` - معلومات إحصائية

### 3. **تشغيل الخوادم (Dev Servers)**
- **Backend**: `http://localhost:5000` (Express API)
- **Frontend**: `http://localhost:5173` (Vite)
- **Redis**: `localhost:6379` (Cache)

---

## 🛠️ الأدوات المتوفرة

### Code Navigation
```bash
# البحث في الكود
rg "pattern" --type js

# البحث في الفهرس
jq '.[] | select(.path | contains("stream"))' .gitpod/.index/index.json

# استخدام ctags
ctags -x --c-kinds=f streamService
```

### Development Commands
```bash
# Backend
cd backend
npm run dev          # Start dev server
npm test             # Run tests
npm run typecheck    # TypeScript check

# Frontend
cd frontend
npm run dev          # Start Vite
npm run build        # Build for production
npm run preview      # Preview build

# Indexing
.gitpod/scripts/index-codebase.sh              # Bash version
node .gitpod/scripts/build-simple-index.js     # Node.js version
```

---

## 🔧 التخصيص (Customization)

### تغيير المنافذ (Ports)
عدّل `.gitpod.yml`:
```yaml
ports:
  - port: 5000
    name: Backend API
    onOpen: notify
```

### إضافة Extensions
عدّل `.gitpod.yml`:
```yaml
vscode:
  extensions:
    - your.extension.id
```

### تعديل سكريبت الفهرسة
عدّل `.gitpod/scripts/index-codebase.sh`:
```bash
# أضف امتدادات جديدة
EXTS="js,ts,json,py,go,java,jsx,tsx,md,html,css,yml,yaml,sh,php,rb"

# أضف مجلدات للتجاهل
--glob '!your-folder'
```

---

## 📊 الإحصائيات

### عرض معلومات الفهرس:
```bash
cat .gitpod/.index/metadata.json | jq
```

**مثال على النتيجة:**
```json
{
  "timestamp": "2025-10-23T07:00:00Z",
  "fileCount": 450,
  "indexPath": ".gitpod/.index/index.json",
  "tagsPath": ".gitpod/.index/tags",
  "project": "Amrikyy-Agent",
  "version": "2.0.0"
}
```

### عرض إحصائيات الملفات:
```bash
# عدد الملفات حسب النوع
jq '[.[] | .extension] | group_by(.) | map({ext: .[0], count: length})' .gitpod/.index/index.json

# أكبر الملفات
jq 'sort_by(.size) | reverse | .[0:10] | .[] | {path, size}' .gitpod/.index/index.json
```

---

## 🔍 حالات الاستخدام المتقدمة

### 1. البحث الدلالي (Semantic Search)
```bash
# البحث عن ملفات تحتوي على "streaming"
jq '.[] | select(.content | contains("streaming")) | .path' .gitpod/.index/index.json
```

### 2. تحليل التبعيات
```bash
# البحث عن جميع imports
rg "^import.*from" --type ts --type js
```

### 3. إنشاء Documentation
```bash
# استخراج جميع JSDoc comments
rg "\/\*\*" -A 10 --type js
```

---

## 🚨 استكشاف الأخطاء (Troubleshooting)

### المشكلة: Redis لا يعمل
```bash
# تشغيل Redis يدوياً
sudo service redis-server start

# التحقق من الحالة
redis-cli ping
```

### المشكلة: الفهرسة فشلت
```bash
# إعادة تشغيل الفهرسة
.gitpod/scripts/index-codebase.sh

# أو استخدام النسخة Node.js
node .gitpod/scripts/build-simple-index.js
```

### المشكلة: Port مشغول
```bash
# إيقاف العملية على Port معين
lsof -ti:5000 | xargs kill -9
```

---

## 🔐 المتغيرات البيئية (Environment Variables)

### إضافة Secrets في Gitpod:
1. اذهب إلى: https://gitpod.io/user/variables
2. أضف المتغيرات:
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `JWT_SECRET`
   - `REDIS_URL` (optional)

### أو استخدم `.env` محلياً:
```bash
cp backend/.env.example backend/.env
# عدّل القيم
```

---

## 📚 الموارد الإضافية

### Documentation
- [Gitpod Docs](https://www.gitpod.io/docs)
- [Amrikyy Project Docs](./docs/)
- [API Documentation](./API_DOCUMENTATION.md)

### Scripts
- `backend/test-endpoints.sh` - اختبار API endpoints
- `.gitpod/scripts/index-codebase.sh` - فهرسة الكود
- `.gitpod/scripts/build-simple-index.js` - فهرسة Node.js

---

## 🎯 الميزات المستقبلية

### قيد التطوير:
- [ ] Vector embeddings للبحث الدلالي
- [ ] Integration مع Sourcegraph LSIF
- [ ] Automatic documentation generation
- [ ] Code quality metrics dashboard
- [ ] AI-powered code suggestions

### اقتراحات؟
افتح Issue على GitHub أو تواصل مع الفريق!

---

## 👥 المساهمة

### للمساهمة في تحسين Gitpod setup:
1. Fork المشروع
2. أنشئ branch جديد: `git checkout -b feature/gitpod-improvement`
3. عدّل الملفات في `.gitpod/`
4. اختبر في Gitpod workspace
5. أرسل Pull Request

---

## 📞 الدعم

### للمساعدة:
- **GitHub Issues**: [Amrikyy-Agent/issues](https://github.com/Moeabdelaziz007/Amrikyy-Agent/issues)
- **Email**: support@amrikyy.com
- **Discord**: [Join our server](#)

---

**آخر تحديث:** 23 أكتوبر 2025  
**الإصدار:** 2.0.0  
**الحالة:** ✅ Production Ready

---

## 🌟 نصائح سريعة

### للمطورين الجدد:
1. ✅ افتح المشروع في Gitpod
2. ✅ انتظر اكتمال التثبيت (2-3 دقائق)
3. ✅ افتح Backend على port 5000
4. ✅ افتح Frontend على port 5173
5. ✅ ابدأ التطوير!

### للمطورين المتقدمين:
- استخدم `.gitpod/.index/` للبحث السريع
- استخدم ctags للتنقل بين الدوال
- استخدم ripgrep للبحث في الكود
- استخدم jq لتحليل الفهرس

---

**Happy Coding! 🚀**
