// Mock API responses and data
export const mockFlights = [
  {
    id: 'FL001',
    airline: 'Emirates',
    from: 'Cairo',
    to: 'Dubai',
    departure: '10:00 AM',
    arrival: '4:00 PM',
    duration: '4h',
    price: 450,
    stops: 0,
    class: 'Economy',
  },
  {
    id: 'FL002',
    airline: 'Saudia',
    from: 'Cairo',
    to: 'Riyadh',
    departure: '2:00 PM',
    arrival: '6:30 PM',
    duration: '2h 30m',
    price: 380,
    stops: 0,
    class: 'Economy',
  },
  {
    id: 'FL003',
    airline: 'EgyptAir',
    from: 'Cairo',
    to: 'Jeddah',
    departure: '8:00 AM',
    arrival: '11:00 AM',
    duration: '2h',
    price: 320,
    stops: 0,
    class: 'Economy',
  },
];

export const mockHotels = [
  {
    id: 'HT001',
    name: 'Burj Al Arab',
    location: 'Dubai, UAE',
    rating: 5,
    price: 850,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
    rooms: 'Deluxe Suite',
  },
  {
    id: 'HT002',
    name: 'Four Seasons Riyadh',
    location: 'Riyadh, Saudi Arabia',
    rating: 5,
    price: 650,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
    rooms: 'King Room',
  },
  {
    id: 'HT003',
    name: 'Steigenberger Cairo',
    location: 'Cairo, Egypt',
    rating: 4,
    price: 280,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Bar'],
    rooms: 'Standard Room',
  },
];

export const mockActivities = [
  {
    id: 'AC001',
    name: 'Desert Safari Adventure',
    location: 'Dubai',
    duration: '6 hours',
    price: 120,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3',
    category: 'Adventure',
  },
  {
    id: 'AC002',
    name: 'Pyramids & Sphinx Tour',
    location: 'Cairo',
    duration: '4 hours',
    price: 85,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1539768942893-daf53e448371',
    category: 'Cultural',
  },
  {
    id: 'AC003',
    name: 'Historic Jeddah Walking Tour',
    location: 'Jeddah',
    duration: '3 hours',
    price: 60,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0',
    category: 'Cultural',
  },
];

export const mockDashboardData = {
  metrics: {
    totalBookings: 1247,
    revenue: 485230,
    activeUsers: 892,
    avgResponseTime: '1.2s',
  },
  recentBookings: [
    {
      id: 'BK001',
      customer: 'Ahmed Hassan',
      destination: 'Dubai',
      amount: 1580,
      status: 'confirmed',
      date: '2025-10-15',
    },
    {
      id: 'BK002',
      customer: 'Sarah Mohamed',
      destination: 'Cairo',
      amount: 920,
      status: 'pending',
      date: '2025-10-14',
    },
  ],
  agentPerformance: [
    { name: 'Egypt AI Agent', queries: 450, satisfaction: 4.8, revenue: 125000 },
    { name: 'UAE AI Agent', queries: 380, satisfaction: 4.9, revenue: 185000 },
    { name: 'KSA AI Agent', queries: 417, satisfaction: 4.7, revenue: 175230 },
  ],
};

export const mockAIResponse = (userMessage: string): string => {
  const responses = [
    "I'd be delighted to help you plan your perfect trip! Based on your preferences, I recommend exploring the stunning architecture and vibrant culture. Would you like to know more about specific attractions?",
    "Great choice! The weather during your travel dates will be pleasant. I suggest booking accommodations in the city center for easy access to major attractions. Shall I show you some options?",
    "For your budget, I've found some excellent deals on flights and hotels. The best time to visit is definitely during this season. Would you like me to create a detailed itinerary?",
    "I can help arrange transportation, guided tours, and restaurant reservations. What specific experiences are you most interested in - cultural sites, adventure activities, or culinary experiences?",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

export const countries = [
  {
    name: 'Egypt',
    code: 'EG',
    description: 'Ancient wonders and timeless beauty',
    image: 'https://images.unsplash.com/photo-1539768942893-daf53e448371',
    highlights: ['Pyramids of Giza', 'Nile River', 'Luxor Temples', 'Red Sea'],
  },
  {
    name: 'Saudi Arabia',
    code: 'SA',
    description: 'Modern marvels meet rich heritage',
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0',
    highlights: ['Mecca', 'Riyadh', 'AlUla', 'Red Sea Coast'],
  },
  {
    name: 'United Arab Emirates',
    code: 'AE',
    description: 'Luxury, innovation, and tradition',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
    highlights: ['Burj Khalifa', 'Dubai Mall', 'Sheikh Zayed Mosque', 'Desert Safari'],
  },
];
