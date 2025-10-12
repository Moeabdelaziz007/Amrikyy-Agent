// ===== بطاقات اكتشاف الفنادق =====

import { motion, AnimatePresence } from 'framer-motion';
import type { HotelDiscovery } from '../../types/automation';
import { trackHotelClick } from '../../utils/analytics';

interface HotelDiscoveryCardsProps {
  hotels: HotelDiscovery[];
  onHotelClick?: (hotel: HotelDiscovery) => void;
}

export function HotelDiscoveryCards({
  hotels,
  onHotelClick,
}: HotelDiscoveryCardsProps) {
  if (hotels.length === 0) return null;

  const handleClick = (hotel: HotelDiscovery) => {
    trackHotelClick({
      hotelId: hotel.id,
      hotelName: hotel.name,
      price: hotel.price,
      source: 'discovery',
    });
    onHotelClick?.(hotel);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute bottom-32 left-6 right-6"
    >
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        <AnimatePresence>
          {hotels.map((hotel, index) => (
            <motion.div
              key={hotel.id}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              transition={{ delay: index * 0.3, type: 'spring' }}
              className="min-w-[280px] snap-start"
            >
              <div
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl hover:border-white/40 transition-all cursor-pointer"
                onClick={() => handleClick(hotel)}
              >
                {/* رأس البطاقة */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-bold text-lg">
                      {hotel.name}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm text-gray-300">
                        {hotel.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* نقاط AI */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.3 + 0.5 }}
                    className={`px-3 py-1 rounded-full ${
                      hotel.aiScore > 90
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400'
                        : hotel.aiScore > 75
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400'
                        : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400'
                    }`}
                  >
                    <p className="text-xs font-bold">
                      AI: {Math.round(hotel.aiScore)}
                    </p>
                  </motion.div>
                </div>

                {/* السعر */}
                <div className="bg-black/20 rounded-lg p-3 mb-3">
                  <p className="text-2xl font-bold text-white">
                    ${Math.round(hotel.price)}
                  </p>
                  <p className="text-xs text-gray-400">لكل ليلة</p>
                </div>

                {/* المميزات */}
                {hotel.highlights && hotel.highlights.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {hotel.highlights.slice(0, 3).map((highlight, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* زر العرض */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-2 rounded-lg font-medium transition-all"
                >
                  عرض التفاصيل
                </motion.button>

                {/* شارة "أفضل قيمة" */}
                {hotel.aiScore > 90 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.3 + 0.7, type: 'spring' }}
                    className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                  >
                    ⭐ الأفضل
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* مؤشر التمرير */}
      {hotels.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {hotels.map((_, index) => (
            <div key={index} className="w-2 h-2 rounded-full bg-white/30" />
          ))}
        </div>
      )}
    </motion.div>
  );
}
