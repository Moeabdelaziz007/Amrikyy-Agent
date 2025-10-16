# 🤖 دليل بناء وكلاء السفر الذكيين (Agent Playbook)

## 📋 نظرة عامة

هذا الدليل يوضح كيفية بناء 5 وكلاء ذكيين متخصصين في خدمات السفر والسياحة باستخدام الأدوات المجانية المتاحة.

---

## 🎯 الوكلاء الخمسة

### 1. 🛫 Booking Agent (وكيل الحجز)
**الوظيفة:** البحث عن رحلات طيران وفنادق وحجزها

### 2. 💰 Pricing Agent (وكيل التسعير)
**الوظيفة:** تحليل الأسعار وإيجاد أفضل العروض

### 3. 📝 Content Agent (وكيل المحتوى)
**الوظيفة:** إنشاء محتوى سياحي ونصائح السفر

### 4. ⚙️ Operations Agent (وكيل العمليات)
**الوظيفة:** إدارة العمليات والتنسيق

### 5. 🎧 Support Agent (وكيل الدعم)
**الوظيفة:** خدمة العملاء والدعم الفني

---

## 🛫 Agent 1: Booking Agent (وكيل الحجز)

### الميزات الأساسية
- البحث عن رحلات طيران
- البحث عن فنادق
- مقارنة الأسعار
- حجز الخدمات

### الأدوات المستخدمة
- **Amadeus API** - رحلات طيران وفنادق
- **Booking.com Affiliate** - فنادق إضافية
- **Supabase** - حفظ الحجوزات

### الكود الأساسي

```python
# booking_agent.py
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI
from amadeus import Client
import os

class BookingAgent:
    def __init__(self):
        self.amadeus = Client(
            client_id=os.getenv('AMADEUS_API_KEY'),
            client_secret=os.getenv('AMADEUS_API_SECRET')
        )
        
        self.tools = [
            Tool(
                name="search_flights",
                func=self.search_flights,
                description="البحث عن رحلات طيران بين مدينتين"
            ),
            Tool(
                name="search_hotels", 
                func=self.search_hotels,
                description="البحث عن فنادق في مدينة معينة"
            ),
            Tool(
                name="save_booking",
                func=self.save_booking,
                description="حفظ الحجز في قاعدة البيانات"
            )
        ]
        
        self.agent = initialize_agent(
            self.tools,
            OpenAI(temperature=0),
            agent="zero-shot-react-description",
            verbose=True
        )
    
    def search_flights(self, query):
        """البحث عن رحلات طيران"""
        # Parse query: "رحلات من القاهرة إلى دبي في 25 ديسمبر"
        # Extract: origin, destination, date
        
        response = self.amadeus.shopping.flight_offers_search.get(
            originLocationCode="CAI",
            destinationLocationCode="DXB", 
            departureDate="2024-12-25",
            adults=1
        )
        
        flights = []
        for offer in response.data[:3]:
            flights.append({
                "price": offer['price']['total'],
                "currency": offer['price']['currency'],
                "departure": offer['itineraries'][0]['segments'][0]['departure']['iataCode'],
                "arrival": offer['itineraries'][0]['segments'][-1]['arrival']['iataCode'],
                "duration": offer['itineraries'][0]['duration']
            })
        
        return f"تم العثور على {len(flights)} رحلة:\n" + "\n".join([
            f"✈️ {f['departure']} → {f['arrival']}: {f['price']} {f['currency']}"
            for f in flights
        ])
    
    def search_hotels(self, query):
        """البحث عن فنادق"""
        response = self.amadeus.shopping.hotel_offers.get(
            cityCode="DXB",
            checkInDate="2024-12-25",
            checkOutDate="2024-12-27",
            adults=2
        )
        
        hotels = []
        for hotel in response.data[:3]:
            hotels.append({
                "name": hotel['hotel']['name'],
                "price": hotel['offers'][0]['price']['total'],
                "rating": hotel['hotel']['rating']
            })
        
        return f"تم العثور على {len(hotels)} فندق:\n" + "\n".join([
            f"🏨 {h['name']}: {h['price']} (⭐{h['rating']})"
            for h in hotels
        ])
    
    def save_booking(self, booking_data):
        """حفظ الحجز"""
        # Save to Supabase
        return "تم حفظ الحجز بنجاح"
    
    def process_request(self, user_request):
        """معالجة طلب المستخدم"""
        return self.agent.run(user_request)

# الاستخدام
booking_agent = BookingAgent()
result = booking_agent.process_request("أريد البحث عن رحلات من القاهرة إلى دبي في 25 ديسمبر")
print(result)
```

