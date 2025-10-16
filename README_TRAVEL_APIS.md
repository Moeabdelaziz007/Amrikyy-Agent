# 🚀 دليل APIs السفر مع Code Samples

## 📋 نظرة عامة

هذا الدليل يوفر أمثلة عملية لاستخدام جميع APIs السفر المجانية والمهنية مع كود جاهز للاستخدام.

---

## 🛫 Flight APIs

### 1. Amadeus Self-Service (الأفضل للـMVP)

**Free Tier:** 2K transactions/month

```python
# amadeus_flights.py
from amadeus import Client
import os

class AmadeusFlightSearch:
    def __init__(self):
        self.amadeus = Client(
            client_id=os.getenv('AMADEUS_API_KEY'),
            client_secret=os.getenv('AMADEUS_API_SECRET')
        )
    
    def search_flights(self, origin, destination, departure_date, adults=1):
        """البحث عن رحلات طيران"""
        try:
            response = self.amadeus.shopping.flight_offers_search.get(
                originLocationCode=origin,
                destinationLocationCode=destination,
                departureDate=departure_date,
                adults=adults
            )
            
            flights = []
            for offer in response.data[:5]:
                flight_data = {
                    'id': offer['id'],
                    'price': offer['price']['total'],
                    'currency': offer['price']['currency'],
                    'departure': {
                        'airport': offer['itineraries'][0]['segments'][0]['departure']['iataCode'],
                        'time': offer['itineraries'][0]['segments'][0]['departure']['at']
                    },
                    'arrival': {
                        'airport': offer['itineraries'][0]['segments'][-1]['arrival']['iataCode'],
                        'time': offer['itineraries'][0]['segments'][-1]['arrival']['at']
                    },
                    'duration': offer['itineraries'][0]['duration'],
                    'stops': len(offer['itineraries'][0]['segments']) - 1,
                    'airline': offer['itineraries'][0]['segments'][0]['carrierCode']
                }
                flights.append(flight_data)
            
            return flights
            
        except Exception as e:
            return {'error': str(e)}
    
    def get_airport_info(self, keyword):
        """معلومات المطارات"""
        try:
            response = self.amadeus.reference_data.locations.get(
                keyword=keyword,
                subType='AIRPORT'
            )
            
            airports = []
            for airport in response.data[:5]:
                airport_data = {
                    'code': airport['iataCode'],
                    'name': airport['name'],
                    'city': airport['address']['cityName'],
                    'country': airport['address']['countryName']
                }
                airports.append(airport_data)
            
            return airports
            
        except Exception as e:
            return {'error': str(e)}

# الاستخدام
flight_search = AmadeusFlightSearch()
flights = flight_search.search_flights('CAI', 'DXB', '2024-12-25', 2)
print(flights)
```

### 2. SerpAPI (Google Flights Scraping)

**Free Tier:** 100 searches/month

```python
# serpapi_flights.py
import requests
import os

class SerpAPIFlightSearch:
    def __init__(self):
        self.api_key = os.getenv('SERPAPI_KEY')
        self.base_url = 'https://serpapi.com/search'
    
    def search_google_flights(self, origin, destination, departure_date, return_date=None):
        """البحث في Google Flights عبر SerpAPI"""
        params = {
            'api_key': self.api_key,
            'engine': 'google_flights',
            'departure_id': origin,
            'arrival_id': destination,
            'outbound_date': departure_date,
            'currency': 'USD',
            'hl': 'ar'  # العربية
        }
        
        if return_date:
            params['return_date'] = return_date
        
        try:
            response = requests.get(self.base_url, params=params)
            data = response.json()
            
            flights = []
            if 'flights' in data:
                for flight in data['flights'][:5]:
                    flight_data = {
                        'airline': flight.get('airline', 'غير محدد'),
                        'price': flight.get('price', 'غير محدد'),
                        'departure_time': flight.get('departure_time', 'غير محدد'),
                        'arrival_time': flight.get('arrival_time', 'غير محدد'),
                        'duration': flight.get('duration', 'غير محدد'),
                        'stops': flight.get('stops', 0)
                    }
                    flights.append(flight_data)
            
            return flights
            
        except Exception as e:
            return {'error': str(e)}

# الاستخدام
serp_search = SerpAPIFlightSearch()
flights = serp_search.search_google_flights('CAI', 'DXB', '2024-12-25')
print(flights)
```

### 3. Aviationstack (Flight Status)

**Free Tier:** 100 requests/month

