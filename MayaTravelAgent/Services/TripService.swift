import Foundation

/// Trip service for managing travel plans
class TripService {
    static let shared = TripService()
    
    private let api = APIService.shared
    private var cachedTrips: [TravelPlan] = []
    
    private init() {}
    
    // MARK: - Trip CRUD Operations
    
    func getTrips(userId: String? = nil) async throws -> [TravelPlan] {
        // TODO: Implement backend integration
        // For now, return mock data
        let mockTrips = [
            TravelPlan(
                id: "1",
                destination: "Tokyo, Japan",
                startDate: Date().addingTimeInterval(86400 * 30),
                endDate: Date().addingTimeInterval(86400 * 37),
                budget: 2500,
                travelers: 2,
                status: .planned,
                description: "Explore the vibrant city of Tokyo",
                activities: [
                    Activity(
                        name: "Visit Tokyo Tower",
                        description: "Iconic landmark with amazing views",
                        category: .sightseeing,
                        cost: 30
                    ),
                    Activity(
                        name: "Sushi Dinner",
                        description: "Authentic sushi experience",
                        category: .dining,
                        cost: 150
                    )
                ],
                expenses: [
                    Expense(
                        amount: 500,
                        category: .accommodation,
                        description: "Hotel booking deposit"
                    )
                ]
            ),
            TravelPlan(
                id: "2",
                destination: "Paris, France",
                startDate: Date().addingTimeInterval(86400 * 60),
                endDate: Date().addingTimeInterval(86400 * 65),
                budget: 3000,
                travelers: 2,
                status: .draft,
                description: "Romantic getaway to the City of Light"
            )
        ]
        
        cachedTrips = mockTrips
        return mockTrips
    }
    
    func getTrip(id: String) async throws -> TravelPlan? {
        // Check cache first
        if let trip = cachedTrips.first(where: { $0.id == id }) {
            return trip
        }
        
        // TODO: Fetch from backend
        return nil
    }
    
    func createTrip(_ trip: TravelPlan) async throws -> TravelPlan {
        // TODO: Implement backend integration
        cachedTrips.append(trip)
        return trip
    }
    
    func updateTrip(_ trip: TravelPlan) async throws -> TravelPlan {
        // TODO: Implement backend integration
        if let index = cachedTrips.firstIndex(where: { $0.id == trip.id }) {
            cachedTrips[index] = trip
        }
        return trip
    }
    
    func deleteTrip(id: String) async throws {
        // TODO: Implement backend integration
        cachedTrips.removeAll { $0.id == id }
    }
    
    // MARK: - Activities
    
    func addActivity(to tripId: String, activity: Activity) async throws {
        if let index = cachedTrips.firstIndex(where: { $0.id == tripId }) {
            cachedTrips[index].activities.append(activity)
        }
    }
    
    func removeActivity(from tripId: String, activityId: String) async throws {
        if let index = cachedTrips.firstIndex(where: { $0.id == tripId }) {
            cachedTrips[index].activities.removeAll { $0.id == activityId }
        }
    }
    
    // MARK: - Expenses
    
    func addExpense(to tripId: String, expense: Expense) async throws {
        if let index = cachedTrips.firstIndex(where: { $0.id == tripId }) {
            cachedTrips[index].expenses.append(expense)
        }
    }
    
    func removeExpense(from tripId: String, expenseId: String) async throws {
        if let index = cachedTrips.firstIndex(where: { $0.id == tripId }) {
            cachedTrips[index].expenses.removeAll { $0.id == expenseId }
        }
    }
    
    // MARK: - Destinations

    /// Get destinations with pagination support
    /// - Parameters:
    ///   - page: Page number (default: 1)
    ///   - limit: Number of destinations per page (default: 20)
    /// - Returns: Array of destinations
    func getDestinations(page: Int = 1, limit: Int = 20) async throws -> [Destination] {
        do {
            let response: DestinationsResponse = try await api.request(.destinations(page: page, limit: limit))
            return response.destinations
        } catch {
            // Fallback to mock data on API failure
            print("API call failed, using mock data: \(error.localizedDescription)")
            return getMockDestinations()
        }
    }

