import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InteractiveStarRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showCount?: boolean;
  reviewCount?: number;
}

export const InteractiveStarRating = ({
  value = 0,
  onChange,
  maxStars = 5,
  size = 'md',
  readonly = false,
  showCount = false,
  reviewCount = 0,
}: InteractiveStarRatingProps) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayValue;
          
          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              whileHover={{ scale: readonly ? 1 : 1.2 }}
              whileTap={{ scale: readonly ? 1 : 0.9 }}
              className={cn(
                'transition-colors',
                !readonly && 'cursor-pointer'
              )}
              disabled={readonly}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-all duration-200',
                  isFilled
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-gray-300 dark:text-gray-600'
                )}
              />
            </motion.button>
          );
        })}
      </div>
      
      {showCount && reviewCount > 0 && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount.toLocaleString()} reviews)
        </span>
      )}
    </div>
  );
};