```python
# aviationstack.py
import requests
import os

class AviationStackAPI:
    def __init__(self):
        self.api_key = os.getenv('AVIATIONSTACK_API_KEY')
        self.base_url = 'http://api.aviationstack.com/v1'
    
    def get_flight_status(self, flight_number):
        """حالة الرحلة"""
        params = {
            'access_key': self.api_key,
            'flight_iata': flight_number
        }
        
        try:
            response = requests.get(f'{self.base_url}/flights', params=params)
            data = response.json()
            
            if 'data' in data and data['data']:
                flight = data['data'][0]
                return {
                    'flight_number': flight['flight']['iata'],
                    'airline': flight['airline']['name'],
                    'departure': {
                        'airport': flight['departure']['airport'],
                        'time': flight['departure']['scheduled'],
                        'gate': flight['departure'].get('gate'),
                        'terminal': flight['departure'].get('terminal')
                    },
                    'arrival': {
                        'airport': flight['arrival']['airport'],
                        'time': flight['arrival']['scheduled'],
                        'gate': flight['arrival'].get('gate'),
                        'terminal': flight['arrival'].get('terminal')
                    },
                    'status': flight['flight_status']
                }
            
            return {'error': 'لم يتم العثور على الرحلة'}
            
        except Exception as e:
            return {'error': str(e)}

# الاستخدام
aviation = AviationStackAPI()
status = aviation.get_flight_status('MS777')
print(status)
```

---

## 🏨 Hotel APIs

### 1. Amadeus Hotels

```python
# amadeus_hotels.py
from amadeus import Client
import os

class AmadeusHotelSearch:
    def __init__(self):
        self.amadeus = Client(
            client_id=os.getenv('AMADEUS_API_KEY'),
            client_secret=os.getenv('AMADEUS_API_SECRET')
        )
    
    def search_hotels(self, city_code, check_in, check_out, adults=2):
        """البحث عن فنادق"""
        try:
            response = self.amadeus.shopping.hotel_offers.get(
                cityCode=city_code,
                checkInDate=check_in,
                checkOutDate=check_out,
                adults=adults
            )
            
            hotels = []
            for hotel in response.data[:5]:
                hotel_data = {
                    'id': hotel['hotel']['hotelId'],
                    'name': hotel['hotel']['name'],
                    'rating': hotel['hotel'].get('rating', 'غير محدد'),
                    'price': hotel['offers'][0]['price']['total'],
                    'currency': hotel['offers'][0]['price']['currency'],
                    'address': hotel['hotel']['address']['lines'][0],
                    'amenities': hotel['hotel'].get('amenities', []),
                    'description': hotel['hotel'].get('description', {}).get('text', '')
                }
                hotels.append(hotel_data)
            
            return hotels
            
        except Exception as e:
            return {'error': str(e)}
    
    def get_hotel_details(self, hotel_id):
        """تفاصيل الفندق"""
        try:
            response = self.amadeus.shopping.hotel_offers_by_hotel.get(
                hotelIds=hotel_id
            )
            
            if response.data:
                hotel = response.data[0]
                return {
                    'name': hotel['hotel']['name'],
                    'description': hotel['hotel'].get('description', {}).get('text', ''),
                    'amenities': hotel['hotel'].get('amenities', []),
                    'images': hotel['hotel'].get('media', []),
                    'location': hotel['hotel']['address'],
                    'contact': hotel['hotel'].get('contact', {})
                }
            
            return {'error': 'لم يتم العثور على الفندق'}
            
        except Exception as e:
            return {'error': str(e)}

# الاستخدام
hotel_search = AmadeusHotelSearch()
hotels = hotel_search.search_hotels('DXB', '2024-12-25', '2024-12-27', 2)
print(hotels)
```

### 2. Booking.com Affiliate API