    /// Get destinations with search query and pagination
    /// - Parameters:
    ///   - query: Search query string
    ///   - page: Page number (default: 1)
    ///   - limit: Number of destinations per page (default: 20)
    /// - Returns: Array of destinations matching the search query
    func searchDestinations(query: String, page: Int = 1, limit: Int = 20) async throws -> [Destination] {
        do {
            let response: DestinationsResponse = try await api.request(.destinationsWithQuery(query: query, page: page, limit: limit))
            return response.destinations
        } catch {
            // Fallback to filtered mock data on API failure
            print("Search API call failed, using filtered mock data: \(error.localizedDescription)")
            let allDestinations = getMockDestinations()
            return filterDestinations(allDestinations, by: query)
        }
    }

    /// Get a single destination by ID
    /// - Parameter id: Destination ID
    /// - Returns: Destination if found, nil otherwise
    func getDestination(id: String) async throws -> Destination? {
        do {
            let response: DestinationResponse = try await api.request(.destination(id: id))
            return response.destination
        } catch {
            // Fallback to mock data on API failure
            print("Single destination API call failed, using mock data: \(error.localizedDescription)")
            let destinations = getMockDestinations()
            return destinations.first { $0.id == id }
        }
    }

    /// Legacy method for backward compatibility - gets first page of destinations
    func getDestinations() async throws -> [Destination] {
        return try await getDestinations(page: 1, limit: 20)
    }

    // MARK: - Private Helper Methods

    /// Get mock destinations for fallback
    private func getMockDestinations() -> [Destination] {
        return [
            Destination(
                id: "tokyo-001",
                name: "Tokyo",
                country: "Japan",
                description: "A vibrant metropolis blending ultra-modern and traditional culture",
                rating: 4.8,
                averageCost: 150,
                popularityScore: 95,
                bestTimeToVisit: "March-May",
                currency: "JPY"
            ),
            Destination(
                id: "paris-001",
                name: "Paris",
                country: "France",
                description: "The City of Light, known for art, fashion, and romance",
                rating: 4.9,
                averageCost: 200,
                popularityScore: 98,
                bestTimeToVisit: "April-June",
                currency: "EUR"
            ),
            Destination(
                id: "bali-001",
                name: "Bali",
                country: "Indonesia",
                description: "Tropical paradise with stunning beaches and rich culture",
                rating: 4.7,
                averageCost: 80,
                popularityScore: 85,
                bestTimeToVisit: "May-September",
                currency: "IDR"
            ),
            Destination(
                id: "dubai-001",
                name: "Dubai",
                country: "UAE",
                description: "Luxurious desert city with world-class shopping and architecture",
                rating: 4.6,
                averageCost: 180,
                popularityScore: 88,
                bestTimeToVisit: "November-March",
                currency: "AED"
            ),
            Destination(
                id: "nyc-001",
                name: "New York",
                country: "USA",
                description: "The city that never sleeps, a global hub of culture and finance",
                rating: 4.7,
                averageCost: 220,
                popularityScore: 92,
                bestTimeToVisit: "May-September",
                currency: "USD"
            ),
            Destination(
                id: "london-001",
                name: "London",
                country: "UK",
                description: "Historic capital with rich heritage and modern attractions",
                rating: 4.6,
                averageCost: 190,
                popularityScore: 90,
                bestTimeToVisit: "May-September",
                currency: "GBP"
            ),
            Destination(
                id: "sydney-001",
                name: "Sydney",
                country: "Australia",
                description: "Harbor city with iconic opera house and beautiful beaches",
                rating: 4.5,
                averageCost: 160,
                popularityScore: 82,
                bestTimeToVisit: "September-November",
                currency: "AUD"
            ),
            Destination(
                id: "rome-001",
                name: "Rome",
                country: "Italy",
                description: "Eternal city with ancient ruins and world-class cuisine",
                rating: 4.8,
                averageCost: 140,
                popularityScore: 94,
                bestTimeToVisit: "April-June",
                currency: "EUR"
            )
        ]
    }

    /// Filter destinations by search query
    private func filterDestinations(_ destinations: [Destination], by query: String) -> [Destination] {
        guard !query.isEmpty else { return destinations }

        return destinations.filter { destination in
            destination.name.localizedCaseInsensitiveContains(query) ||
            destination.country.localizedCaseInsensitiveContains(query) ||
            destination.description?.localizedCaseInsensitiveContains(query) == true
        }
    }
}

