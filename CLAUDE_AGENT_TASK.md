# 🤖 Claude Agent Task - Replace Apps with Mini Apps

## 📋 Task Description

Replace the current apps in the homepage (AppLauncher.jsx) with our Mini Apps:

### **Current Apps (Wrong):**
- Complete OS
- Mobile Demo
- Responsive Test
- OS Demo
- Travel Home
- Landing Page

### **Should Be (Mini Apps):**

#### **1. Luna 🗺️**
```javascript
{
  id: 'luna',
  name: 'Luna',
  nameAr: 'لونا',
  description: 'Trip Planner - AI-powered travel planning',
  descriptionAr: 'مخطط الرحلات - تخطيط السفر بالذكاء الاصطناعي',
  icon: Map,
  color: 'cyan',
  gradient: 'from-cyan-500 to-blue-600',
  path: '/apps/luna',
  available: true,
  features: ['Trip Planning', 'AI Suggestions', 'Itinerary Builder']
}
```

#### **2. Karim 💰**
```javascript
{
  id: 'karim',
  name: 'Karim',
  nameAr: 'كريم',
  description: 'Budget Optimizer - Smart cost analysis',
  descriptionAr: 'محسن الميزانية - تحليل التكاليف الذكي',
  icon: DollarSign,
  color: 'purple',
  gradient: 'from-purple-500 to-pink-600',
  path: '/apps/karim',
  available: true,
  features: ['Budget Planning', 'Cost Analysis', 'Savings Tips']
}
```

#### **3. Scout 🔍**
```javascript
{
  id: 'scout',
  name: 'Scout',
  nameAr: 'سكاوت',
  description: 'Deal Finder - Best prices & offers',
  descriptionAr: 'باحث العروض - أفضل الأسعار والعروض',
  icon: Search,
  color: 'green',
  gradient: 'from-green-500 to-emerald-600',
  path: '/apps/scout',
  available: true,
  features: ['Flight Deals', 'Hotel Offers', 'Price Tracking']
}
```

#### **4. Maya 💬**
```javascript
{
  id: 'maya',
  name: 'Maya',
  nameAr: 'مايا',
  description: 'Customer Support - 24/7 AI assistant',
  descriptionAr: 'دعم العملاء - مساعد ذكي على مدار الساعة',
  icon: MessageSquare,
  color: 'yellow',
  gradient: 'from-yellow-500 to-orange-600',
  path: '/apps/maya',
  available: true,
  features: ['AI Chat', '24/7 Support', 'Multi-language']
}
```

#### **5. Zara 📚**
```javascript
{
  id: 'zara',
  name: 'Zara',
  nameAr: 'زارا',
  description: 'Research Agent - Data analysis & insights',
  descriptionAr: 'باحثة متخصصة - تحليل البيانات والرؤى',
  icon: BookOpen,
  color: 'indigo',
  gradient: 'from-indigo-500 to-purple-600',
  path: '/apps/zara',
  available: false,
  features: ['Research', 'Data Analysis', 'Insights'],
  comingSoon: true
}
```

#### **6. Kody 💻**
```javascript
{
  id: 'kody',
  name: 'Kody',
  nameAr: 'كودي',
  description: 'Code Interpreter - Data processing',
  descriptionAr: 'مفسر الأكواد - معالجة البيانات',
  icon: Code,
  color: 'red',
  gradient: 'from-red-500 to-pink-600',
  path: '/apps/kody',
  available: false,
  features: ['Code Analysis', 'Data Processing', 'Automation'],
  comingSoon: true
}
```

---

## 🎯 Requirements

1. **Update AppLauncher.jsx**:
   - Replace demos array with miniApps array
   - Use the Mini Apps data above
   - Keep the same card design
   - Add "Coming Soon" badge for unavailable apps

2. **Icons to Import**:
```javascript
import { 
  Map,           // Luna
  DollarSign,    // Karim
  Search,        // Scout
  MessageSquare, // Maya
  BookOpen,      // Zara
  Code          // Kody
} from 'lucide-react';
```

3. **Card Features**:
   - Show app icon with gradient background
   - Display name (English + Arabic)
   - Show description
   - List 3 key features
   - Add "Coming Soon" badge if not available
   - Link to app path

4. **Design**:
   - Keep the same beautiful gradient cards
   - Use the gradient colors specified for each app
   - Add hover effects
   - Make cards clickable (Link to path)
   - Show "Coming Soon" overlay for unavailable apps

---

## 📝 Example Card Structure

```jsx
<Link to={app.path}>
  <div className="card with gradient">
    <div className="icon with app.gradient">
      <app.icon />
    </div>
    <h3>{app.name}</h3>
    <p className="arabic">{app.nameAr}</p>
    <p>{app.description}</p>
    <ul>
      {app.features.map(feature => (
        <li>{feature}</li>
      ))}
    </ul>
    {!app.available && (
      <div className="coming-soon-badge">Coming Soon</div>
    )}
  </div>
</Link>
```

---

## ✅ Expected Result

Homepage should show:
- 6 Mini App cards (Luna, Karim, Scout, Maya, Zara, Kody)
- Beautiful gradient designs
- Clear descriptions
- Feature lists
- "Coming Soon" badges for Zara and Kody
- Clickable cards that navigate to app pages

---

## 🎨 Keep

- Same page layout
- Same animations
- Same gradient background
- Same card hover effects
- Same responsive design

---

## 🔄 Change

- Replace demos array with miniApps array
- Update icons
- Update paths
- Add bilingual names
- Add "Coming Soon" badges

---

**This will make the homepage show our actual Mini Apps instead of demo pages!**