```python
# booking_affiliate.py
import requests
import os

class BookingAffiliateAPI:
    def __init__(self):
        self.api_key = os.getenv('BOOKING_AFFILIATE_API_KEY')
        self.base_url = 'https://distribution-xml.booking.com/2.5/json'
    
    def search_hotels(self, city, check_in, check_out, guests=2):
        """البحث عن فنادق عبر Booking.com"""
        params = {
            'api_key': self.api_key,
            'city': city,
            'checkin': check_in,
            'checkout': check_out,
            'guests': guests,
            'rows': 5
        }
        
        try:
            response = requests.get(f'{self.base_url}/hotelAvailability', params=params)
            data = response.json()
            
            hotels = []
            if 'result' in data:
                for hotel in data['result'][:5]:
                    hotel_data = {
                        'id': hotel['hotel_id'],
                        'name': hotel['name'],
                        'price': hotel.get('price', 'غير محدد'),
                        'rating': hotel.get('rating', 'غير محدد'),
                        'address': hotel.get('address', 'غير محدد'),
                        'images': hotel.get('images', []),
                        'amenities': hotel.get('amenities', [])
                    }
                    hotels.append(hotel_data)
            
            return hotels
            
        except Exception as e:
            return {'error': str(e)}

# الاستخدام
booking = BookingAffiliateAPI()
hotels = booking.search_hotels('Dubai', '2024-12-25', '2024-12-27', 2)
print(hotels)
```

---

## 🗺️ Maps APIs

### 1. Mapbox (الأفضل المجاني)

**Free Tier:** 50K map loads/month

```python
# mapbox_integration.py
import requests
import os

class MapboxAPI:
    def __init__(self):
        self.access_token = os.getenv('MAPBOX_ACCESS_TOKEN')
        self.base_url = 'https://api.mapbox.com'
    
    def get_directions(self, start, end, profile='driving'):
        """الحصول على اتجاهات"""
        params = {
            'access_token': self.access_token,
            'profile': profile,
            'geometries': 'geojson'
        }
        
        url = f"{self.base_url}/directions/v5/mapbox/{profile}/{start};{end}"
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            
            if 'routes' in data and data['routes']:
                route = data['routes'][0]
                return {
                    'distance': route['distance'],  # بالمتر
                    'duration': route['duration'],  # بالثانية
                    'geometry': route['geometry'],
                    'instructions': self.parse_instructions(route['legs'][0]['steps'])
                }
            
            return {'error': 'لم يتم العثور على طريق'}
            
        except Exception as e:
            return {'error': str(e)}
    
    def parse_instructions(self, steps):
        """تحليل تعليمات الطريق"""
        instructions = []
        for step in steps:
            instructions.append({
                'instruction': step['maneuver']['instruction'],
                'distance': step['distance'],
                'duration': step['duration']
            })
        return instructions
    
    def geocode(self, address):
        """تحويل العنوان إلى إحداثيات"""
        params = {
            'access_token': self.access_token,
            'limit': 1
        }
        
        url = f"{self.base_url}/geocoding/v5/mapbox.places/{address}.json"
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            
            if 'features' in data and data['features']:
                feature = data['features'][0]
                return {
                    'longitude': feature['center'][0],
                    'latitude': feature['center'][1],
                    'place_name': feature['place_name'],
                    'context': feature.get('context', [])
                }
            
            return {'error': 'لم يتم العثور على العنوان'}
            
        except Exception as e:
            return {'error': str(e)}
    
    def reverse_geocode(self, longitude, latitude):
        """تحويل الإحداثيات إلى عنوان"""
        params = {
            'access_token': self.access_token
        }
        
        url = f"{self.base_url}/geocoding/v5/mapbox.places/{longitude},{latitude}.json"
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            
            if 'features' in data and data['features']:
                feature = data['features'][0]
                return {
                    'address': feature['place_name'],
                    'context': feature.get('context', []),
                    'confidence': feature.get('relevance', 0)
                }
            
            return {'error': 'لم يتم العثور على العنوان'}
            
        except Exception as e:
            return {'error': str(e)}

# الاستخدام
mapbox = MapboxAPI()
directions = mapbox.get_directions('2.3522,48.8566', '4.9041,52.3676')  # Paris to Amsterdam
print(directions)
```

### 2. Nominatim (OpenStreetMap - مجاني تماماً)

