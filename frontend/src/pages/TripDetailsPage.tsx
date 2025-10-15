import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Share2,
  Plane,
  Hotel,
  Utensils,
  Camera,
  Cloud,
  Info,
} from 'lucide-react';

interface ItineraryDay {
  day: number;
  date: string;
  activities: {
    time: string;
    title: string;
    description: string;
    icon: string;
  }[];
}

/**
 * TripDetailsPage - Detailed view of a single trip
 * 
 * Features:
 * - Trip header with destination, dates, status
 * - Tabbed interface (Itinerary, Budget, Bookings, Tips)
 * - Day-by-day itinerary timeline
 * - Budget breakdown with chart
 * - Booking links
 * - Cultural tips
 * - Weather forecast
 * - Edit/Delete actions
 */
const TripDetailsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'bookings' | 'tips'>('itinerary');

  // Mock trip data
  const trip = {
    id: '1',
    destination: 'Tokyo, Japan',
    country: 'Japan',
    startDate: '2024-03-15',
    endDate: '2024-03-22',
    budget: 2500,
    spent: 1200,
    status: 'planned' as const,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
  };

  const itinerary: ItineraryDay[] = [
    {
      day: 1,
      date: '2024-03-15',
      activities: [
        {
          time: '10:00 AM',
          title: 'Arrive at Narita Airport',
          description: 'Pick up JR Pass and take Narita Express to Tokyo',
          icon: '✈️',
        },
        {
          time: '2:00 PM',
          title: 'Check-in at Hotel',
          description: 'Hotel in Shinjuku district',
          icon: '🏨',
        },
        {
          time: '6:00 PM',
          title: 'Dinner at Ichiran Ramen',
          description: 'Try authentic tonkotsu ramen',
          icon: '🍜',
        },
      ],
    },
    {
      day: 2,
      date: '2024-03-16',
      activities: [
        {
          time: '9:00 AM',
          title: 'Visit Senso-ji Temple',
          description: 'Explore Tokyo\'s oldest temple in Asakusa',
          icon: '⛩️',
        },
        {
          time: '1:00 PM',
          title: 'Lunch at Tsukiji Market',
          description: 'Fresh sushi and seafood',
          icon: '🍣',
        },
        {
          time: '4:00 PM',
          title: 'Tokyo Skytree',
          description: 'Panoramic views of the city',
          icon: '🗼',
        },
      ],
    },
  ];

  const budgetBreakdown = [
    { category: 'Flights', amount: 800, color: '#3B82F6' },
    { category: 'Accommodation', amount: 600, color: '#10B981' },
    { category: 'Food', amount: 400, color: '#F59E0B' },
    { category: 'Activities', amount: 500, color: '#8B5CF6' },
    { category: 'Transportation', amount: 200, color: '#EC4899' },
  ];

  const bookings = [
    {
      type: 'Flight',
      provider: 'Japan Airlines',
      details: 'JL005 - LAX to NRT',
      date: '2024-03-15',
      price: 800,
      status: 'confirmed',
      link: '#',
    },
    {
      type: 'Hotel',
      provider: 'Shinjuku Grand Hotel',
      details: '7 nights, Standard Room',
      date: '2024-03-15',
      price: 600,
      status: 'confirmed',
      link: '#',
    },
  ];

  const culturalTips = [
    {
      title: 'Bowing Etiquette',
      description: 'Bowing is a common greeting. A slight bow (15°) is appropriate for casual situations.',
      icon: '🙇',
    },
    {
      title: 'Shoes Off Indoors',
      description: 'Remove shoes when entering homes, temples, and some restaurants.',
      icon: '👟',
    },
    {
      title: 'No Tipping',
      description: 'Tipping is not customary and can be considered rude in Japan.',
      icon: '💴',
    },
    {
      title: 'Quiet on Trains',
      description: 'Keep conversations quiet and phones on silent in public transportation.',
      icon: '🚇',
    },
  ];

  const handleBack = () => {
    console.log('Navigate back');
  };

  const handleEdit = () => {
    console.log('Edit trip');
  };

  const handleDelete = () => {
    console.log('Delete trip');
  };

  const handleShare = () => {
    console.log('Share trip');
  };

  const renderItinerary = () => (
    <div className="space-y-6">
      {itinerary.map((day) => (
        <motion.div
          key={day.day}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
              {day.day}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Day {day.day}</h3>
              <p className="text-sm text-gray-400">
                {new Date(day.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="space-y-4 ml-6 border-l-2 border-white/10 pl-6">
            {day.activities.map((activity, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-blue-500 border-4 border-slate-900" />
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-blue-400">{activity.time}</span>
                      <span className="text-gray-500">•</span>
                      <h4 className="text-white font-medium">{activity.title}</h4>
                    </div>
                    <p className="text-sm text-gray-400">{activity.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderBudget = () => (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-gray-400 mb-2">Total Budget</p>
          <p className="text-3xl font-bold text-white">${trip.budget.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-gray-400 mb-2">Spent</p>
          <p className="text-3xl font-bold text-blue-400">${trip.spent.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-gray-400 mb-2">Remaining</p>
          <p className="text-3xl font-bold text-green-400">
            ${(trip.budget - trip.spent).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Budget Breakdown */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-semibold text-white mb-6">Budget Breakdown</h3>
        <div className="space-y-4">
          {budgetBreakdown.map((item) => (
            <div key={item.category}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{item.category}</span>
                <span className="text-gray-400">${item.amount.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(item.amount / trip.budget) * 100}%`,
                    background: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-4">
      {bookings.map((booking, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                {booking.type === 'Flight' ? (
                  <Plane className="w-6 h-6 text-white" />
                ) : (
                  <Hotel className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{booking.type}</h3>
                <p className="text-sm text-gray-400 mb-1">{booking.provider}</p>
                <p className="text-sm text-gray-500">{booking.details}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm text-gray-400">{booking.date}</span>
                  <span className="text-sm font-semibold text-blue-400">
                    ${booking.price.toLocaleString()}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
            <a
              href={booking.link}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white"
            >
              View Booking
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderTips = () => (
    <div className="space-y-6">
      {/* Cultural Tips */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Cultural Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {culturalTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-4 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{tip.icon}</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">{tip.title}</h4>
                  <p className="text-sm text-gray-400">{tip.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weather Forecast */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Cloud className="w-6 h-6" />
          Weather Forecast
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Mon', 'Tue', 'Wed', 'Thu'].map((day, index) => (
            <div key={day} className="text-center p-4 rounded-xl bg-white/5">
              <p className="text-sm text-gray-400 mb-2">{day}</p>
              <p className="text-3xl mb-2">☀️</p>
              <p className="text-lg font-semibold text-white">22°C</p>
              <p className="text-xs text-gray-500">Sunny</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-bg p-6 space-y-6">
      {/* Header */}
      <div className="glass-effect rounded-2xl overflow-hidden">
        {/* Hero Image */}
        <div className="relative h-64 md:h-80">
          <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 p-2 rounded-lg bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Trip Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{trip.destination}</h1>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date(trip.startDate).toLocaleDateString()} -{' '}
                      {new Date(trip.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">${trip.budget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="p-3 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={handleEdit}
                  className="p-3 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                >
                  <Edit className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-3 rounded-lg bg-red-500/20 backdrop-blur-sm hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 bg-white/5">
          {[
            { id: 'itinerary', label: 'Itinerary', icon: MapPin },
            { id: 'budget', label: 'Budget', icon: DollarSign },
            { id: 'bookings', label: 'Bookings', icon: Plane },
            { id: 'tips', label: 'Tips', icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'itinerary' && renderItinerary()}
        {activeTab === 'budget' && renderBudget()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'tips' && renderTips()}
      </div>
    </div>
  );
};

export default TripDetailsPage;