---

## 💰 Agent 2: Pricing Agent (وكيل التسعير)

### الميزات الأساسية
- تحليل اتجاهات الأسعار
- مقارنة العروض
- التنبؤ بأفضل أوقات الحجز
- مراقبة انخفاض الأسعار

### الأدوات المستخدمة
- **SerpAPI** - مراقبة أسعار Google Flights
- **Amadeus API** - بيانات الأسعار التاريخية
- **Supabase** - تخزين بيانات الأسعار

### الكود الأساسي

```python
# pricing_agent.py
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI
import requests
import json
from datetime import datetime, timedelta

class PricingAgent:
    def __init__(self):
        self.serpapi_key = os.getenv('SERPAPI_KEY')
        
        self.tools = [
            Tool(
                name="monitor_prices",
                func=self.monitor_prices,
                description="مراقبة أسعار رحلة معينة"
            ),
            Tool(
                name="compare_prices",
                func=self.compare_prices,
                description="مقارنة أسعار من مصادر مختلفة"
            ),
            Tool(
                name="price_alert",
                func=self.set_price_alert,
                description="إعداد تنبيه لانخفاض السعر"
            )
        ]
        
        self.agent = initialize_agent(
            self.tools,
            OpenAI(temperature=0),
            agent="zero-shot-react-description",
            verbose=True
        )
    
    def monitor_prices(self, route_info):
        """مراقبة الأسعار"""
        # استخدام SerpAPI لمراقبة Google Flights
        params = {
            'api_key': self.serpapi_key,
            'engine': 'google_flights',
            'departure_id': route_info['origin'],
            'arrival_id': route_info['destination'],
            'outbound_date': route_info['date'],
            'currency': 'USD'
        }
        
        response = requests.get('https://serpapi.com/search', params=params)
        data = response.json()
        
        prices = []
        if 'flights' in data:
            for flight in data['flights'][:5]:
                prices.append({
                    'airline': flight.get('airline', 'غير محدد'),
                    'price': flight.get('price', 'غير محدد'),
                    'departure_time': flight.get('departure_time', 'غير محدد'),
                    'duration': flight.get('duration', 'غير محدد')
                })
        
        return f"أسعار الرحلة:\n" + "\n".join([
            f"✈️ {p['airline']}: {p['price']} - {p['departure_time']}"
            for p in prices
        ])
    
    def compare_prices(self, search_params):
        """مقارنة الأسعار من مصادر مختلفة"""
        # مقارنة بين Amadeus و SerpAPI
        amadeus_prices = self.get_amadeus_prices(search_params)
        google_prices = self.monitor_prices(search_params)
        
        return f"مقارنة الأسعار:\nAmadeus: {amadeus_prices}\nGoogle Flights: {google_prices}"
    
    def set_price_alert(self, alert_params):
        """إعداد تنبيه السعر"""
        # حفظ التنبيه في قاعدة البيانات
        alert_data = {
            'user_id': alert_params['user_id'],
            'route': alert_params['route'],
            'target_price': alert_params['target_price'],
            'created_at': datetime.now().isoformat()
        }
        
        # Save to Supabase
        return f"تم إعداد تنبيه السعر: {alert_params['target_price']}"
    
    def process_request(self, user_request):
        return self.agent.run(user_request)

# الاستخدام
pricing_agent = PricingAgent()
result = pricing_agent.process_request("راقب أسعار رحلات القاهرة إلى دبي وأبلغني عند انخفاضها عن 500 دولار")
print(result)
```

---

## 📝 Agent 3: Content Agent (وكيل المحتوى)