```python
# nominatim_integration.py
import requests

class NominatimAPI:
    def __init__(self):
        self.base_url = 'https://nominatim.openstreetmap.org'
        self.headers = {
            'User-Agent': 'TravelAgent/1.0'
        }
    
    def geocode(self, address):
        """تحويل العنوان إلى إحداثيات"""
        params = {
            'q': address,
            'format': 'json',
            'limit': 1,
            'addressdetails': 1
        }
        
        try:
            response = requests.get(f'{self.base_url}/search', params=params, headers=self.headers)
            data = response.json()
            
            if data:
                location = data[0]
                return {
                    'longitude': float(location['lon']),
                    'latitude': float(location['lat']),
                    'display_name': location['display_name'],
                    'address': location.get('address', {}),
                    'importance': location.get('importance', 0)
                }
            
            return {'error': 'لم يتم العثور على العنوان'}
            
        except Exception as e:
            return {'error': str(e)}
    
    def reverse_geocode(self, longitude, latitude):
        """تحويل الإحداثيات إلى عنوان"""
        params = {
            'lat': latitude,
            'lon': longitude,
            'format': 'json',
            'addressdetails': 1
        }
        
        try:
            response = requests.get(f'{self.base_url}/reverse', params=params, headers=self.headers)
            data = response.json()
            
            return {
                'address': data['display_name'],
                'address_details': data.get('address', {}),
                'place_id': data.get('place_id')
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def search_places(self, query, country=None):
        """البحث عن أماكن"""
        params = {
            'q': query,
            'format': 'json',
            'limit': 5,
            'addressdetails': 1
        }
        
        if country:
            params['countrycodes'] = country
        
        try:
            response = requests.get(f'{self.base_url}/search', params=params, headers=self.headers)
            data = response.json()
            
            places = []
            for place in data:
                places.append({
                    'name': place['display_name'],
                    'longitude': float(place['lon']),
                    'latitude': float(place['lat']),
                    'importance': place.get('importance', 0),
                    'type': place.get('type', ''),
                    'class': place.get('class', '')
                })
            
            return places
            
        except Exception as e:
            return {'error': str(e)}

# الاستخدام
nominatim = NominatimAPI()
location = nominatim.geocode('برج خليفة، دبي')
print(location)
```

---

## 💳 Payment APIs

### 1. Stripe Integration

```python
# stripe_integration.py
import stripe
import os

class StripePayment:
    def __init__(self):
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
    
    def create_payment_intent(self, amount, currency='usd', description='Travel Booking'):
        """إنشاء نية دفع"""
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount,  # بالقرش (100 = 1 دولار)
                currency=currency,
                description=description,
                metadata={
                    'service': 'travel_booking',
                    'timestamp': str(int(time.time()))
                }
            )
            
            return {
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id,
                'status': intent.status
            }
            
        except stripe.error.StripeError as e:
            return {'error': str(e)}
    
    def create_payment_link(self, amount, currency='usd', description='Travel Booking'):
        """إنشاء رابط دفع"""
        try:
            link = stripe.PaymentLink.create(
                line_items=[{
                    'price_data': {
                        'currency': currency,
                        'product_data': {
                            'name': description,
                        },
                        'unit_amount': amount,
                    },
                    'quantity': 1,
                }],
                metadata={
                    'service': 'travel_booking'
                }
            )
            
            return {
                'payment_link': link.url,
                'link_id': link.id
            }
            
        except stripe.error.StripeError as e:
            return {'error': str(e)}
    
    def verify_payment(self, payment_intent_id):
        """التحقق من حالة الدفع"""
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                'status': intent.status,
                'amount': intent.amount,
                'currency': intent.currency,
                'payment_method': intent.payment_method,
                'receipt_url': intent.charges.data[0].receipt_url if intent.charges.data else None
            }
            
        except stripe.error.StripeError as e:
            return {'error': str(e)}

# الاستخدام
stripe_payment = StripePayment()
payment = stripe_payment.create_payment_intent(5000, 'usd', 'Flight Booking Cairo-Dubai')
print(payment)
```

### 2. Razorpay Integration

```python
# razorpay_integration.py
import razorpay
import os

class RazorpayPayment:
    def __init__(self):
        self.client = razorpay.Client(
            auth=(os.getenv('RAZORPAY_KEY_ID'), os.getenv('RAZORPAY_KEY_SECRET'))
        )
    
    def create_order(self, amount, currency='INR', receipt='travel_booking'):
        """إنشاء طلب دفع"""
        try:
            data = {
                'amount': amount,  # بالبيسة (100 = 1 روبية)
                'currency': currency,
                'receipt': receipt,
                'notes': {
                    'service': 'travel_booking'
                }
            }
            
            order = self.client.order.create(data=data)
            
            return {
                'order_id': order['id'],
                'amount': order['amount'],
                'currency': order['currency'],
                'receipt': order['receipt']
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def verify_payment(self, payment_id, order_id, signature):
        """التحقق من الدفع"""
        try:
            params = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            
            result = self.client.utility.verify_payment_signature(params)
            
            if result:
                return {'verified': True, 'payment_id': payment_id}
            else:
                return {'verified': False, 'error': 'Invalid signature'}
                
        except Exception as e:
            return {'error': str(e)}
    
    def capture_payment(self, payment_id, amount):
        """استلام الدفع"""
        try:
            payment = self.client.payment.capture(payment_id, amount)
            
            return {
                'captured': payment['captured'],
                'status': payment['status'],
                'amount': payment['amount'],
                'currency': payment['currency']
            }
            
        except Exception as e:
            return {'error': str(e)}

# الاستخدام
razorpay_payment = RazorpayPayment()
order = razorpay_payment.create_order(50000, 'INR', 'flight_booking_001')
print(order)
```

