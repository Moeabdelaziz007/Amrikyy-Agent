import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plane, DollarSign, MapPin, TrendingUp, Plus } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import TripCard from '../components/dashboard/TripCard';
import { useAuth } from '../components/Auth/AuthProvider';

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'planned' | 'ongoing' | 'completed';
  image: string;
}

/**
 * DashboardPage - User dashboard after login
 * 
 * Features:
 * - Welcome banner with user name
 * - Quick stats cards (trips, savings, destinations)
 * - Recent trips carousel
 * - Recommended destinations
 * - Quick actions
 */
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      destination: 'Tokyo, Japan',
      startDate: '2024-03-15',
      endDate: '2024-03-22',
      budget: 2500,
      status: 'planned',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    },
    {
      id: '2',
      destination: 'Paris, France',
      startDate: '2024-04-10',
      endDate: '2024-04-17',
      budget: 1800,
      status: 'planned',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400',
    },
    {
      id: '3',
      destination: 'Bali, Indonesia',
      startDate: '2024-02-01',
      endDate: '2024-02-10',
      budget: 1200,
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400',
    },
  ]);

  const stats = {
    totalTrips: trips.length,
    moneySaved: 3420,
    destinationsVisited: trips.filter((t) => t.status === 'completed').length,
  };

  const handleTripClick = (tripId: string) => {
    console.log('View trip:', tripId);
    // Navigate to trip details
  };

  return (
    <div className="min-h-screen gradient-bg p-6 lg:p-8 space-y-12">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect-enhanced p-8 rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-white">Welcome back, </span>
              <span className="amrikyy-text">{user?.email?.split('@')[0] || 'Traveler'}</span>
              <span className="text-white">!</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Ready to plan your next adventure? Let's make it amazing! ✨
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-medium text-white flex items-center gap-2 hover:shadow-lg transition-shadow"
          >
            <Plus className="w-5 h-5" />
            New Trip
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <StatCard
            title="Total Trips"
            value={stats.totalTrips}
            icon={Plane}
            trend={{ value: 12, isPositive: true }}
            color="#3B82F6"
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <StatCard
            title="Money Saved"
            value={`$${stats.moneySaved.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
            color="#10B981"
          />
        </motion.div>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <StatCard
            title="Destinations"
            value={stats.destinationsVisited}
            icon={MapPin}
            trend={{ value: 5, isPositive: true }}
            color="#8B5CF6"
          />
        </motion.div>
      </motion.div>

      {/* Recent Trips */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Trips</h2>
            <p className="text-gray-400 mt-1">Manage and track your travel plans</p>
          </div>
          <button className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
            View All →
          </button>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {trips.map((trip) => (
            <motion.div
              key={trip.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <TripCard {...trip} onClick={() => handleTripClick(trip.id)} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Recommended Destinations */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
            <p className="text-gray-400 mt-1">Based on your preferences and budget</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: 'Santorini',
              country: 'Greece',
              image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400',
              price: '$1,200',
            },
            {
              name: 'Dubai',
              country: 'UAE',
              image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
              price: '$1,800',
            },
            {
              name: 'New York',
              country: 'USA',
              image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
              price: '$2,200',
            },
            {
              name: 'Bangkok',
              country: 'Thailand',
              image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400',
              price: '$900',
            },
          ].map((dest, index) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{dest.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">{dest.country}</p>
                    <span className="text-sm font-semibold text-blue-400">{dest.price}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;