import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign, ArrowRight } from 'lucide-react';

interface TripCardProps {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'planned' | 'ongoing' | 'completed';
  image: string;
  onClick?: () => void;
}

const TripCard: React.FC<TripCardProps> = ({
  destination,
  startDate,
  endDate,
  budget,
  status,
  image,
  onClick,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'planned':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'ongoing':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12, scale: 1.03 }}
      onClick={onClick}
      className="glass-effect-enhanced rounded-2xl overflow-hidden cursor-pointer group relative"
    >
      {/* Image with Overlay */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={destination}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Floating Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1.5 backdrop-blur-md rounded-full text-xs font-semibold border ${getStatusColor()}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          {destination}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="font-semibold">${budget.toLocaleString()}</span>
            <span className="text-gray-500">budget</span>
          </div>
        </div>

        {/* View Details Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-white/10 transition-all flex items-center justify-center gap-2 text-sm font-semibold text-white"
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
      
      {/* Hover Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" 
        style={{
          boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)'
        }} 
      />
    </motion.div>
  );
};

export default TripCard;