---

## 📊 Database Integration (Supabase)

```python
# supabase_integration.py
from supabase import create_client, Client
import os

class SupabaseTravelDB:
    def __init__(self):
        self.supabase: Client = create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_ANON_KEY')
        )
    
    def save_booking(self, booking_data):
        """حفظ الحجز"""
        try:
            result = self.supabase.table('bookings').insert(booking_data).execute()
            return {'success': True, 'data': result.data}
        except Exception as e:
            return {'error': str(e)}
    
    def get_user_bookings(self, user_id):
        """جلب حجوزات المستخدم"""
        try:
            result = self.supabase.table('bookings').select('*').eq('user_id', user_id).execute()
            return {'success': True, 'data': result.data}
        except Exception as e:
            return {'error': str(e)}
    
    def update_booking_status(self, booking_id, status):
        """تحديث حالة الحجز"""
        try:
            result = self.supabase.table('bookings').update({'status': status}).eq('id', booking_id).execute()
            return {'success': True, 'data': result.data}
        except Exception as e:
            return {'error': str(e)}
    
    def save_search_history(self, search_data):
        """حفظ تاريخ البحث"""
        try:
            result = self.supabase.table('search_history').insert(search_data).execute()
            return {'success': True, 'data': result.data}
        except Exception as e:
            return {'error': str(e)}
    
    def get_user_preferences(self, user_id):
        """جلب تفضيلات المستخدم"""
        try:
            result = self.supabase.table('user_preferences').select('*').eq('user_id', user_id).execute()
            return {'success': True, 'data': result.data}
        except Exception as e:
            return {'error': str(e)}
    
    def update_user_preferences(self, user_id, preferences):
        """تحديث تفضيلات المستخدم"""
        try:
            result = self.supabase.table('user_preferences').upsert({
                'user_id': user_id,
                'preferences': preferences
            }).execute()
            return {'success': True, 'data': result.data}
        except Exception as e:
            return {'error': str(e)}

# الاستخدام
db = SupabaseTravelDB()
booking_result = db.save_booking({
    'user_id': 'user123',
    'type': 'flight',
    'origin': 'CAI',
    'destination': 'DXB',
    'departure_date': '2024-12-25',
    'price': 500,
    'currency': 'USD',
    'status': 'confirmed'
})
print(booking_result)
```

---

## 🤖 LLM Integration

```python
# llm_integration.py
import openai
import os

class LLMTravelAssistant:
    def __init__(self):
        openai.api_key = os.getenv('OPENAI_API_KEY')
    
    def generate_travel_recommendations(self, destination, preferences):
        """إنشاء توصيات سفر"""
        prompt = f"""
        أنت مساعد سفر ذكي. أنشئ توصيات شاملة لزيارة {destination}.
        
        تفضيلات المسافر:
        - الميزانية: {preferences.get('budget', 'متوسط')}
        - المدة: {preferences.get('duration', 'أسبوع')}
        - الاهتمامات: {', '.join(preferences.get('interests', ['ثقافة', 'طعام', 'معالم']))}
        
        أدرج:
        1. أفضل الأماكن للزيارة
        2. أفضل المطاعم
        3. أفضل الفنادق
        4. النقل المحلي
        5. نصائح مهمة
        
        اكتب باللغة العربية بطريقة جذابة ومفيدة.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.7
            )
            
            return {
                'recommendations': response.choices[0].message.content,
                'destination': destination
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def create_itinerary(self, destination, days, interests):
        """إنشاء برنامج سياحي"""
        prompt = f"""
        أنشئ برنامج سياحي مفصل لزيارة {destination} لمدة {days} أيام.
        
        اهتمامات المسافر: {', '.join(interests)}
        
        البرنامج يجب أن يتضمن:
        - تفاصيل كل يوم
        - الأماكن الموصى بزيارتها
        - أوقات الزيارة المقترحة
        - تكلفة تقريبية لكل نشاط
        - نصائح عملية
        
        اكتب باللغة العربية.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1500,
                temperature=0.7
            )
            
            return {
                'itinerary': response.choices[0].message.content,
                'destination': destination,
                'days': days
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def answer_travel_question(self, question):
        """الإجابة على أسئلة السفر"""
        system_prompt = """
        أنت مساعد سفر خبير ومفيد. أجِب على أسئلة السفر بدقة ومفيدة.
        استخدم اللغة العربية وتضمن أن تكون إجابتك شاملة ومفيدة.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ],
                max_tokens=500,
                temperature=0.5
            )
            
            return {
                'answer': response.choices[0].message.content,
                'question': question
            }
            
        except Exception as e:
            return {'error': str(e)}

# الاستخدام
llm_assistant = LLMTravelAssistant()
recommendations = llm_assistant.generate_travel_recommendations('دبي', {
    'budget': 'مرتفع',
    'duration': '5 أيام',
    'interests': ['ثقافة', 'تسوق', 'طعام']
})
print(recommendations)
```