### الميزات الأساسية
- إنشاء محتوى سياحي
- نصائح السفر
- مراجعات الوجهات
- تخطيط البرامج السياحية

### الأدوات المستخدمة
- **OpenAI GPT-4** - إنشاء المحتوى
- **Mapbox API** - خرائط تفاعلية
- **Unsplash API** - صور سياحية

### الكود الأساسي

```python
# content_agent.py
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI
import requests
import json

class ContentAgent:
    def __init__(self):
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.mapbox_key = os.getenv('MAPBOX_TOKEN')
        self.unsplash_key = os.getenv('UNSPLASH_ACCESS_KEY')
        
        self.tools = [
            Tool(
                name="generate_travel_guide",
                func=self.generate_travel_guide,
                description="إنشاء دليل سفر لوجهة معينة"
            ),
            Tool(
                name="create_itinerary",
                func=self.create_itinerary,
                description="إنشاء برنامج سياحي"
            ),
            Tool(
                name="get_travel_tips",
                func=self.get_travel_tips,
                description="نصائح السفر لوجهة معينة"
            ),
            Tool(
                name="get_destination_images",
                func=self.get_destination_images,
                description="جلب صور للوجهة"
            )
        ]
        
        self.agent = initialize_agent(
            self.tools,
            OpenAI(temperature=0.7),
            agent="zero-shot-react-description",
            verbose=True
        )
    
    def generate_travel_guide(self, destination):
        """إنشاء دليل سفر"""
        prompt = f"""
        أنشئ دليل سفر شامل لـ {destination} يتضمن:
        1. أفضل الأماكن للزيارة
        2. أفضل المطاعم
        3. أفضل الفنادق
        4. النقل المحلي
        5. النصائح الثقافية
        6. الميزانية المقترحة
        
        اكتب باللغة العربية بطريقة جذابة ومفيدة.
        """
        
        # استخدام OpenAI لإنشاء المحتوى
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={'Authorization': f'Bearer {self.openai_key}'},
            json={
                'model': 'gpt-4',
                'messages': [{'role': 'user', 'content': prompt}],
                'max_tokens': 1000
            }
        )
        
        content = response.json()['choices'][0]['message']['content']
        return content
    
    def create_itinerary(self, params):
        """إنشاء برنامج سياحي"""
        destination = params['destination']
        days = params['days']
        interests = params.get('interests', [])
        
        prompt = f"""
        أنشئ برنامج سياحي لـ {destination} لمدة {days} أيام.
        اهتمامات المسافر: {', '.join(interests)}
        
        يتضمن البرنامج:
        - تفاصيل كل يوم
        - الأماكن الموصى بزيارتها
        - أوقات الزيارة المقترحة
        - تكلفة تقريبية لكل نشاط
        
        اكتب باللغة العربية.
        """
        
        # استخدام OpenAI
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={'Authorization': f'Bearer {self.openai_key}'},
            json={
                'model': 'gpt-4',
                'messages': [{'role': 'user', 'content': prompt}],
                'max_tokens': 1500
            }
        )
        
        itinerary = response.json()['choices'][0]['message']['content']
        return itinerary
    
    def get_travel_tips(self, destination):
        """نصائح السفر"""
        tips = [
            "احمل جواز السفر والوثائق المهمة",
            "تأكد من التأمين الصحي للسفر",
            "احفظ أرقام الطوارئ المحلية",
            "تعلم بعض الكلمات الأساسية باللغة المحلية",
            "احترم العادات والتقاليد المحلية"
        ]
        
        return f"نصائح السفر إلى {destination}:\n" + "\n".join([f"💡 {tip}" for tip in tips])
    
    def get_destination_images(self, destination):
        """جلب صور الوجهة"""
        response = requests.get(
            f'https://api.unsplash.com/search/photos',
            headers={'Authorization': f'Client-ID {self.unsplash_key}'},
            params={'query': destination, 'per_page': 5}
        )
        
        images = response.json()['results']
        image_urls = [img['urls']['regular'] for img in images]
        
        return f"صور {destination}:\n" + "\n".join([f"🖼️ {url}" for url in image_urls])
    
    def process_request(self, user_request):
        return self.agent.run(user_request)

# الاستخدام
content_agent = ContentAgent()
result = content_agent.process_request("أنشئ دليل سفر شامل لدبي")
print(result)
```

