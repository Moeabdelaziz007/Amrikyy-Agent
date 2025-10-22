/**
 * Test Google Maps Service Integration
 * Run: node backend/test-google-maps.js
 */

require('dotenv').config();
const googleMaps = require('./src/services/GoogleMapsService');

async function testGoogleMaps() {
  console.log('🗺️ Testing Google Maps Service Integration\n');
  
  try {
    // Test 1: Service Status
    console.log('1️⃣ Testing Service Status...');
    const status = googleMaps.getStatus();
    console.log('Status:', JSON.stringify(status, null, 2));
    console.log('✅ Service status OK\n');
    
    // Test 2: Search Hotels
    console.log('2️⃣ Testing Hotel Search...');
    const hotels = await googleMaps.searchHotels('Tokyo Shinjuku', { maxResults: 5 });
    console.log(`Found ${hotels.length} hotels:`);
    hotels.forEach((hotel, i) => {
      console.log(`  ${i + 1}. ${hotel.name}`);
      console.log(`     Address: ${hotel.address}`);
      console.log(`     Rating: ${hotel.rating || 'N/A'} (${hotel.userRatingsTotal || 0} reviews)`);
      console.log(`     Price Level: ${'$'.repeat(hotel.priceLevel || 1)}`);
    });
    console.log('✅ Hotel search OK\n');
    
    // Test 3: Search Restaurants
    console.log('3️⃣ Testing Restaurant Search...');
    const restaurants = await googleMaps.searchRestaurants('Paris', { maxResults: 3 });
    console.log(`Found ${restaurants.length} restaurants:`);
    restaurants.forEach((restaurant, i) => {
      console.log(`  ${i + 1}. ${restaurant.name}`);
      console.log(`     Address: ${restaurant.address}`);
      console.log(`     Rating: ${restaurant.rating || 'N/A'}`);
    });
    console.log('✅ Restaurant search OK\n');
    
    // Test 4: Search Attractions
    console.log('4️⃣ Testing Attractions Search...');
    const attractions = await googleMaps.searchAttractions('London', { maxResults: 3 });
    console.log(`Found ${attractions.length} attractions:`);
    attractions.forEach((attraction, i) => {
      console.log(`  ${i + 1}. ${attraction.name}`);
      console.log(`     Address: ${attraction.address}`);
    });
    console.log('✅ Attractions search OK\n');
    
    // Test 5: Geocoding
    console.log('5️⃣ Testing Geocoding...');
    const location = await googleMaps.geocodeAddress('Eiffel Tower, Paris');
    console.log('Location:', {
      address: location.formattedAddress,
      coordinates: `${location.lat}, ${location.lng}`
    });
    console.log('✅ Geocoding OK\n');
    
    // Test 6: Directions
    console.log('6️⃣ Testing Directions...');
    const directions = await googleMaps.getDirections(
      { lat: 48.8584, lng: 2.2945 }, // Eiffel Tower
      { lat: 48.8606, lng: 2.3376 }, // Louvre
      'WALK'
    );
    console.log('Route:', {
      distance: directions.distanceText,
      duration: directions.durationText
    });
    console.log('✅ Directions OK\n');
    
    console.log('🎉 All tests passed!');
    console.log('\n✅ Google Maps Service is fully operational!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if GOOGLE_MAPS_API_KEY is set in .env');
    console.error('2. Verify API key has required APIs enabled:');
    console.error('   - Places API (New)');
    console.error('   - Routes API');
    console.error('   - Geocoding API');
    console.error('3. Check API key restrictions (IP/HTTP referrer)');
    console.error('4. Verify billing is enabled in Google Cloud Console');
    process.exit(1);
  }
}

// Run tests
testGoogleMaps();
