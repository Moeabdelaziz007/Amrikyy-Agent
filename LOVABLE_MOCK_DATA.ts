/**
 * 🎭 COMPLETE MOCK DATA FOR LOVABLE UI DEVELOPMENT
 *
 * This file provides realistic mock data that matches the exact structure
 * of the Amrikyy backend API responses. Use this for rapid UI development,
 * then swap with real API calls when ready.
 *
 * Usage in your Lovable component:
 * import { mockFlights, mockHotels, mockTours, mockAgentResponse } from './LOVABLE_MOCK_DATA.ts';
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const wait = (ms = 700) => new Promise((res) => setTimeout(res, ms));

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// MOCK AGENT CHAT RESPONSES
// ============================================================================

export async function mockAgentChat(
  country: 'Egypt' | 'Saudi' | 'UAE',
  message: string
): Promise<string> {
  await wait(600);

  const responses: Record<string, string[]> = {
    Egypt: [
      'أهلاً! Best time to visit Egypt is from October to April when the weather is pleasant. The Pyramids are less crowded in early morning.',
      'Cairo has excellent family hotels! I recommend the Marriott Mena House near the Pyramids - pool, kids club, stunning views.',
      'For halal restaurants in Cairo, try Abou El Sid (traditional Egyptian), Kazaz (Turkish), or Taboula (Lebanese). All certified halal.',
      'Budget tip: Book domestic flights early, use Uber instead of taxis, and eat at local restaurants. Can save 40% on your trip!',
    ],
    Saudi: [
      'مرحباً! For Hajj or Umrah, book hotels within walking distance of Haram. Prices vary greatly by proximity.',
      'Best time for Riyadh is Nov-March. Summer temperatures can reach 45°C! Consider visiting during Riyadh Season for festivals.',
      'Family activities: Visit Boulevard Riyadh City, Al Hokair Time, or the Edge of the World natural landmark outside the city.',
      'Budget tip: Many museums and cultural sites in Saudi are free! Use Careem for transport, very affordable.',
    ],
    UAE: [
      'أهلاً وسهلاً! Dubai is amazing year-round, but Nov-March is most comfortable. Summer has great hotel deals though!',
      'Top family spots: Dubai Mall aquarium, IMG Worlds, Legoland, and La Mer Beach. All very kid-friendly.',
      'Halal dining everywhere in UAE! Try Pierchic for seafood, Ravi Restaurant for Pakistani, or Zuma for upscale Japanese.',
      'Budget hack: Use Dubai Metro (very cheap!), visit during DSS/DSF sales, and book activities through Groupon UAE for discounts.',
    ],
  };

  const countryResponses = responses[country] || responses.Egypt;
  const randomResponse =
    countryResponses[Math.floor(Math.random() * countryResponses.length)];

  return `${country} Agent (DNA: ${
    country === 'Egypt' ? '850' : country === 'Saudi' ? '875' : '825'
  }): ${randomResponse}`;
}

// ============================================================================
// MOCK FLIGHTS
// ============================================================================

export async function mockFlights(query: {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
}): Promise<any[]> {
  await wait(500);

  const airlines = [
    { code: 'MS', name: 'EgyptAir', logo: '🇪🇬' },
    { code: 'SV', name: 'Saudia', logo: '🇸🇦' },
    { code: 'EK', name: 'Emirates', logo: '🇦🇪' },
    { code: 'QR', name: 'Qatar Airways', logo: '🇶🇦' },
    { code: 'TK', name: 'Turkish Airlines', logo: '🇹🇷' },
    { code: 'LH', name: 'Lufthansa', logo: '🇩🇪' },
    { code: 'BA', name: 'British Airways', logo: '🇬🇧' },
    { code: 'AF', name: 'Air France', logo: '🇫🇷' },
  ];

  return Array.from({ length: 10 }).map((_, i) => {
    const airline = airlines[i % airlines.length];
    const basePrice = 400 + i * 75;
    const stops = i % 3 === 0 ? 0 : i % 2 === 0 ? 1 : 2;
    const duration = 360 + i * 45 + stops * 90; // minutes

    return {
      id: `FL${String(i + 1).padStart(3, '0')}`,
      outbound: {
        flightNumber: `${airline.code}${100 + i}`,
        airline: airline.code,
        airlineName: airline.name,
        airlineLogo: airline.logo,
        departure: {
          airport: query.origin || 'JFK',
          airportName: 'John F. Kennedy International',
          time: `2024-03-15T${8 + (i % 12)}:${(i * 15) % 60}:00Z`,
          terminal: String(1 + (i % 4)),
        },
        arrival: {
          airport: query.destination || 'CAI',
          airportName: 'Cairo International Airport',
          time: `2024-03-15T${16 + (i % 8)}:${(i * 23) % 60}:00Z`,
          terminal: String(1 + (i % 3)),
        },
        duration, // minutes
        stops,
        aircraft: i % 2 === 0 ? 'Boeing 777-300ER' : 'Airbus A380',
      },
      inbound: query.returnDate
        ? {
            flightNumber: `${airline.code}${200 + i}`,
            airline: airline.code,
            airlineName: airline.name,
            departure: {
              airport: query.destination || 'CAI',
              airportName: 'Cairo International Airport',
              time: `2024-03-22T${10 + (i % 10)}:${(i * 17) % 60}:00Z`,
              terminal: String(1 + (i % 3)),
            },
            arrival: {
              airport: query.origin || 'JFK',
              airportName: 'John F. Kennedy International',
              time: `2024-03-22T${18 + (i % 8)}:${(i * 29) % 60}:00Z`,
              terminal: String(1 + (i % 4)),
            },
            duration,
            stops,
            aircraft: i % 2 === 0 ? 'Boeing 787-9' : 'Airbus A350',
          }
        : null,
      price: {
        total: basePrice * (query.returnDate ? 1.8 : 1),
        currency: 'USD',
        perPerson: basePrice,
        breakdown: {
          baseFare: basePrice * 0.75,
          taxes: basePrice * 0.18,
          fees: basePrice * 0.07,
        },
      },
      baggage: {
        checked: stops === 0 ? '2 pieces (23kg each)' : '1 piece (23kg)',
        cabin: '1 piece (8kg)',
      },
      amenities: [
        'WiFi',
        'Entertainment',
        'Meals included',
        'Power outlets',
        ...(i % 3 === 0 ? ['Lie-flat seats'] : []),
        ...(i % 2 === 0 ? ['Priority boarding'] : []),
      ],
      bookingClass: i % 4 === 0 ? 'C' : 'Y',
      cabinClass: i % 4 === 0 ? 'Business' : 'Economy',
      seatsAvailable: 3 + i,
      rating: 4.0 + (i % 5) * 0.2,
      reviews: 500 + i * 100,
    };
  });
}

// ============================================================================
// MOCK HOTELS
// ============================================================================

export async function mockHotels(query: {
  destination?: string;
  checkInDate?: string;
  checkOutDate?: string;
  rooms?: number;
  guests?: { adults: number; children?: number };
}): Promise<any[]> {
  await wait(400);

  const hotelNames = [
    {
      name: 'Marriott Mena House',
      city: 'Cairo',
      stars: 5,
      landmark: 'Pyramids View',
    },
    {
      name: 'Four Seasons Nile Plaza',
      city: 'Cairo',
      stars: 5,
      landmark: 'Nile River',
    },
    {
      name: 'Steigenberger Cairo',
      city: 'Cairo',
      stars: 4,
      landmark: 'Downtown',
    },
    {
      name: 'Hilton Luxor Resort',
      city: 'Luxor',
      stars: 5,
      landmark: 'Valley of Kings',
    },
    {
      name: 'Sofitel Winter Palace',
      city: 'Luxor',
      stars: 5,
      landmark: 'Historic',
    },
    {
      name: 'Fairmont Riyadh',
      city: 'Riyadh',
      stars: 5,
      landmark: 'Business District',
    },
    {
      name: 'Burj Al Arab',
      city: 'Dubai',
      stars: 5,
      landmark: 'Iconic Sail Hotel',
    },
    {
      name: 'Atlantis The Palm',
      city: 'Dubai',
      stars: 5,
      landmark: 'Palm Jumeirah',
    },
    {
      name: 'Address Downtown',
      city: 'Dubai',
      stars: 5,
      landmark: 'Burj Khalifa View',
    },
  ];

  return hotelNames.map((hotel, i) => {
    const basePrice = 80 + i * 40;
    const nights = 3; // Calculate from dates if provided

    return {
      id: `HTL${String(i + 1).padStart(3, '0')}`,
      name: hotel.name,
      starRating: hotel.stars,
      landmark: hotel.landmark,
      address: {
        street: `${i + 10} Main Boulevard`,
        city: hotel.city,
        country:
          hotel.city.includes('Cairo') || hotel.city.includes('Luxor')
            ? 'Egypt'
            : hotel.city === 'Riyadh'
            ? 'Saudi Arabia'
            : 'UAE',
        postalCode: `${12000 + i}`,
      },
      location: {
        latitude: 29.9792 + i * 0.01,
        longitude: 31.134 + i * 0.01,
      },
      images: [
        `https://images.unsplash.com/photo-${1566073771259 + i}`,
        `https://images.unsplash.com/photo-${1582719478250 + i}`,
        `https://images.unsplash.com/photo-${1590073242678 + i}`,
      ],
      description: `Luxury ${hotel.stars}-star hotel featuring ${hotel.landmark}. Experience world-class hospitality with modern amenities and exceptional service.`,
      amenities: [
        'Free WiFi',
        'Swimming Pool',
        'Spa & Wellness',
        'Restaurant',
        'Room Service',
        'Gym & Fitness',
        'Parking',
        ...(hotel.stars === 5
          ? ['Concierge', 'Airport Shuttle', 'Kids Club']
          : []),
      ],
      rooms: [
        {
          id: `RM${i * 10 + 1}`,
          type: 'Deluxe Room',
          description: 'Spacious room with city/landmark views',
          maxOccupancy: 2,
          beds: '1 King or 2 Twin',
          size: '32 sqm',
          price: {
            total: basePrice * nights,
            perNight: basePrice,
            currency: 'USD',
          },
          available: 3 + i,
        },
        {
          id: `RM${i * 10 + 2}`,
          type: 'Family Suite',
          description: 'Two-bedroom suite perfect for families',
          maxOccupancy: 4,
          beds: '1 King + 2 Twin',
          size: '65 sqm',
          price: {
            total: basePrice * 1.8 * nights,
            perNight: basePrice * 1.8,
            currency: 'USD',
          },
          available: 2,
        },
        {
          id: `RM${i * 10 + 3}`,
          type: 'Presidential Suite',
          description: 'Ultimate luxury with panoramic views',
          maxOccupancy: 4,
          beds: '1 King + Living Area',
          size: '120 sqm',
          price: {
            total: basePrice * 3.5 * nights,
            perNight: basePrice * 3.5,
            currency: 'USD',
          },
          available: 1,
        },
      ],
      rating: {
        overall: 4.2 + (i % 5) * 0.15,
        reviews: 800 + i * 200,
        breakdown: {
          cleanliness: 4.5 + (i % 3) * 0.1,
          service: 4.6 + (i % 4) * 0.1,
          location: 4.8 + (i % 2) * 0.1,
          value: 4.0 + (i % 5) * 0.15,
        },
      },
      cancellationPolicy:
        hotel.stars === 5
          ? 'Free cancellation until 48 hours before check-in'
          : 'Free cancellation until 72 hours before check-in',
      distanceFromCenter: `${1 + i * 0.5} km from city center`,
    };
  });
}

// ============================================================================
// MOCK TOURS & ACTIVITIES
// ============================================================================

export async function mockTours(query: {
  country?: 'Egypt' | 'Saudi' | 'UAE';
  city?: string;
  category?: string;
}): Promise<any[]> {
  await wait(300);

  const tours = {
    Egypt: [
      {
        title: 'Pyramids of Giza & Sphinx Half-Day Tour',
        type: 'tour',
        duration: '4 hours',
        price: 45,
        category: 'Historical',
      },
      {
        title: 'Nile River Dinner Cruise with Entertainment',
        type: 'tour',
        duration: '3 hours',
        price: 65,
        category: 'Cultural',
      },
      {
        title: 'Egyptian Museum & Khan el-Khalili Bazaar',
        type: 'tour',
        duration: '5 hours',
        price: 50,
        category: 'Cultural',
      },
      {
        title: 'Luxor: Valley of Kings & Karnak Temple',
        type: 'tour',
        duration: 'Full day',
        price: 120,
        category: 'Historical',
      },
      {
        title: 'Alexandria Day Trip from Cairo',
        type: 'tour',
        duration: '10 hours',
        price: 95,
        category: 'Historical',
      },
      {
        title: 'Quad Biking in the Egyptian Desert',
        type: 'adventure',
        duration: '2 hours',
        price: 40,
        category: 'Adventure',
      },
    ],
    Saudi: [
      {
        title: 'Riyadh City Tour: Kingdom Tower & Masmak Fortress',
        type: 'tour',
        duration: '4 hours',
        price: 55,
        category: 'Cultural',
      },
      {
        title: 'Edge of the World Adventure',
        type: 'adventure',
        duration: '6 hours',
        price: 85,
        category: 'Adventure',
      },
      {
        title: 'Diriyah Historical District Walking Tour',
        type: 'tour',
        duration: '3 hours',
        price: 40,
        category: 'Historical',
      },
      {
        title: 'Al Ula & Hegra (Madain Salih) Day Trip',
        type: 'tour',
        duration: 'Full day',
        price: 180,
        category: 'Historical',
      },
      {
        title: 'Red Sea Snorkeling & Beach Experience',
        type: 'adventure',
        duration: '5 hours',
        price: 70,
        category: 'Adventure',
      },
    ],
    UAE: [
      {
        title: 'Burj Khalifa: At The Top Sky (Levels 124, 125 & 148)',
        type: 'landmark',
        duration: '2 hours',
        price: 95,
        category: 'Landmarks',
      },
      {
        title: 'Desert Safari with BBQ Dinner & Entertainment',
        type: 'adventure',
        duration: '6 hours',
        price: 75,
        category: 'Adventure',
      },
      {
        title: 'Dubai Marina Yacht Cruise',
        type: 'tour',
        duration: '2 hours',
        price: 120,
        category: 'Luxury',
      },
      {
        title: 'Abu Dhabi: Grand Mosque & Louvre Museum',
        type: 'tour',
        duration: 'Full day',
        price: 110,
        category: 'Cultural',
      },
      {
        title: 'IMG Worlds of Adventure - Theme Park Ticket',
        type: 'entertainment',
        duration: 'Full day',
        price: 80,
        category: 'Family',
      },
      {
        title: 'Skydiving Dubai - Palm Jumeirah',
        type: 'adventure',
        duration: '3 hours',
        price: 450,
        category: 'Adventure',
      },
    ],
  };

  const countryTours = tours[query.country || 'Egypt'];

  return countryTours.map((tour, i) => ({
    id: `TOR${String(i + 1).padStart(3, '0')}`,
    title: tour.title,
    description: `Experience the best of ${
      query.country || 'Egypt'
    } with this ${tour.category} activity. Perfect for ${
      tour.type === 'adventure' ? 'thrill-seekers' : 'culture enthusiasts'
    }.`,
    type: tour.type,
    category: tour.category,
    images: [
      `https://images.unsplash.com/photo-${1553913861 + i * 1000}`,
      `https://images.unsplash.com/photo-${1568322445 + i * 1000}`,
    ],
    duration: tour.duration,
    languages: ['English', 'Arabic', ...(i % 2 === 0 ? ['French'] : [])],
    rating: 4.3 + (i % 7) * 0.1,
    reviews: 200 + i * 75,
    price: {
      amount: tour.price,
      currency: 'USD',
    },
    location: {
      city: query.city || 'Cairo',
      country: query.country || 'Egypt',
      coordinates: {
        latitude: 29.9792 + i * 0.02,
        longitude: 31.134 + i * 0.02,
      },
    },
    highlights: [
      'Expert local guide',
      'Hotel pickup included',
      'Small group experience',
      ...(tour.type === 'tour' ? ['Skip-the-line access'] : []),
      ...(tour.duration.includes('Full') ? ['Lunch included'] : []),
    ],
    included: [
      'Professional guide',
      'Transportation',
      'Entry tickets',
      ...(tour.duration.includes('Full') ? ['Meals'] : []),
    ],
    excluded: ['Personal expenses', 'Tips', 'Travel insurance'],
    minParticipants: tour.type === 'adventure' ? 2 : 1,
    maxParticipants: 15,
    ageRestriction: tour.type === 'adventure' ? '12+' : 'All ages',
    cancellationPolicy: 'Free cancellation up to 24 hours before',
  }));
}

// ============================================================================
// MOCK ADMIN DASHBOARD DATA
// ============================================================================

export async function mockAdminDashboard(): Promise<any> {
  await wait(200);

  return {
    metrics: {
      totalBookings: {
        count: 1247,
        trend: 12.5, // percentage
      },
      revenue: {
        amount: 523400,
        currency: 'USD',
        trend: 18.3,
      },
      activeUsers: {
        count: 892,
        trend: 7.2,
      },
      systemHealth: {
        status: 'healthy',
        uptime: 99.94,
      },
    },
    recentBookings: Array.from({ length: 10 }).map((_, i) => ({
      id: `BK${String(1000 + i).padStart(4, '0')}`,
      customerName: [
        'Ahmed Ali',
        'Sarah Johnson',
        'Mohammed Hassan',
        'Emily Chen',
      ][i % 4],
      destination: ['Cairo, Egypt', 'Dubai, UAE', 'Riyadh, Saudi Arabia'][
        i % 3
      ],
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      amount: 450 + i * 75,
      status: ['confirmed', 'pending', 'confirmed', 'confirmed'][i % 4],
    })),
    agentPerformance: {
      egypt: {
        dnaScore: 850,
        totalQueries: 12456,
        successRate: 98.2,
        avgResponseTime: 1.2,
      },
      saudi: {
        dnaScore: 875,
        totalQueries: 24567,
        successRate: 99.1,
        avgResponseTime: 0.9,
      },
      uae: {
        dnaScore: 825,
        totalQueries: 9876,
        successRate: 97.5,
        avgResponseTime: 1.4,
      },
    },
    chartData: {
      revenue: Array.from({ length: 30 }).map((_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000)
          .toISOString()
          .split('T')[0],
        amount: 15000 + Math.random() * 10000,
      })),
      bookingsByCountry: [
        { country: 'Egypt', count: 523 },
        { country: 'Saudi Arabia', count: 412 },
        { country: 'UAE', count: 312 },
      ],
    },
  };
}

// ============================================================================
// EXPORT ALL MOCK FUNCTIONS
// ============================================================================

export default {
  mockFlights,
  mockHotels,
  mockTours,
  mockAgentChat,
  mockAdminDashboard,
  wait,
  generateId,
};