---

## ⚙️ Agent 4: Operations Agent (وكيل العمليات)

### الميزات الأساسية
- إدارة الحجوزات
- تنسيق المواعيد
- إدارة المهام
- مراقبة العمليات

### الأدوات المستخدمة
- **Supabase** - قاعدة البيانات
- **Cron Jobs** - المهام المجدولة
- **Email APIs** - إرسال الإشعارات

### الكود الأساسي

```python
# operations_agent.py
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI
from supabase import create_client, Client
import schedule
import time
from datetime import datetime

class OperationsAgent:
    def __init__(self):
        self.supabase: Client = create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_ANON_KEY')
        )
        
        self.tools = [
            Tool(
                name="manage_bookings",
                func=self.manage_bookings,
                description="إدارة الحجوزات"
            ),
            Tool(
                name="schedule_task",
                func=self.schedule_task,
                description="جدولة مهمة"
            ),
            Tool(
                name="send_notification",
                func=self.send_notification,
                description="إرسال إشعار"
            ),
            Tool(
                name="check_system_health",
                func=self.check_system_health,
                description="فحص صحة النظام"
            )
        ]
        
        self.agent = initialize_agent(
            self.tools,
            OpenAI(temperature=0),
            agent="zero-shot-react-description",
            verbose=True
        )
    
    def manage_bookings(self, action):
        """إدارة الحجوزات"""
        if action['type'] == 'cancel':
            # إلغاء الحجز
            result = self.supabase.table('bookings').update({
                'status': 'cancelled',
                'cancelled_at': datetime.now().isoformat()
            }).eq('id', action['booking_id']).execute()
            
            return f"تم إلغاء الحجز رقم {action['booking_id']}"
        
        elif action['type'] == 'modify':
            # تعديل الحجز
            result = self.supabase.table('bookings').update({
                'modified_at': datetime.now().isoformat(),
                'status': 'modified'
            }).eq('id', action['booking_id']).execute()
            
            return f"تم تعديل الحجز رقم {action['booking_id']}"
    
    def schedule_task(self, task_info):
        """جدولة مهمة"""
        # حفظ المهمة في قاعدة البيانات
        task_data = {
            'name': task_info['name'],
            'description': task_info['description'],
            'scheduled_for': task_info['scheduled_for'],
            'status': 'pending',
            'created_at': datetime.now().isoformat()
        }
        
        result = self.supabase.table('scheduled_tasks').insert(task_data).execute()
        return f"تم جدولة المهمة: {task_info['name']}"
    
    def send_notification(self, notification):
        """إرسال إشعار"""
        # حفظ الإشعار
        notification_data = {
            'user_id': notification['user_id'],
            'title': notification['title'],
            'message': notification['message'],
            'type': notification['type'],
            'sent_at': datetime.now().isoformat()
        }
        
        result = self.supabase.table('notifications').insert(notification_data).execute()
        return f"تم إرسال الإشعار: {notification['title']}"
    
    def check_system_health(self, component=None):
        """فحص صحة النظام"""
        health_status = {
            'database': 'healthy',
            'api_connections': 'healthy',
            'background_jobs': 'healthy',
            'external_apis': 'healthy'
        }
        
        if component:
            return f"حالة {component}: {health_status.get(component, 'unknown')}"
        
        return "حالة النظام:\n" + "\n".join([
            f"✅ {k}: {v}" for k, v in health_status.items()
        ])
    
    def process_request(self, user_request):
        return self.agent.run(user_request)

# الاستخدام
operations_agent = OperationsAgent()
result = operations_agent.process_request("تحقق من حالة النظام")
print(result)
```

---

## 🎧 Agent 5: Support Agent (وكيل الدعم)

### الميزات الأساسية
- خدمة العملاء
- حل المشاكل
- الإجابة على الأسئلة
- التوجيه والدعم

