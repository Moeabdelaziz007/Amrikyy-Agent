import React, { Suspense } from 'react';
import { useLazyLoad } from '../hooks/useLazyLoad';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

const DefaultFallback = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
  </div>
);

const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback = <DefaultFallback />,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const { ref, isIntersecting } = useLazyLoad({ threshold, rootMargin });

  return (
    <div ref={ref}>
      {isIntersecting ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

export default LazyComponent;