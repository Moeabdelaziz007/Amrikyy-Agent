import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Users, Plane, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface SearchFormData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: 'economy' | 'business' | 'first';
}

export function FlightSearch() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  
  const [formData, setFormData] = useState<SearchFormData>({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy',
  });

  const handleInputChange = (field: keyof SearchFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    // Validate
    if (!formData.from || !formData.to || !formData.departDate) {
      alert(t('search.error.required'));
      return;
    }

    if (tripType === 'roundtrip' && !formData.returnDate) {
      alert(t('search.error.returnDate'));
      return;
    }

    setIsSearching(true);

    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      // Navigate to results with search params
      navigate('/search/results', { 
        state: { 
          ...formData, 
          tripType 
        } 
      });
    }, 1500);
  };

  const popularDestinations = [
    { city: language === 'ar' ? 'القاهرة' : 'Cairo', code: 'CAI', country: language === 'ar' ? 'مصر' : 'Egypt' },
    { city: language === 'ar' ? 'دبي' : 'Dubai', code: 'DXB', country: language === 'ar' ? 'الإمارات' : 'UAE' },
    { city: language === 'ar' ? 'لندن' : 'London', code: 'LHR', country: language === 'ar' ? 'بريطانيا' : 'UK' },
    { city: language === 'ar' ? 'نيويورك' : 'New York', code: 'JFK', country: language === 'ar' ? 'أمريكا' : 'USA' },
    { city: language === 'ar' ? 'باريس' : 'Paris', code: 'CDG', country: language === 'ar' ? 'فرنسا' : 'France' },
    { city: language === 'ar' ? 'طوكيو' : 'Tokyo', code: 'NRT', country: language === 'ar' ? 'اليابان' : 'Japan' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }} />
        </div>
        
        <div className="container relative py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('search.hero.title')}
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {t('search.hero.subtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search Form */}
      <div className="container -mt-16 relative z-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-2xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-2xl">{t('search.title')}</CardTitle>
                
                {/* Trip Type Toggle */}
                <div className="flex gap-2 bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setTripType('roundtrip')}
                    className={`px-4 py-2 rounded-md transition-all ${
                      tripType === 'roundtrip'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-muted-foreground/10'
                    }`}
                  >
                    {t('search.roundtrip')}
                  </button>
                  <button
                    onClick={() => setTripType('oneway')}
                    className={`px-4 py-2 rounded-md transition-all ${
                      tripType === 'oneway'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-muted-foreground/10'
                    }`}
                  >
                    {t('search.oneway')}
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* From & To */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {t('search.from')}
                  </label>
                  <Input
                    placeholder={t('search.from.placeholder')}
                    value={formData.from}
                    onChange={(e) => handleInputChange('from', e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Plane className="h-4 w-4 text-muted-foreground" />
                    {t('search.to')}
                  </label>
                  <Input
                    placeholder={t('search.to.placeholder')}
                    value={formData.to}
                    onChange={(e) => handleInputChange('to', e.target.value)}
                    className="text-lg"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {t('search.depart')}
                  </label>
                  <Input
                    type="date"
                    value={formData.departDate}
                    onChange={(e) => handleInputChange('departDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {tripType === 'roundtrip' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {t('search.return')}
                    </label>
                    <Input
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => handleInputChange('returnDate', e.target.value)}
                      min={formData.departDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}
              </div>

              {/* Passengers & Class */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {t('search.passengers')}
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="9"
                    value={formData.passengers}
                    onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('search.class')}</label>
                  <select
                    value={formData.class}
                    onChange={(e) => handleInputChange('class', e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="economy">{t('search.class.economy')}</option>
                    <option value="business">{t('search.class.business')}</option>
                    <option value="first">{t('search.class.first')}</option>
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                size="lg"
                className="w-full text-lg"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('search.searching')}
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    {t('search.button')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Popular Destinations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold mb-6">{t('search.popular')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularDestinations.map((dest, index) => (
              <motion.div
                key={dest.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => handleInputChange('to', `${dest.city} (${dest.code})`)}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{dest.city}</h3>
                        <p className="text-sm text-muted-foreground">{dest.country}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{dest.code}</p>
                        <ArrowRight className="h-5 w-5 text-primary mt-1 ms-auto" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
