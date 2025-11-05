import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../contexts/AppContexts';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../lib/i18n';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge } from 'lucide-react';

interface WeatherData {
  city: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  icon: string;
}

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

const WeatherApp: React.FC = () => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();
  const currentText = translations.weather?.[lang] || {};

  const [city, setCity] = useState('Cairo');
  const [searchCity, setSearchCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);

  // Mock weather data - Replace with actual API call to OpenWeatherMap
  const mockWeatherData: WeatherData = {
    city: city,
    temperature: 28,
    feelsLike: 30,
    condition: 'Partly Cloudy',
    humidity: 45,
    windSpeed: 12,
    visibility: 10,
    pressure: 1013,
    icon: 'partly-cloudy'
  };

  const mockForecast: ForecastDay[] = [
    { day: 'Mon', high: 30, low: 20, condition: 'Sunny', icon: 'sunny' },
    { day: 'Tue', high: 28, low: 19, condition: 'Cloudy', icon: 'cloudy' },
    { day: 'Wed', high: 26, low: 18, condition: 'Rainy', icon: 'rainy' },
    { day: 'Thu', high: 27, low: 19, condition: 'Partly Cloudy', icon: 'partly-cloudy' },
    { day: 'Fri', high: 29, low: 21, condition: 'Sunny', icon: 'sunny' },
    { day: 'Sat', high: 31, low: 22, condition: 'Sunny', icon: 'sunny' },
    { day: 'Sun', high: 30, low: 21, condition: 'Cloudy', icon: 'cloudy' },
  ];

  useEffect(() => {
    // Load initial weather data
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    setLoading(true);
    // TODO: Replace with actual API call
    // const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
    // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    // const data = await response.json();
    
    // Simulate API delay
    setTimeout(() => {
      setCurrentWeather(mockWeatherData);
      setForecast(mockForecast);
      setLoading(false);
    }, 500);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      setCity(searchCity);
      loadWeatherData();
      setSearchCity('');
    }
  };

  const getWeatherIcon = (iconType: string) => {
    switch (iconType) {
      case 'sunny':
        return <Sun className="w-12 h-12 text-yellow-400" />;
      case 'rainy':
        return <CloudRain className="w-12 h-12 text-blue-400" />;
      case 'cloudy':
        return <Cloud className="w-12 h-12 text-gray-400" />;
      case 'partly-cloudy':
      default:
        return <Cloud className="w-12 h-12 text-gray-300" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background text-text overflow-hidden">
      {/* Header with Search */}
      <header className="p-4 border-b flex-shrink-0" style={{ borderColor: theme.colors.border }}>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder={currentText.searchCity || 'Search city...'}
            className="flex-1 px-4 py-2 rounded-lg bg-background border text-text focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ borderColor: theme.colors.border }}
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            {currentText.search || 'Search'}
          </button>
        </form>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Cloud className="w-16 h-16 text-primary" />
            </motion.div>
          </div>
        ) : currentWeather ? (
          <div className="space-y-6">
            {/* Current Weather Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl backdrop-blur-md border"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: theme.colors.border,
              }}
            >
              <h2 className="text-3xl font-bold mb-2">{currentWeather.city}</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getWeatherIcon(currentWeather.icon)}
                  <div>
                    <div className="text-6xl font-bold">{currentWeather.temperature}°</div>
                    <div className="text-text-secondary">{currentText.feelsLike || 'Feels like'} {currentWeather.feelsLike}°</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold">{currentWeather.condition}</div>
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
                  <Droplets className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-sm text-text-secondary">{currentText.humidity || 'Humidity'}</div>
                    <div className="font-semibold">{currentWeather.humidity}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
                  <Wind className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-sm text-text-secondary">{currentText.wind || 'Wind'}</div>
                    <div className="font-semibold">{currentWeather.windSpeed} km/h</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
                  <Eye className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-sm text-text-secondary">{currentText.visibility || 'Visibility'}</div>
                    <div className="font-semibold">{currentWeather.visibility} km</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
                  <Gauge className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-sm text-text-secondary">{currentText.pressure || 'Pressure'}</div>
                    <div className="font-semibold">{currentWeather.pressure} mb</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 7-Day Forecast */}
            <div>
              <h3 className="text-2xl font-bold mb-4">{currentText.sevenDayForecast || '7-Day Forecast'}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {forecast.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl backdrop-blur-md border text-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: theme.colors.border,
                    }}
                  >
                    <div className="font-semibold mb-2">{day.day}</div>
                    <div className="flex justify-center my-3">
                      {getWeatherIcon(day.icon)}
                    </div>
                    <div className="text-sm text-text-secondary mb-1">{day.condition}</div>
                    <div className="flex justify-center gap-2 text-sm">
                      <span className="font-semibold">{day.high}°</span>
                      <span className="text-text-secondary">{day.low}°</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Cloud className="w-24 h-24 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">{currentText.noData || 'No weather data available'}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WeatherApp;