### الأدوات المستخدمة
- **OpenAI GPT-4** - الإجابات الذكية
- **Supabase** - قاعدة المعرفة
- **Telegram Bot API** - التواصل

### الكود الأساسي

```python
# support_agent.py
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
import json

class SupportAgent:
    def __init__(self):
        self.tools = [
            Tool(
                name="search_knowledge_base",
                func=self.search_knowledge_base,
                description="البحث في قاعدة المعرفة"
            ),
            Tool(
                name="escalate_ticket",
                func=self.escalate_ticket,
                description="تصعيد التذكرة للإنسان"
            ),
            Tool(
                name="provide_solution",
                func=self.provide_solution,
                description="تقديم حل للمشكلة"
            ),
            Tool(
                name="collect_feedback",
                func=self.collect_feedback,
                description="جمع تعليقات المستخدم"
            )
        ]
        
        self.agent = initialize_agent(
            self.tools,
            OpenAI(temperature=0.3),
            agent="zero-shot-react-description",
            verbose=True
        )
        
        # قاعدة المعرفة الأساسية
        self.knowledge_base = {
            "booking": "لمساعدتك في الحجز، أحتاج إلى: تاريخ السفر، الوجهة، عدد المسافرين",
            "cancellation": "يمكنك إلغاء الحجز خلال 24 ساعة من الحجز دون رسوم",
            "payment": "نقبل جميع البطاقات الائتمانية الرئيسية وPayPal",
            "refund": "سيتم استرداد المبلغ خلال 5-7 أيام عمل",
            "support": "يمكنك التواصل معنا على مدار الساعة عبر الدردشة المباشرة"
        }
    
    def search_knowledge_base(self, query):
        """البحث في قاعدة المعرفة"""
        query_lower = query.lower()
        
        for key, answer in self.knowledge_base.items():
            if key in query_lower or any(word in query_lower for word in key.split()):
                return answer
        
        return "أعتذر، لم أجد إجابة في قاعدة المعرفة. هل يمكنك توضيح سؤالك أكثر؟"
    
    def escalate_ticket(self, ticket_info):
        """تصعيد التذكرة للإنسان"""
        ticket_data = {
            'user_id': ticket_info['user_id'],
            'issue': ticket_info['issue'],
            'priority': ticket_info.get('priority', 'medium'),
            'created_at': datetime.now().isoformat(),
            'status': 'escalated'
        }
        
        # حفظ في قاعدة البيانات
        result = self.supabase.table('support_tickets').insert(ticket_data).execute()
        return f"تم تصعيد التذكرة للإنسان. رقم التذكرة: {result.data[0]['id']}"
    
    def provide_solution(self, problem):
        """تقديم حل للمشكلة"""
        solutions = {
            "booking_issue": "تأكد من صحة البيانات المدخلة وتوفر الخدمة في التاريخ المطلوب",
            "payment_issue": "تحقق من بيانات البطاقة الائتمانية واتصال الإنترنت",
            "cancellation_issue": "يمكنك إلغاء الحجز من قسم 'حجوزاتي' أو التواصل معنا",
            "refund_issue": "سيتم معالجة الاسترداد تلقائياً خلال 5-7 أيام عمل"
        }
        
        for key, solution in solutions.items():
            if key in problem.lower():
                return solution
        
        return "أعتذر، أحتاج لمزيد من التفاصيل لمساعدتك بشكل أفضل."
    
    def collect_feedback(self, feedback_data):
        """جمع تعليقات المستخدم"""
        feedback_record = {
            'user_id': feedback_data['user_id'],
            'rating': feedback_data['rating'],
            'comment': feedback_data['comment'],
            'created_at': datetime.now().isoformat()
        }
        
        # حفظ التعليقات
        result = self.supabase.table('user_feedback').insert(feedback_record).execute()
        return "شكراً لتعليقك! سنأخذ ملاحظاتك بعين الاعتبار لتحسين الخدمة."
    
    def process_request(self, user_request):
        return self.agent.run(user_request)

# الاستخدام
support_agent = SupportAgent()
result = support_agent.process_request("أريد إلغاء حجزي")
print(result)
```

---

## 🚀 تكامل الوكلاء في نظام واحد

