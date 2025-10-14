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
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={destination}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Status Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          {destination}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <DollarSign className="w-4 h-4" />
            <span>${budget.toLocaleString()} budget</span>
          </div>
        </div>

        {/* View Details Button */}
        <button className="w-full py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-white">
          View Details
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default TripCard;