---

## 🚀 Integration Example (كل شيء معاً)

```python
# complete_travel_system.py
from amadeus_flights import AmadeusFlightSearch
from amadeus_hotels import AmadeusHotelSearch
from mapbox_integration import MapboxAPI
from stripe_integration import StripePayment
from supabase_integration import SupabaseTravelDB
from llm_integration import LLMTravelAssistant

class CompleteTravelSystem:
    def __init__(self):
        self.flight_search = AmadeusFlightSearch()
        self.hotel_search = AmadeusHotelSearch()
        self.mapbox = MapboxAPI()
        self.stripe = StripePayment()
        self.db = SupabaseTravelDB()
        self.llm = LLMTravelAssistant()
    
    def plan_trip(self, user_request):
        """تخطيط رحلة كاملة"""
        # تحليل الطلب باستخدام LLM
        analysis = self.llm.answer_travel_question(f"حلل هذا الطلب وحدد المتطلبات: {user_request}")
        
        # البحث عن رحلات طيران
        flights = self.flight_search.search_flights('CAI', 'DXB', '2024-12-25', 2)
        
        # البحث عن فنادق
        hotels = self.hotel_search.search_hotels('DXB', '2024-12-25', '2024-12-27', 2)
        
        # إنشاء برنامج سياحي
        itinerary = self.llm.create_itinerary('دبي', 3, ['ثقافة', 'تسوق', 'طعام'])
        
        # حفظ في قاعدة البيانات
        trip_data = {
            'user_id': 'user123',
            'destination': 'Dubai',
            'flights': flights,
            'hotels': hotels,
            'itinerary': itinerary,
            'status': 'planned'
        }
        
        self.db.save_booking(trip_data)
        
        return {
            'flights': flights,
            'hotels': hotels,
            'itinerary': itinerary,
            'analysis': analysis
        }
    
    def process_booking(self, booking_data):
        """معالجة الحجز"""
        # إنشاء دفع
        payment = self.stripe.create_payment_intent(
            booking_data['amount'],
            booking_data['currency'],
            booking_data['description']
        )
        
        # حفظ الحجز
        booking_result = self.db.save_booking(booking_data)
        
        return {
            'payment': payment,
            'booking': booking_result
        }

# الاستخدام
system = CompleteTravelSystem()
trip = system.plan_trip("أريد تخطيط رحلة إلى دبي لمدة 3 أيام مع زوجتي")
print(trip)
```

---

## 📋 Setup Instructions

### 1. تثبيت المكتبات

```bash
pip install amadeus stripe supabase openai requests razorpay
```

### 2. إعداد متغيرات البيئة

```bash
# .env
AMADEUS_API_KEY=your_amadeus_key
AMADEUS_API_SECRET=your_amadeus_secret
SERPAPI_KEY=your_serpapi_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token
STRIPE_SECRET_KEY=your_stripe_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key
```

### 3. تشغيل النظام

```python
from complete_travel_system import CompleteTravelSystem

system = CompleteTravelSystem()
result = system.plan_trip("رحلة إلى دبي")
```

---

## 🎯 الخطوات التالية

1. **اختيار APIs المناسبة** حسب احتياجاتك
2. **إعداد الحسابات** والحصول على API keys
3. **تطبيق الكود** في مشروعك
4. **اختبار التكامل** مع البيانات الحقيقية
5. **إضافة ميزات إضافية** حسب الحاجة

هذا الدليل يوفر أساساً قوياً لبناء نظام سفر متكامل! 🚀
