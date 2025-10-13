import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Hotel, MapPin, Star, Filter, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTripStore } from '@/store/tripStore';
import { mockFlights, mockHotels, mockActivities } from '@/lib/mockApi';
import { InteractiveStarRating } from '@/components/InteractiveStarRating';
import { ResultCardSkeleton } from '@/components/LoadingSkeleton';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Results() {
  const navigate = useNavigate();
  const { selectedItems, addSelectedItem, removeSelectedItem, getTotalCost } = useTripStore();
  const [activeTab, setActiveTab] = useState('flights');
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [starFilter, setStarFilter] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const amenities = [
    { id: 'wifi', name: 'Free WiFi', count: 145 },
    { id: 'pool', name: 'Swimming Pool', count: 98 },
    { id: 'parking', name: 'Free Parking', count: 112 },
    { id: 'breakfast', name: 'Breakfast Included', count: 87 },
    { id: 'gym', name: 'Fitness Center', count: 76 },
  ];

  const isItemSelected = (id: string) => selectedItems.some(item => item.id === id);
  
  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleToggleItem = (item: any, type: 'flight' | 'hotel' | 'activity') => {
    if (isItemSelected(item.id)) {
      removeSelectedItem(item.id);
      toast.info('Item removed from selection');
    } else {
      addSelectedItem({
        id: item.id,
        type,
        name: item.name || `${item.airline} ${item.from}-${item.to}` || item.name,
        price: item.price,
        details: item,
      });
      toast.success('Item added to selection');
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }
    navigate('/checkout');
  };

  // Filter Panel Component
  const FilterPanel = () => (
    <Card className="p-6 space-y-6">
      {/* Price Range */}
      <div>
        <Label className="text-base font-semibold mb-4 block">Price Range</Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={2000}
          step={50}
          className="mt-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>
      
      <Separator />
      
      {/* Star Rating */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Minimum Rating</Label>
        <InteractiveStarRating
          value={starFilter}
          onChange={setStarFilter}
          size="lg"
        />
      </div>
      
      <Separator />
      
      {/* Amenities */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Amenities</Label>
        <div className="space-y-3">
          {amenities.map(amenity => (
            <label key={amenity.id} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={selectedAmenities.includes(amenity.id)}
                onCheckedChange={() => toggleAmenity(amenity.id)}
              />
              <span className="text-sm flex-1 group-hover:text-primary transition-colors">
                {amenity.name}
              </span>
              <Badge variant="secondary" className="text-xs">
                {amenity.count}
              </Badge>
            </label>
          ))}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Search Results
          </h1>
          <p className="text-muted-foreground">Select your preferred options for the perfect trip</p>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
              <div className="py-4">
                <h3 className="text-lg font-semibold mb-4">Filters</h3>
                <FilterPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content with Sidebar */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filter Sidebar - Desktop Only */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              <FilterPanel />
            </div>
          </aside>

          {/* Results */}
          <main className="lg:col-span-3">

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="flights" className="gap-2">
              <Plane className="w-4 h-4" />
              Flights
            </TabsTrigger>
            <TabsTrigger value="hotels" className="gap-2">
              <Hotel className="w-4 h-4" />
              Hotels
            </TabsTrigger>
            <TabsTrigger value="activities" className="gap-2">
              <MapPin className="w-4 h-4" />
              Activities
            </TabsTrigger>
          </TabsList>

          {/* Flights */}
          <TabsContent value="flights" className="space-y-4">
            {mockFlights.map((flight, index) => (
              <Card
                key={flight.id}
                className={`animate-fade-in-up hover:shadow-elegant transition-all duration-300 ${
                  isItemSelected(flight.id) ? 'border-primary shadow-glow' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-primary rounded-lg">
                          <Plane className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{flight.airline}</h3>
                          <p className="text-sm text-muted-foreground">{flight.class}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <p className="font-medium">{flight.from}</p>
                          <p className="text-muted-foreground">{flight.departure}</p>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">{flight.duration}</p>
                            <div className="h-px w-20 bg-border relative">
                              <Plane className="w-3 h-3 absolute -top-1.5 left-1/2 -translate-x-1/2 text-primary" />
                            </div>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop`}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">{flight.to}</p>
                          <p className="text-muted-foreground">{flight.arrival}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${flight.price}</p>
                        <p className="text-xs text-muted-foreground">per person</p>
                      </div>
                      <Button
                        onClick={() => handleToggleItem(flight, 'flight')}
                        variant={isItemSelected(flight.id) ? 'default' : 'outline'}
                        className={isItemSelected(flight.id) ? 'bg-gradient-primary' : ''}
                      >
                        {isItemSelected(flight.id) ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Hotels */}
          <TabsContent value="hotels" className="space-y-4">
            {mockHotels.map((hotel, index) => (
              <Card
                key={hotel.id}
                className={`animate-fade-in-up hover:shadow-elegant transition-all duration-300 ${
                  isItemSelected(hotel.id) ? 'border-primary shadow-glow' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full lg:w-48 h-48 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{hotel.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {hotel.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: hotel.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm mb-3">{hotel.rooms}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.amenities.map((amenity, i) => (
                          <Badge key={i} variant="secondary">{amenity}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary">${hotel.price}</p>
                          <p className="text-xs text-muted-foreground">per night</p>
                        </div>
                        <Button
                          onClick={() => handleToggleItem(hotel, 'hotel')}
                          variant={isItemSelected(hotel.id) ? 'default' : 'outline'}
                          className={isItemSelected(hotel.id) ? 'bg-gradient-primary' : ''}
                        >
                          {isItemSelected(hotel.id) ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Activities */}
          <TabsContent value="activities" className="grid md:grid-cols-2 gap-4">
            {mockActivities.map((activity, index) => (
              <Card
                key={activity.id}
                className={`animate-fade-in-up hover:shadow-elegant transition-all duration-300 ${
                  isItemSelected(activity.id) ? 'border-primary shadow-glow' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img
                  src={activity.image}
                  alt={activity.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardContent className="p-6">
                  <Badge className="mb-2">{activity.category}</Badge>
                  <h3 className="text-lg font-semibold mb-2">{activity.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {activity.location} • {activity.duration}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="text-sm font-medium">{activity.rating}</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">${activity.price}</span>
                    </div>
                    <Button
                      onClick={() => handleToggleItem(activity, 'activity')}
                      variant={isItemSelected(activity.id) ? 'default' : 'outline'}
                      size="sm"
                      className={isItemSelected(activity.id) ? 'bg-gradient-primary' : ''}
                    >
                      {isItemSelected(activity.id) ? 'Selected' : 'Select'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
          </main>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elegant animate-slide-in-right z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{selectedItems.length} items selected</p>
                  <p className="text-2xl font-bold text-primary">${getTotalCost()}</p>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                size="lg"
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