```python
# main_agent_system.py
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI
import asyncio

class TravelAgentSystem:
    def __init__(self):
        # تهيئة الوكلاء
        self.booking_agent = BookingAgent()
        self.pricing_agent = PricingAgent()
        self.content_agent = ContentAgent()
        self.operations_agent = OperationsAgent()
        self.support_agent = SupportAgent()
        
        # وكيل رئيسي لتوجيه الطلبات
        self.main_agent = self.setup_main_agent()
    
    def setup_main_agent(self):
        tools = [
            Tool(
                name="booking_service",
                func=self.route_to_booking,
                description="خدمات الحجز والبحث عن رحلات وفنادق"
            ),
            Tool(
                name="pricing_service",
                func=self.route_to_pricing,
                description="خدمات التسعير ومقارنة الأسعار"
            ),
            Tool(
                name="content_service",
                func=self.route_to_content,
                description="خدمات المحتوى والنصائح السياحية"
            ),
            Tool(
                name="operations_service",
                func=self.route_to_operations,
                description="خدمات العمليات وإدارة الحجوزات"
            ),
            Tool(
                name="support_service",
                func=self.route_to_support,
                description="خدمات الدعم وخدمة العملاء"
            )
        ]
        
        return initialize_agent(
            tools,
            OpenAI(temperature=0),
            agent="zero-shot-react-description",
            verbose=True
        )
    
    def route_to_booking(self, query):
        return self.booking_agent.process_request(query)
    
    def route_to_pricing(self, query):
        return self.pricing_agent.process_request(query)
    
    def route_to_content(self, query):
        return self.content_agent.process_request(query)
    
    def route_to_operations(self, query):
        return self.operations_agent.process_request(query)
    
    def route_to_support(self, query):
        return self.support_agent.process_request(query)
    
    def process_request(self, user_request):
        """معالجة الطلب الرئيسي"""
        return self.main_agent.run(user_request)

# الاستخدام
system = TravelAgentSystem()
result = system.process_request("أريد حجز رحلة من القاهرة إلى دبي وبرنامج سياحي")
print(result)
```

---

## 📊 مراقبة الأداء

```python
# monitoring.py
import time
import logging
from datetime import datetime

class AgentMonitoring:
    def __init__(self):
        self.logger = logging.getLogger('agent_monitoring')
        self.metrics = {
            'requests_processed': 0,
            'average_response_time': 0,
            'error_rate': 0,
            'agent_usage': {}
        }
    
    def log_request(self, agent_name, request, response_time, success):
        """تسجيل طلب"""
        self.metrics['requests_processed'] += 1
        self.metrics['agent_usage'][agent_name] = self.metrics['agent_usage'].get(agent_name, 0) + 1
        
        if not success:
            self.metrics['error_rate'] += 1
        
        # تحديث متوسط وقت الاستجابة
        current_avg = self.metrics['average_response_time']
        total_requests = self.metrics['requests_processed']
        self.metrics['average_response_time'] = (
            (current_avg * (total_requests - 1) + response_time) / total_requests
        )
        
        # تسجيل في السجل
        self.logger.info(f"Agent: {agent_name}, Time: {response_time}s, Success: {success}")
    
    def get_metrics(self):
        """الحصول على المقاييس"""
        return {
            **self.metrics,
            'timestamp': datetime.now().isoformat()
        }
```

---

## 🎯 الخطوات التالية

1. **تثبيت المكتبات المطلوبة:**
```bash
pip install langchain openai amadeus supabase requests schedule
```

2. **إعداد متغيرات البيئة:**
```bash
export AMADEUS_API_KEY="your_key"
export AMADEUS_API_SECRET="your_secret"
export OPENAI_API_KEY="your_key"
export SUPABASE_URL="your_url"
export SUPABASE_ANON_KEY="your_key"
```

3. **تشغيل النظام:**
```python
system = TravelAgentSystem()
result = system.process_request("طلب المستخدم هنا")
```

هذا الدليل يوفر أساساً قوياً لبناء نظام وكلاء ذكيين متكامل للسفر والسياحة! 🚀
