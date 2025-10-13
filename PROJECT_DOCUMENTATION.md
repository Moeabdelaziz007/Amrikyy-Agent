# Maya Travel Agent - Project Documentation
# مايا مساعد السفر - وثائق المشروع

## 📋 Table of Contents / جدول المحتويات
- [Project Overview / نظرة عامة على المشروع](#project-overview)
- [Features / الميزات](#features)
- [Technology Stack / التقنيات المستخدمة](#technology-stack)
- [Installation / التثبيت](#installation)
- [Usage / الاستخدام](#usage)
- [API Documentation / وثائق API](#api-documentation)
- [Deployment / النشر](#deployment)
- [Contributing / المساهمة](#contributing)

---

## 🎯 Project Overview / نظرة عامة على المشروع

### English
**Maya Travel Agent** is an intelligent travel planning system powered by advanced AI technology. It provides personalized travel recommendations, budget analysis, destination insights, and comprehensive travel planning services.

**Key Features:**
- AI-powered travel recommendations
- Real-time budget analysis
- Destination insights and cultural information
- Payment and booking assistance
- Multi-language support (Arabic/English)
- Telegram bot integration
- Web application interface

### العربية
**مايا مساعد السفر** هو نظام ذكي لتخطيط السفر مدعوم بتقنيات الذكاء الاصطناعي المتقدمة. يوفر توصيات سفر شخصية وتحليل الميزانية ورؤى الوجهات وخدمات تخطيط السفر الشاملة.

**الميزات الرئيسية:**
- توصيات سفر مدعومة بالذكاء الاصطناعي
- تحليل الميزانية في الوقت الفعلي
- رؤى الوجهات والمعلومات الثقافية
- مساعدة الدفع والحجز
- دعم متعدد اللغات (عربي/إنجليزي)
- تكامل بوت تليجرام
- واجهة تطبيق ويب

---

## ✨ Features / الميزات

### English

#### 🤖 AI-Powered Features
- **Smart Travel Planning**: AI analyzes preferences and suggests optimal itineraries
- **Budget Analysis**: Real-time cost estimation and budget optimization
- **Destination Insights**: Cultural information, weather, and local tips
- **Payment Recommendations**: Best payment methods and currency exchange tips
- **Real-time Alerts**: Travel warnings and updates

#### 🌐 Multi-Platform Support
- **Web Application**: Full-featured web interface
- **Telegram Bot**: Conversational AI assistant
- **WhatsApp Integration**: Business API support
- **Mobile Responsive**: Works on all devices

#### 🔒 Security & Privacy
- **Data Encryption**: All user data is encrypted
- **Secure Payments**: Stripe and PayPal integration
- **Privacy Protection**: GDPR compliant
- **Rate Limiting**: API protection

### العربية

#### 🤖 الميزات المدعومة بالذكاء الاصطناعي
- **تخطيط السفر الذكي**: يحلل الذكاء الاصطناعي التفضيلات ويقترح خطط سفر مثالية
- **تحليل الميزانية**: تقدير التكلفة في الوقت الفعلي وتحسين الميزانية
- **رؤى الوجهات**: معلومات ثقافية وطقس ونصائح محلية
- **توصيات الدفع**: أفضل طرق الدفع ونصائح صرف العملات
- **تنبيهات فورية**: تحذيرات السفر والتحديثات

#### 🌐 دعم متعدد المنصات
- **تطبيق ويب**: واجهة ويب كاملة الميزات
- **بوت تليجرام**: مساعد ذكي محادثة
- **تكامل واتساب**: دعم واجهة برمجة التطبيقات التجارية
- **متجاوب للهواتف**: يعمل على جميع الأجهزة

#### 🔒 الأمان والخصوصية
- **تشفير البيانات**: جميع بيانات المستخدم مشفرة
- **مدفوعات آمنة**: تكامل Stripe وPayPal
- **حماية الخصوصية**: متوافق مع GDPR
- **حدود المعدل**: حماية API

---

## 🛠️ Technology Stack / التقنيات المستخدمة

### English

#### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for forms

#### Backend
- **Node.js** with Express.js
- **Kelo AI** for artificial intelligence
- **PostgreSQL** with Supabase
- **Redis** for caching
- **JWT** for authentication
- **Stripe/PayPal** for payments

#### DevOps
- **Docker** for containerization
- **PM2** for process management
- **GitHub Actions** for CI/CD
- **Nginx** for reverse proxy

### العربية

#### الواجهة الأمامية
- **React 18** مع TypeScript
- **Vite** لأدوات البناء
- **Tailwind CSS** للتصميم
- **React Router** للتنقل
- **Axios** لاستدعاءات API
- **React Hook Form** للنماذج

#### الخادم الخلفي
- **Node.js** مع Express.js
- **Kelo AI** للذكاء الاصطناعي
- **PostgreSQL** مع Supabase
- **Redis** للتخزين المؤقت
- **JWT** للمصادقة
- **Stripe/PayPal** للمدفوعات

#### DevOps
- **Docker** للحاويات
- **PM2** لإدارة العمليات
- **GitHub Actions** للـ CI/CD
- **Nginx** للبروكسي العكسي

---

## 🚀 Installation / التثبيت

### English

#### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- Redis 6+
- Git

#### Quick Start
```bash
# Clone the repository
git clone https://github.com/your-org/maya-travel-agent.git
cd maya-travel-agent

# Install dependencies
npm install

# Set up environment variables
cp backend/.env.template backend/.env
# Edit backend/.env with your configuration

# Start the development server
npm run dev
```

#### Detailed Setup
1. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb maya_travel_agent
   
   # Run migrations
   cd backend
   npm run migrate
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp backend/.env.template backend/.env
   
   # Edit with your values
   nano backend/.env
   ```

3. **Start Services**
   ```bash
   # Start backend
   cd backend
   npm start
   
   # Start frontend (in new terminal)
   cd frontend
   npm start
   ```

### العربية

#### المتطلبات
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Git

#### البدء السريع
```bash
# استنساخ المستودع
git clone https://github.com/your-org/maya-travel-agent.git
cd maya-travel-agent

# تثبيت التبعيات
npm install

# إعداد متغيرات البيئة
cp backend/.env.template backend/.env
# تحرير backend/.env بإعداداتك

# بدء خادم التطوير
npm run dev
```

#### الإعداد المفصل
1. **إعداد قاعدة البيانات**
   ```bash
   # إنشاء قاعدة بيانات PostgreSQL
   createdb maya_travel_agent
   
   # تشغيل الهجرات
   cd backend
   npm run migrate
   ```

2. **تكوين البيئة**
   ```bash
   # نسخ قالب البيئة
   cp backend/.env.template backend/.env
   
   # التحرير بقيمك
   nano backend/.env
   ```

3. **بدء الخدمات**
   ```bash
   # بدء الخادم الخلفي
   cd backend
   npm start
   
   # بدء الواجهة الأمامية (في terminal جديد)
   cd frontend
   npm start
   ```

---

## 📖 Usage / الاستخدام

### English

#### Web Application
1. Open your browser and navigate to `http://localhost:3000`
2. Create an account or sign in
3. Start planning your trip using the AI assistant
4. Get personalized recommendations and budget analysis

#### Telegram Bot
1. Search for `@MayaTravelBot` on Telegram
2. Start a conversation with `/start`
3. Use commands like `/travel`, `/budget`, `/destination`
4. Chat naturally with the AI assistant

#### API Usage
```javascript
// Example API call
const response = await fetch('/api/travel/recommendations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    destination: 'Paris',
    budget: 2000,
    duration: 5
  })
});
```

### العربية

#### تطبيق الويب
1. افتح متصفحك وانتقل إلى `http://localhost:3000`
2. أنشئ حساباً أو سجل دخولك
3. ابدأ تخطيط رحلتك باستخدام المساعد الذكي
4. احصل على توصيات شخصية وتحليل الميزانية

#### بوت تليجرام
1. ابحث عن `@MayaTravelBot` على تليجرام
2. ابدأ محادثة بـ `/start`
3. استخدم الأوامر مثل `/travel`، `/budget`، `/destination`
4. تحدث طبيعياً مع المساعد الذكي

#### استخدام API
```javascript
// مثال على استدعاء API
const response = await fetch('/api/travel/recommendations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    destination: 'باريس',
    budget: 2000,
    duration: 5
  })
});
```

---

## 📚 API Documentation / وثائق API

### English

#### Base URL
```
Production: https://api.maya-travel.com
Development: http://localhost:5000
```

#### Authentication
All API requests require authentication via JWT token:
```bash
Authorization: Bearer <your-jwt-token>
```

#### Endpoints

##### Travel Recommendations
```http
POST /api/travel/recommendations
Content-Type: application/json

{
  "destination": "string",
  "budget": "number",
  "duration": "number",
  "preferences": ["string"]
}
```

##### Budget Analysis
```http
POST /api/travel/budget
Content-Type: application/json

{
  "destination": "string",
  "budget": "number",
  "duration": "number",
  "travelers": "number"
}
```

##### Destination Insights
```http
GET /api/travel/destinations/{destination}
Authorization: Bearer <token>
```

### العربية

#### الرابط الأساسي
```
الإنتاج: https://api.maya-travel.com
التطوير: http://localhost:5000
```

#### المصادقة
جميع طلبات API تتطلب مصادقة عبر رمز JWT:
```bash
Authorization: Bearer <your-jwt-token>
```

#### النقاط الطرفية

##### توصيات السفر
```http
POST /api/travel/recommendations
Content-Type: application/json

{
  "destination": "string",
  "budget": "number",
  "duration": "number",
  "preferences": ["string"]
}
```

##### تحليل الميزانية
```http
POST /api/travel/budget
Content-Type: application/json

{
  "destination": "string",
  "budget": "number",
  "duration": "number",
  "travelers": "number"
}
```

##### رؤى الوجهات
```http
GET /api/travel/destinations/{destination}
Authorization: Bearer <token>
```

---

## 🚀 Deployment / النشر

### English

#### Production Deployment
1. **Server Setup**
   ```bash
   # Install Node.js and PM2
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install -g pm2
   ```

2. **Application Deployment**
   ```bash
   # Clone and setup
   git clone https://github.com/your-org/maya-travel-agent.git
   cd maya-travel-agent
   npm install
   
   # Build for production
   npm run build
   
   # Start with PM2
   pm2 start ecosystem.config.js
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### العربية

#### نشر الإنتاج
1. **إعداد الخادم**
   ```bash
   # تثبيت Node.js و PM2
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install -g pm2
   ```

2. **نشر التطبيق**
   ```bash
   # استنساخ وإعداد
   git clone https://github.com/your-org/maya-travel-agent.git
   cd maya-travel-agent
   npm install
   
   # بناء للإنتاج
   npm run build
   
   # بدء بـ PM2
   pm2 start ecosystem.config.js
   ```

3. **تكوين Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🤝 Contributing / المساهمة

### English

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Write tests for your changes**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### العربية

نرحب بالمساهمات! يرجى اتباع هذه الخطوات:

1. **تفرع المستودع**
2. **إنشاء فرع ميزة**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **قم بتغييراتك**
4. **اكتب اختبارات لتغييراتك**
5. **احفظ تغييراتك**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **ادفع إلى الفرع**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **افتح طلب سحب**

---

## 📞 Support / الدعم

### English
- **Email**: support@maya-travel.com
- **Documentation**: https://docs.maya-travel.com
- **Issues**: https://github.com/your-org/maya-travel-agent/issues

### العربية
- **البريد الإلكتروني**: support@maya-travel.com
- **الوثائق**: https://docs.maya-travel.com
- **المشاكل**: https://github.com/your-org/maya-travel-agent/issues

---

## 📄 License / الترخيص

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

**Made with ❤️ by the Maya Travel Agent Team**

**صُنع بـ ❤️ من فريق مايا مساعد السفر**
