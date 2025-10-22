import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Calendar, MapPin, Users, CheckCircle, XCircle, Clock, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface Booking {
  id: string;
  bookingRef: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  airline: string;
  from: string;
  to: string;
  departDate: string;
  departTime: string;
  arriveTime: string;
  passengers: number;
  class: string;
  price: number;
  bookedDate: string;
}

export function MyBookings() {
  const { t, language } = useLanguage();
  
  // Mock bookings data
  const [bookings] = useState<Booking[]>([
    {
      id: '1',
      bookingRef: 'AMR-2025-001',
      status: 'confirmed',
      airline: language === 'ar' ? 'مصر للطيران' : 'EgyptAir',
      from: language === 'ar' ? 'القاهرة' : 'Cairo',
      to: language === 'ar' ? 'دبي' : 'Dubai',
      departDate: '2025-11-15',
      departTime: '08:00',
      arriveTime: '12:30',
      passengers: 2,
      class: language === 'ar' ? 'درجة الأعمال' : 'Business',
      price: 8500,
      bookedDate: '2025-10-20',
    },
    {
      id: '2',
      bookingRef: 'AMR-2025-002',
      status: 'pending',
      airline: language === 'ar' ? 'طيران الإمارات' : 'Emirates',
      from: language === 'ar' ? 'القاهرة' : 'Cairo',
      to: language === 'ar' ? 'لندن' : 'London',
      departDate: '2025-12-01',
      departTime: '14:00',
      departTime: '18:45',
      passengers: 1,
      class: language === 'ar' ? 'الدرجة الاقتصادية' : 'Economy',
      price: 5200,
      bookedDate: '2025-10-22',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all');

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.departDate);
    const now = new Date();
    
    if (activeTab === 'upcoming') return bookingDate > now;
    if (activeTab === 'past') return bookingDate < now;
    return true;
  });

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return t('bookings.status.confirmed');
      case 'cancelled':
        return t('bookings.status.cancelled');
      case 'pending':
        return t('bookings.status.pending');
    }
  };

  const handleDownloadTicket = (booking: Booking) => {
    alert(`${t('bookings.downloading')} ${booking.bookingRef}`);
  };

  const handleSendEmail = (booking: Booking) => {
    alert(`${t('bookings.sending')} ${booking.bookingRef}`);
  };

  const handleCancelBooking = (booking: Booking) => {
    if (confirm(t('bookings.cancelConfirm'))) {
      alert(`${t('bookings.cancelled')} ${booking.bookingRef}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">{t('bookings.title')}</h1>
          <p className="text-muted-foreground">{t('bookings.subtitle')}</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'upcoming', 'past'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab)}
            >
              {t(`bookings.tab.${tab}`)}
            </Button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Plane className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('bookings.empty.title')}</h3>
              <p className="text-muted-foreground mb-6">{t('bookings.empty.subtitle')}</p>
              <Button onClick={() => window.location.href = '/search'}>
                {t('bookings.searchFlights')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg mb-1">
                          {booking.from} → {booking.to}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {t('bookings.reference')}: {booking.bookingRef}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span className="text-sm font-medium">
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {/* Airline */}
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t('bookings.airline')}</p>
                          <p className="font-medium">{booking.airline}</p>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t('bookings.departure')}</p>
                          <p className="font-medium">
                            {new Date(booking.departDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                          </p>
                          <p className="text-sm text-muted-foreground">{booking.departTime}</p>
                        </div>
                      </div>

                      {/* Passengers */}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t('bookings.passengers')}</p>
                          <p className="font-medium">
                            {booking.passengers} {t('bookings.person')}
                          </p>
                          <p className="text-sm text-muted-foreground">{booking.class}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <div className="w-4" /> {/* Spacer */}
                        <div>
                          <p className="text-xs text-muted-foreground">{t('bookings.total')}</p>
                          <p className="text-xl font-bold text-primary">
                            {booking.price.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {booking.status === 'confirmed' && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadTicket(booking)}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          {t('bookings.download')}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendEmail(booking)}
                          className="gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          {t('bookings.email')}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <XCircle className="h-4 w-4" />
                          {t('bookings.cancel')}
                        </Button>
                      </div>
                    )}

                    {booking.status === 'pending' && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button size="sm" className="flex-1">
                          {t('bookings.completePayment')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking)}
                        >
                          {t('bookings.cancel')}
                        </Button>
                      </div>
                    )}

                    {/* Booked Date */}
                    <p className="text-xs text-muted-foreground mt-4">
                      {t('bookings.bookedOn')}: {new Date(booking.bookedDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
