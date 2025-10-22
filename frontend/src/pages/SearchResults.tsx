import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plane, Clock, DollarSign, Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface Flight {
  id: string;
  airline: string;
  from: string;
  to: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  price: number;
  stops: number;
  class: string;
}

export function SearchResults() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state;

  // Mock flight data
  const [flights] = useState<Flight[]>([
    {
      id: '1',
      airline: language === 'ar' ? 'مصر للطيران' : 'EgyptAir',
      from: searchParams?.from || 'Cairo (CAI)',
      to: searchParams?.to || 'Dubai (DXB)',
      departTime: '08:00',
      arriveTime: '12:30',
      duration: '4h 30m',
      price: 3500,
      stops: 0,
      class: 'Economy',
    },
    {
      id: '2',
      airline: language === 'ar' ? 'طيران الإمارات' : 'Emirates',
      from: searchParams?.from || 'Cairo (CAI)',
      to: searchParams?.to || 'Dubai (DXB)',
      departTime: '14:00',
      arriveTime: '18:45',
      duration: '4h 45m',
      price: 4200,
      stops: 0,
      class: 'Economy',
    },
    {
      id: '3',
      airline: language === 'ar' ? 'الخطوط السعودية' : 'Saudia',
      from: searchParams?.from || 'Cairo (CAI)',
      to: searchParams?.to || 'Dubai (DXB)',
      departTime: '20:00',
      arriveTime: '01:15',
      duration: '5h 15m',
      price: 2800,
      stops: 1,
      class: 'Economy',
    },
  ]);

  const [sortBy, setSortBy] = useState<'price' | 'duration'>('price');

  const sortedFlights = [...flights].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    return a.duration.localeCompare(b.duration);
  });

  const handleBookFlight = (flight: Flight) => {
    navigate('/booking', { state: { flight, searchParams } });
  };

  if (!searchParams) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('search.results.noSearch')}</h1>
        <Button onClick={() => navigate('/search')}>
          {t('search.backToSearch')}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
          
          <h1 className="text-2xl font-bold">
            {t('search.results.title')}
          </h1>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 me-2" />
              {t('search.filter')}
            </Button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'duration')}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="price">{t('search.sort.price')}</option>
              <option value="duration">{t('search.sort.duration')}</option>
            </select>
          </div>
        </div>

        {/* Search Summary */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{searchParams.from}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">{searchParams.to}</span>
              </div>
              <div className="text-muted-foreground">
                {searchParams.departDate}
                {searchParams.returnDate && ` - ${searchParams.returnDate}`}
              </div>
              <div className="text-muted-foreground">
                {searchParams.passengers} {t('search.passengers')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          {flights.length} {t('search.results.found')}
        </p>

        {/* Flight Cards */}
        <div className="space-y-4">
          {sortedFlights.map((flight, index) => (
            <motion.div
              key={flight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-12 gap-4 items-center">
                    {/* Airline */}
                    <div className="md:col-span-2">
                      <h3 className="font-semibold">{flight.airline}</h3>
                      <p className="text-sm text-muted-foreground">{flight.class}</p>
                    </div>

                    {/* Flight Details */}
                    <div className="md:col-span-6">
                      <div className="flex items-center gap-4">
                        {/* Departure */}
                        <div className="flex-1">
                          <p className="text-2xl font-bold">{flight.departTime}</p>
                          <p className="text-sm text-muted-foreground">{flight.from}</p>
                        </div>

                        {/* Duration */}
                        <div className="flex-1 text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <div className="h-px flex-1 bg-border" />
                            <Plane className="h-4 w-4 text-muted-foreground" />
                            <div className="h-px flex-1 bg-border" />
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3" />
                            {flight.duration}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {flight.stops === 0 
                              ? t('search.nonstop')
                              : `${flight.stops} ${t('search.stop')}${flight.stops > 1 ? 's' : ''}`
                            }
                          </p>
                        </div>

                        {/* Arrival */}
                        <div className="flex-1 text-end">
                          <p className="text-2xl font-bold">{flight.arriveTime}</p>
                          <p className="text-sm text-muted-foreground">{flight.to}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price & Book */}
                    <div className="md:col-span-4 flex md:flex-col items-center md:items-end justify-between gap-4">
                      <div className="text-center md:text-end">
                        <p className="text-3xl font-bold text-primary flex items-center justify-end gap-1">
                          {flight.price.toLocaleString()}
                          <span className="text-sm font-normal">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{t('search.perPerson')}</p>
                      </div>
                      
                      <Button 
                        onClick={() => handleBookFlight(flight)}
                        className="w-full md:w-auto"
                      >
                        {t('search.book')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline">{t('search.loadMore')}</Button>
        </div>
      </div>
    </div>
  );
}
